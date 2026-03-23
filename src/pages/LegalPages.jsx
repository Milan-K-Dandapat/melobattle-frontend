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
          Melo Battle ("we", "our", "platform") values your privacy and ensures
          protection of your personal data.
        </p>

        <p>
          We collect limited information such as name, email, phone number, and
          transaction details for:
        </p>

        <ul className="list-disc ml-6">
          <li>User account creation</li>
          <li>Wallet transactions</li>
          <li>Security and fraud prevention</li>
          <li>Improving user experience</li>
        </ul>

        <p>
          We do NOT sell or rent your data. Your information may only be shared
          with:
        </p>

        <ul className="list-disc ml-6">
          <li>Secure payment gateways (Instamojo, etc.)</li>
          <li>Legal authorities if required by law</li>
        </ul>

        <p>
          All payments are processed via trusted third-party providers. We do
          not store sensitive financial data like card details.
        </p>

        <p>
          Users must be <b>18 years or older</b> to use this platform.
        </p>

        <p className="font-semibold text-purple-700">
          📧 Email: support@battle.meloapp.in
        </p>

        <p className="text-xs text-gray-500">
          Last updated: {new Date().getFullYear()}
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
        <p>By using Melo Battle, you agree to the following:</p>

        <ul className="list-disc ml-6">
          <li>You must be 18 years or older</li>
          <li>
            Melo Battle is a <b>skill-based quiz platform</b>, not gambling
          </li>
          <li>
            Entry fees may include a small platform fee for operations
          </li>
          <li>
            Any cheating, bot usage, or fraud will result in account suspension
          </li>
          <li>
            Winnings depend on skill, accuracy, and performance
          </li>
        </ul>

        <p>
          Melo Battle is not responsible for losses due to user decisions or
          gameplay performance.
        </p>

        <p>
          All disputes are governed by the laws of <b>India</b>.
        </p>

        <p className="font-semibold text-purple-700">
          Company: Melo Battle (India)
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
          Deposited wallet balance is non-withdrawable and is intended only for
          platform usage.
        </p>

        <p>Refunds are applicable only in the following cases:</p>

        <ul className="list-disc ml-6">
          <li>Payment deducted but not credited</li>
          <li>Duplicate payment</li>
          <li>Technical failure during contest entry</li>
        </ul>

        <p>
          Refund requests must be submitted within <b>48 hours</b>.
        </p>

        <p>
          Approved refunds will be processed within <b>5–7 business days</b>.
        </p>

        <p className="text-sm text-gray-500">
          Platform/service fees are non-refundable once a contest is joined.
        </p>

        <p className="font-semibold text-purple-700">
          📧 support@battle.meloapp.in
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
          For any queries, support, or payment issues, feel free to contact us.
        </p>

        <div className="space-y-2 text-sm">
          <p className="font-bold text-purple-600">
            📧 support@battle.meloapp.in
          </p>

          <p className="text-gray-600">
            🌐 Website: https://battle.meloapp.in
          </p>

          <p className="text-gray-600">
            📍 Location: India
          </p>

          <p className="text-gray-600">
            ⏱ Support Time: 10 AM – 8 PM (Mon–Sat)
          </p>
        </div>

        <p className="mt-6 text-gray-500 text-xs">
          We usually respond within 24 hours.
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