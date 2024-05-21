/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    backgroundColor: (theme) => ({
      ...theme("colors"),
      primary: "#060644",
      secondary: "#404040",
      tertiary: "#505050",
      customWhite: "#f9f9f9",
    }),
    textColor: (theme) => ({
      ...theme("colors"),
      customRed: "#ff1e1e",
      primary: "#060644",
      customGreen: "#006400",
      customOrange: "#f38f19", // No use
      customGrey: "#777777",
    }),
    boxShadow: (theme) => ({
      ...theme("colors"),
      btn: "rgba(0, 0, 0, 0.3) 0px 3px 6px 0px inset",
      board:
        "rgba(0, 0, 0, 0.2) 0px 20px 30px -6px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
      module:
        "rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px",
    }),

    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
