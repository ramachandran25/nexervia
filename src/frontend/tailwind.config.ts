import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        sidebar: "240px",
        topbar: "60px",
      },
    },
  },
  darkMode: "class",
} satisfies Config;