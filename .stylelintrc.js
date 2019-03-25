module.exports = {
  extends: 'stylelint-config-standard',
  rules: {
    'at-rule-empty-line-before': null,
    'selector-pseudo-class-no-unknown': [true, {
      ignorePseudoClasses: ['global']
    }],
    'font-family-no-missing-generic-family-keyword': null,
    'no-descending-specificity': null
  }
};
