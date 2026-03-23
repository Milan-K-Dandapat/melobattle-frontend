import { motion } from "framer-motion";

const Section = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-4xl mx-auto my-10 p-8 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-xl border border-white/40"
  >
    <h2 className="text-3xl font-black mb-6 text-purple-700 tracking-tight">
      {title}
    </h2>
    <div className="text-gray-700 leading-relaxed space-y-4 text-sm md:text-base">
      {children}
    </div>
  </motion.div>
);

/* ================= PRIVACY ================= */
export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-indigo-100 p-6">
      <Section title="Privacy Policy">
        <p>
          Melo Battle respects your privacy and is committed to protecting your
          personal information.
        </p>

        <p>
          We collect limited user data such as name, email, phone number, and
          payment details strictly for account creation, wallet transactions,
          platform security, and improving user experience.
        </p>

        <p>
          We do NOT sell or share your personal data with third parties except:
        </p>

        <ul className="list-disc ml-6">
          <li>Payment gateways (for secure transactions)</li>
          <li>Legal authorities if required by law</li>
        </ul>

        <p>
          All transactions are processed via secure third-party payment
          providers and we do not store sensitive payment credentials.
        </p>

        <p>
          This platform is strictly intended for users aged 18 years or above.
        </p>

        <p className="font-semibold text-purple-700">
          Contact: support@battle.meloapp.in
        </p>
      </Section>
    </div>
  );
}

/* ================= TERMS ================= */
export function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-6">
      <Section title="Terms & Conditions">
        <p>By using Melo Battle, you agree to the following terms:</p>

        <ul className="list-disc ml-6">
          <li>You must be 18 years or older.</li>
          <li>
            Melo Battle is a skill-based quiz platform where users participate
            in knowledge-based contests.
          </li>
          <li>
            A platform fee may be charged on contest entries (not real money
            betting).
          </li>
          <li>
            Any fraudulent activity, cheating, or misuse will lead to permanent
            account suspension.
          </li>
          <li>
            Melo Battle does not guarantee winnings and results depend on user
            performance.
          </li>
        </ul>

        <p>
          All disputes are subject to jurisdiction under the laws of India.
        </p>
      </Section>
    </div>
  );
}

/* ================= REFUND ================= */
export function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-indigo-100 p-6">
      <Section title="Refund & Cancellation Policy">
        <p>
          Deposited wallet balance is non-withdrawable and can only be used
          within the Melo Battle platform for contest participation.
        </p>

        <p>Refunds are allowed only under the following conditions:</p>

        <ul className="list-disc ml-6">
          <li>Payment deducted but transaction failed</li>
          <li>Duplicate payment</li>
          <li>Technical error during contest entry</li>
        </ul>

        <p>
          Refund requests must be submitted within <b>48 hours</b> of the issue.
        </p>

        <p>
          Approved refunds will be processed within <b>5–7 business days</b>.
        </p>

        <p className="text-sm text-gray-500">
          Note: Platform fees are non-refundable once a contest is successfully
          joined.
        </p>
      </Section>
    </div>
  );
}

/* ================= CONTACT ================= */
export function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-6 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-xl p-10 rounded-3xl shadow-2xl bg-white text-center border border-white/40 backdrop-blur"
      >
        <h1 className="text-3xl font-black text-purple-700 mb-6 tracking-tight">
          Contact Us
        </h1>

        <p className="text-gray-700 mb-4">
          Need help or have questions? Our support team is here for you.
        </p>

        <p className="text-lg font-bold text-purple-600">
          support@battle.meloapp.in
        </p>

        <p className="mt-4 text-gray-500 text-sm">
          ⏱ Response time: within 24 hours
        </p>
      </motion.div>
    </div>
  );
}

/* ================= FOOTER ================= */
export function FooterLinks() {
  return (
    <footer className="text-center py-6 text-xs md:text-sm text-gray-600 bg-white/60 backdrop-blur border-t border-gray-200">
      <a className="mx-3 hover:text-purple-600 font-semibold" href="/privacy-policy">
        Privacy Policy
      </a>
      <a className="mx-3 hover:text-purple-600 font-semibold" href="/terms">
        Terms
      </a>
      <a className="mx-3 hover:text-purple-600 font-semibold" href="/refund-policy">
        Refund Policy
      </a>
      <a className="mx-3 hover:text-purple-600 font-semibold" href="/contact">
        Contact
      </a>
    </footer>
  );
}