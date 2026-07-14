const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || "noreply@wealthifyme.com";

  // If no credentials, log the email to console (fallback for local dev)
  if (!user || !pass) {
    console.log("-----------------------------------------");
    console.log("📬 DEV EMAIL DISPATCH FALLBACK:");
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log("HTML Content:\n", options.html);
    console.log("-----------------------------------------");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `"WealthifyMe" <${from}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email transmission error:", error);
    // Throw error so calling routes know mail sending failed
    throw error;
  }
};

module.exports = sendEmail;
