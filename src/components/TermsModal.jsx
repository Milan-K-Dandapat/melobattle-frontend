import { motion } from "framer-motion";

const TermsModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111827] max-w-2xl w-full p-8 rounded-2xl shadow-2xl border border-purple-500/20 overflow-y-auto max-h-[80vh]"
      >
        <h2 className="text-2xl font-bold mb-4 text-white">
          Terms & Conditions
        </h2>

        <div className="text-gray-300 text-sm space-y-4">

          <p>
            Welcome to MELO BATTLE. By accessing or using our platform,
            you agree to comply with and be bound by the following terms.
          </p>

          <p>
            1. You must be at least 18 years old to participate.
          </p>

          <p>
            2. MELO BATTLE operates as a skill-based competitive platform.
            Outcomes are determined by user performance and not by chance.
          </p>

          <p>
            3. Users are responsible for maintaining the confidentiality
            of their account credentials.
          </p>

          <p>
            4. Withdrawals are subject to platform rules and security checks.
          </p>

          <p>
            5. Any fraudulent activity, exploitation, or cheating will
            result in immediate suspension of account access.
          </p>

          <p>
            6. MELO BATTLE reserves the right to modify platform rules,
            prize structures, and policies without prior notice.
          </p>

          <p>
            7. By continuing, you consent to our Privacy Policy and data
            handling practices.
          </p>

        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default TermsModal;