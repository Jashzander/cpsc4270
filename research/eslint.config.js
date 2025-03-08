// @ts-nocheck
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

// Create a simplified configuration that avoids type conflicts
module.exports = [
  // TypeScript files
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2022,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "@angular-eslint": angular.plugin,
    },
    rules: {
      // TypeScript recommended rules
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Angular rules
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  
  // HTML templates
  {
    files: ["**/*.html"],
    plugins: {
      "@angular-eslint/template": angular.plugin,
    },
    rules: {
      "@angular-eslint/template/accessibility-alt-text": "error",
      "@angular-eslint/template/accessibility-elements-content": "error",
      "@angular-eslint/template/accessibility-label-for": "error",
      "@angular-eslint/template/no-any": "error",
    },
  }
];
