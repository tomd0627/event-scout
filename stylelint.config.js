'use strict';

module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  rules: {
    // Allow BEM naming (block__element--modifier)
    'selector-class-pattern': [
      /^[a-z][a-z0-9-]*(__[a-z][a-z0-9-]*)?(--[a-z][a-z0-9-]*)?$/,
      { message: 'Expected BEM-style class name (block__element--modifier)' },
    ],
    // Vendor prefix exceptions
    // ignoreProperties uses the unprefixed name
    'property-no-vendor-prefix': [true, { ignoreProperties: ['text-size-adjust'] }],
    // Organizational empty lines between custom property groups are intentional
    'custom-property-empty-line-before': null,
    // Allow both short (#fff) and long (#ffffff) hex notation
    'color-hex-length': null,
    // Disable: false positives when different components share svg/i selectors
    'no-descending-specificity': null,
    // Range notation: null to allow both legacy and modern syntax
    'media-feature-range-notation': null,
    'order/properties-alphabetical-order': true,
  },
};
