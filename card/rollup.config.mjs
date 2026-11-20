import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/arr-card.ts",
  output: {
    file: "../custom_components/arr_dashboard/frontend/arr-dashboard-card.js",
    format: "es",
  },
  plugins: [
    resolve(),
    typescript({ exclude: ["**/*.test.ts", "**/test-setup.ts"] }),
  ],
  onwarn(warning, warn) {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    warn(warning);
  },
};