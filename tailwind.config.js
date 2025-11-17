/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FFB733",
          muted: "#FFF4E0",
          onColor: "#8B5A00",
        },
        limeBg: "#FFFFFF",
        surface: "#FFFFFF",
        accent: {
          gold: "#EAB000",
          goldOnColor: "#4D3A00",
          success: "#74D680",
          successOnColor: "#12391C",
          warning: "#FFB733",
          danger: "#F87171",
          info: "#60A5FA",
        },
        gray: {
          50: "#F8F9FA",
          100: "#E9ECEF",
          200: "#DEE2E6",
          300: "#CED4DA",
          400: "#ADB5BD",
          500: "#6C757D",
          600: "#495057",
          700: "#343A40",
          800: "#212529",
          900: "#0D0F12",
        },
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        md: "14px",
        lg: "18px",
        xl: "24px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 10px 24px -10px rgba(2, 6, 23, 0.15)",
        popover: "0 16px 32px -12px rgba(2, 6, 23, 0.2)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Manrope",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
