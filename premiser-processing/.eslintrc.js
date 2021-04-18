module.exports = {
  parser: "@babel/eslint-parser",
  parserOptions: {
    "ecmaFeatures": {
      "jsx": true
    },
    babelOptions: {
      rootMode: "upward",
    },
  },
  env: {
    "es6": true,
    "node": true
  },
  "plugins": [
    "promise"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:promise/recommended",
  ],
  "rules": {
    "indent": [
      "warn",
      2,
      { "SwitchCase": 1 }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-cond-assign": [
      "error",
      "except-parens"
    ],
    "no-restricted-globals": [
      "error",
      // Use bluebird
      "Promise"
    ],
    "no-unused-vars": [
      "error",
      {
        "vars": "all",
        // Allow us to define unused function parameters; this helps document parameters that may be used in the future
        "args": "none",
        // Allow us to pluck out properties by naming them specifically and then using a rest property.  E.g.:
        // const { toIgnore, ...rest} = someProps
        "ignoreRestSiblings": true
      }
    ],
    // promise/valid-params incorrectly warns for Bluebird.catch with 2+ arguments (which is correct invocation.)
    "promise/valid-params": "off",
    "semi": [
      "error",
      "never"
    ],
  },
  "overrides": [
    {
      "files": "*.test.js",
      "globals": {
        "describe": false,
        "expect": false,
        "test": false,
      }
    }
  ],
};
