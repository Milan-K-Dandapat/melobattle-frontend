/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8B5CF6",
        secondary: "#06B6D4",
        accent: "#EC4899",
        darkBg: "#0B1120",
        cardBg: "rgba(30, 41, 59, 0.6)",
      },
      boxShadow: {
        glow: "0 0 25px rgba(139, 92, 246, 0.6)",
        glowStrong: "0 0 40px rgba(236, 72, 153, 0.7)",
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "gaming-gradient":
          "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.3), transparent 40%), radial-gradient(circle at 70% 70%, rgba(6,182,212,0.3), transparent 40%)",
      },
    },
  },
  plugins: [],
};
