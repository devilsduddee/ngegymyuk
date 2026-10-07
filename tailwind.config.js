module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#080808",
        surface: "#101010",
        elevated: "#171717",
        border: "rgba(255, 255, 255, 0.08)",
        primary: {
          DEFAULT: "#C7FF41",
          hover: "#B5F228",
        },
        accent: {
          DEFAULT: "#4DA6FF",
          hover: "#3394FF",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A3A3A3",
        },
        status: {
          success: "#22C55E",
          warning: "#EAB308",
          error: "#EF4444",
        },
      },
    },
  },
  plugins: [],
};
