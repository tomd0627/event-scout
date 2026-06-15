const path = require('path');

const rel = (files) => files.map((f) => path.relative(process.cwd(), f).replace(/\\/g, '/'));

module.exports = {
  '*.css': (files) => {
    const paths = rel(files).join(' ');
    return [`stylelint --fix ${paths}`, `prettier --write ${paths}`];
  },
  '*.js': (files) => {
    const paths = rel(files).join(' ');
    return [`eslint --fix ${paths}`, `prettier --write ${paths}`];
  },
  '*.html': (files) => {
    const paths = rel(files).join(' ');
    return [`html-validate ${paths}`, `prettier --write ${paths}`];
  },
  '*.{json,md}': (files) => {
    const paths = rel(files).join(' ');
    return `prettier --write ${paths}`;
  },
};
