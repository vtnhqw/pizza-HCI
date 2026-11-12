const fs=require('fs');
let s=fs.readFileSync('index.html','utf8').replaceAll('assets/pizzazz-mark.svg','assets/pizzazz-logo.png').replace('type="image/svg+xml" href="assets/pizzazz-logo.png"','type="image/png" href="assets/pizzazz-logo.png"');
s=s.replace('<link rel="icon" type="image/png" href="assets/pizzazz-logo.png"/>','<link rel="icon" type="image/png" href="assets/pizzazz-logo.png"/>\n<link rel="apple-touch-icon" href="assets/pizzazz-logo.png"/>');
fs.writeFileSync('index.html',s);
fs.appendFileSync('assets/README.md','\n## App logo\n\n`pizzazz-logo.png` is an unchanged copy of the user-provided `Glossy Pizza P Icon.png`. Used for the welcome and Home brand marks, browser favicon, and Apple touch icon. The older SVG is retained as an unused legacy asset.\n');
fs.appendFileSync('PROJECT.md','\n## App branding (2026-11-12)\n\nThe user-provided Glossy Pizza P Icon.png is copied unchanged to assets/pizzazz-logo.png and used for welcome/Home branding, the browser favicon and Apple touch icon.\n');
