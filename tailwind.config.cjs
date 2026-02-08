/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "chat-black": "rgb(39 39 42/var(--tw-bg-opacity))",
      },
      animation: {
        blink: "blink 1.2s infinite steps(1, start)",
      },
      keyframes: {
        blink: {
          "0%, 100%": { "background-color": "currentColor" },
          "50%": { "background-color": "transparent" },
        },
      },
    },
  },
  plugins: [],
  variants: {
    extend: {
      borderColor: ["dark"],
      backgroundColor: ["dark"],
      textColor: ["dark"],
      // ... 其他工具类
    },
  },
};
