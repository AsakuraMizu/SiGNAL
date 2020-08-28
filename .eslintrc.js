module.exports = {
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'airbnb-typescript/base'
  ],
  rules: {
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off'
  }
};