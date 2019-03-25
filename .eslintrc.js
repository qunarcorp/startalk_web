module.exports = {
  extends: [
    // 'eslint-config-qunar'
  ].map(require.resolve),
  rules: {
    'react/prop-types': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'react/no-danger': 0,
    'complexity': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0
  }
};
