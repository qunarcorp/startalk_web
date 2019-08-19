module.exports = {
  extends: [
    'eslint-config-qunar/base'
  ].map(require.resolve),
  rules: {
    'prefer-arrow-callback': 0,
    'object-curly-newline': 0,
    'complexity': 0,
    'prefer-promise-reject-errors': 0
  }
};
