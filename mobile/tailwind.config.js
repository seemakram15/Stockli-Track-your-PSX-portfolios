/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas:  "var(--canvas)",
        card:    "var(--card)",
        card2:   "var(--card2)",
        border:  "var(--bdr)",
        fg:      "var(--fg)",
        muted:   "var(--fg-muted)",
        primary: "var(--primary)",
        gain:    "var(--gain)",
        loss:    "var(--loss)",
        warn:    "var(--warn)",
        sky:     "var(--sky)",
        emerald: "var(--emerald)",
        orange:  "var(--orange)",
        amber:   "var(--amber)",
        /* legacy aliases so existing code keeps working */
        accent: {
          DEFAULT: "var(--primary)",
          dim:     "var(--primary)",
          text:    "var(--primary)",
        },
        surface: {
          DEFAULT: "var(--card)",
          2:       "var(--card2)",
        },
        text: "var(--fg)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
    },
  },
  plugins: [],
};
