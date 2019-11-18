module.exports = {
  parser: 'babel-eslint',
  extends: 'airbnb',
  env: {
    browser: true
  },
  rules: {
    'comma-dangle': 0,
    'no-param-reassign': 0, // comeback to this,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'react/sort-comp': 0,
    'react/jsx-filename-extension': 0,
    'react/no-string-refs': 0,
    'react/forbid-prop-types': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'no-mixed-operators': 0,
    'function-paren-newline': 0
  },
  overrides: [
    {
      files: ['tests/**/*test.js'],
      env: {
        mocha: true
      },
      rules: {
        'import/extensions': 0,
        'import/no-unresolved': 0,
        'import/no-extraneous-dependencies': 0
      }
    }
  ]
};
