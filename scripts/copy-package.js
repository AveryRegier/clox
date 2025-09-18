const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');

// Fields to include in the dist/package.json
const { name, version, license, author, description, keywords, dependencies } = packageJson;

const distPackageJson = {
  name,
  version,
  description,
  author,
  license,
  keywords,
  main: "index.js",
  types: "index.d.ts",
  module: "index.js",
  exports: {
    import: "./index.js",
    require: "./index.js"
  },
  dependencies
};

const distPath = path.join(__dirname, '../dist/package.json');

fs.writeFileSync(distPath, JSON.stringify(distPackageJson, null, 2));
console.log('package.json copied to dist directory with corrected paths');
