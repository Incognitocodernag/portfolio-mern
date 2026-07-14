import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last updated: June 18, 2026</p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl p-8 border border-slate-200 dark:border-dark-border space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Information We Collect</h3>
          <p>
            At WealthifyMe, we respect your privacy. We collect information you provide directly to us when creating an account, including your name, email address, and account password (stored securely as a salted hash). We also store financial transaction records and household data that you explicitly enter into the system.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">2. How We Use Your Information</h3>
          <p>
            We use the collected information solely to provide, maintain, and optimize the core features of WealthifyMe, including authenticating your session, aggregating your transactions for analytics reports, and facilitating shared household budgets between members. We do not sell or monetize your financial data in any way.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Data Security</h3>
          <p>
            We implement industry-standard security measures (including JWT tokens, password hashing, and encrypted database networks) to prevent unauthorized access, alteration, disclosure, or destruction of your personal information.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Cookies and Telemetry</h3>
          <p>
            We use cookies to maintain your active authentication session and load your preferences. With your consent, we also collect lightweight anonymous usage metrics to help us fix bug loops and optimize page loading performance. You can adjust your consent choices at any time in your Settings.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">5. Contact Us</h3>
          <p>
            If you have any questions or concerns regarding this Privacy Policy, please submit a bug/support ticket via the support route or reach out to us directly.
          </p>
        </section>
      </div>

      <div className="text-center">
        <Link to="/" className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-500 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
