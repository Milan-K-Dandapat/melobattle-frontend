import { useEffect } from "react";

const Section = ({ title, children }) => (
  <div className="max-w-4xl mx-auto my-10 p-8 rounded-2xl shadow-xl bg-white/80 backdrop-blur">
    <h2 className="text-2xl font-bold mb-4 text-purple-700">{title}</h2>
    <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
  </div>
);

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-6">
      <Section title="Privacy Policy">
        <p>
          Melo Battle respects your privacy. We collect limited personal
          information such as name, email, phone number, and payment details
          only for providing services.
        </p>
        <p>
          Information collected is used for account creation, wallet
          transactions, platform security, and improving user experience.
        </p>
        <p>
          We never sell user data. Information may only be shared with payment
          processors or when required by law.
        </p>
        <p>Users must be 18 years or older to use this platform.</p>
        <p>Contact: support@battle.meloapp.in</p>
      </Section>
    </div>
  );
}

export function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
      <Section title="Terms & Conditions">
        <p>Users must be at least 18 years old to use Melo Battle.</p>
        <p>
          Melo Battle hosts skill-based quiz competitions where players compete
          using knowledge and accuracy.
        </p>
        <p>
          The platform may charge a small platform fee from contest entries.
        </p>
        <p>
          Accounts involved in cheating, fraud, or abuse may be permanently
          suspended.
        </p>
        <p>All disputes are governed by the laws of India.</p>
      </Section>
    </div>
  );
}

export function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-6">
      <Section title="Refund Policy">
        <p>
          Deposited wallet balance can only be used inside the Melo Battle
          platform.
        </p>
        <p>Refunds are allowed only in these situations:</p>
        <ul className="list-disc ml-6">
          <li>Payment deducted but transaction failed</li>
          <li>Duplicate payment</li>
          <li>Technical error during contest entry</li>
        </ul>
        <p>
          Refund requests must be submitted within 48 hours. Approved refunds
          will be processed within 5–7 business days.
        </p>
      </Section>
    </div>
  );
}

export function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6 flex items-center justify-center">
      <div className="max-w-xl p-10 rounded-2xl shadow-xl bg-white text-center">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">Contact Us</h1>
        <p className="text-gray-700 mb-4">
          If you have questions or need help, contact the Melo Battle support
          team.
        </p>
        <p className="text-lg font-semibold">support@battle.meloapp.in</p>
        <p className="mt-4 text-gray-600">Response time: within 24 hours</p>
      </div>
    </div>
  );
}

export function FooterLinks() {
  return (
    <footer className="text-center py-6 text-sm text-gray-600">
      <a className="mx-3 hover:text-purple-600" href="/privacy-policy">
        Privacy Policy
      </a>
      <a className="mx-3 hover:text-purple-600" href="/terms">
        Terms
      </a>
      <a className="mx-3 hover:text-purple-600" href="/refund-policy">
        Refund Policy
      </a>
      <a className="mx-3 hover:text-purple-600" href="/contact">
        Contact
      </a>
    </footer>
  );
}
