// Regenerate the annotated entry after changing index.html. No dependencies needed.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const main = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!main.includes('data-presentation="app"')) throw new Error('Main entry must use app presentation');
const notes = main.replace('data-presentation="app"', 'data-presentation="notes"')
  .replace('<head>', '<head>\n<base href="../"/>');
fs.mkdirSync(path.join(root, '1'), {recursive:true});
fs.writeFileSync(path.join(root, '1/index.html'), notes);
console.log('Generated /1/index.html from the main app.');
