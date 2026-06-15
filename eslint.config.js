var js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        Array: 'readonly',
        String: 'readonly',
        Promise: 'readonly',
      },
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': 'warn',
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
  // app.js calls functions defined in the other script files loaded before it
  {
    files: ['js/app.js'],
    languageOptions: {
      globals: {
        scout: 'readonly',
        renderEvents: 'readonly',
        renderSkeleton: 'readonly',
        renderEmpty: 'readonly',
        renderError: 'readonly',
      },
    },
  },
  {
    ignores: ['node_modules/**', '*.config.js', '*.config.cjs'],
  },
];
