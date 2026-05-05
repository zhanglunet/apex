import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        muted: "#607080",
        line: "#dce3ea",
        panel: "#f7f9fb",
        accent: "#176b87",
        signal: "#e6a23c",
      },
    },
  },
  plugins: [],
};

export default config;
