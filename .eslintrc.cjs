const { settings } = require("cluster");

module.exports = {
  settings: {
    react: { version: "detect" },
  },
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: [
    "dist",
    "coverage",
    ".eslintrc.cjs",
    "vite.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "src/external/TdPlayground.js",
  ],
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ["@babel/preset-react"],
      babelrc: false,
      configFile: false,
    },
  },
  plugins: ["react", "react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};
