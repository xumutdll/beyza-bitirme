/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    backgroundColor: (theme) => ({
      ...theme("colors"),
      primary: "#060644",
      secondary: "#404040",
      tertiary: "#606060",
      customBlack: "#202020",
      customWhite: "#f0f0f0",
      blurryWhite: "#dddddd",
    }),
    textColor: (theme) => ({
      ...theme("colors"),
      customRed: "#ff1e1e",
      primary: "#495057",
      customGreen: "#006400",
      customOrange: "#f38f19", // No use
      customGrey: "#777777",
    }),
    boxShadow: (theme) => ({
      ...theme("colors"),
      btnBar: "rgba(0, 0, 0, 0.3) 0px 3px 6px 0px inset",
      btn: "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
      board: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
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
