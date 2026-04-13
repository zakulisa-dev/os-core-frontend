module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.eslint.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint",
    "prettier",
    "react",
    "react-hooks",
    "jsx-a11y"
  ],
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  rules: {
    "object-curly-newline": 0,
    "import/prefer-default-export": 0,
    "max-len": 0,
    "react/require-default-props": 0,
    "jsx-a11y/click-events-have-key-events": 0,
    "no-mixed-operators": 0,
    "operator-linebreak": 0,
    "react/react-in-jsx-scope": 0,
    "no-plusplus": 0,
    "jsx-a11y/no-autofocus": 0,
    "react/jsx-props-no-spreading": 0,
    "no-continue": 0,
    "react/jsx-no-bind": 0,
    "react-hooks/exhaustive-deps": 0,
    "no-param-reassign": ['error', {
      props: true, ignorePropertyModificationsFor: [
        'state',
        'video',
        'audio',
        'e',
        'event',
        'target',
        'currentTarget',
        'nextSibling',
        'previousSibling',
        'parentElement'
      ]
    }],
    "testing-library/no-unnecessary-act": 0,
    "@typescript-eslint/no-unused-vars": 1,
    "import/extensions": 0,
    "react/prop-types": 0
  },
  settings: {
    react: {
      version: "detect"
    },
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json"
      }
    }
  }
};