const express = require("express");
const router = express.Router();

let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn("⚠️ STRIPE_SECRET_KEY is not defined in environment. Stripe integration is disabled.");
  stripe = {
    customers: {
      create: async () => { throw new Error("Stripe is not configured on this server"); }
    },
    checkout: {
      sessions: {
        create: async () => { throw new Error("Stripe is not configured on this server"); }
      }
    },
    webhooks: {
      constructEvent: () => { throw new Error("Stripe is not configured on this server"); }
    },
    subscriptions: {
      retrieve: async () => { throw new Error("Stripe is not configured on this server"); }
    }
  };
}

const User = require("../models/User");
const { protect } = require("../middleware/auth");

// ── 1. Create Checkout Session ──────────────────────────────────────
router.post("/checkout", protect, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure user has a Stripe Customer ID
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID; // Price ID from Stripe Dashboard

    if (!proPriceId) {
      return res.status(400).json({ 
        message: "Stripe Price ID is missing in server environment. Cannot start checkout." 
      });
    }

    // Create session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${frontendUrl}/settings?payment=success`,
      cancel_url: `${frontendUrl}/pricing?payment=cancel`,
      client_reference_id: user._id.toString(),
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    res.status(500).json({ message: "Failed to initiate Stripe payment checkout session" });
  }
});

// ── 2. Handle Stripe Webhook Events ──────────────────────────────────
// Express raw parser is applied at server.js level before global app.use(express.json())
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
  } catch (err) {
    console.error("⚠️ Webhook Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription;

        // Retrieve subscription details to get period end dates
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const updateData = {
          subscriptionStatus: "pro",
          stripeSubscriptionId: subscriptionId,
          subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
        };

        // If client reference id isn't populated, match by Stripe customer ID
        if (userId) {
          await User.findByIdAndUpdate(userId, updateData);
          console.log(`✅ User ${userId} upgraded to PRO via client reference.`);
        } else {
          const matchedUser = await User.findOneAndUpdate(
            { stripeCustomerId: session.customer },
            updateData
          );
          if (matchedUser) {
            console.log(`✅ User ${matchedUser._id} upgraded to PRO via customer match.`);
          } else {
            console.warn(`⚠️ No user found for customer ID: ${session.customer}`);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await User.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            {
              subscriptionStatus: "pro",
              subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
          );
          console.log(`✅ Subscription ${subscriptionId} renewal logged successfully.`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        // Gracefully handle payment failure: fallback to free tier
        if (subscriptionId) {
          await User.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            { subscriptionStatus: "free" }
          );
          console.log(`❌ Renewal payment failed for subscription: ${subscriptionId}. Reverted to FREE tier.`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          { 
            subscriptionStatus: "free",
            stripeSubscriptionId: null,
            subscriptionPeriodEnd: null
          }
        );
        console.log(`🗑️ Subscription ${subscription.id} cancelled/expired. Downgraded to FREE tier.`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const status = subscription.status === "active" ? "pro" : "free";
        await User.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          { 
            subscriptionStatus: status,
            subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
          }
        );
        console.log(`🔄 Subscription ${subscription.id} status updated to: ${status}.`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
    
    // Return 200 to acknowledge receipt of event
    res.json({ received: true });
  } catch (error) {
    console.error("❌ Error handling Stripe webhook event:", error);
    // Return 500 to let Stripe know the handler failed, forcing a retry
    res.status(500).json({ message: "Webhook event processing error" });
  }
});

module.exports = router;
