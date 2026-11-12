const fs=require('fs');let s=fs.readFileSync('index.html','utf8');
s=s.replace('<h3>Build your<br/>perfect pizza</h3>','<h3>Build your perfect pizza</h3>');
s=s.replace('<button class="linkbtn" data-action="clear-search">${q?\'Clear search\':\'\'}</button>', '${q?\'<button class="linkbtn" data-action="clear-search">Clear search</button>\':\'\'}');
new Function(s.match(/<script>([\s\S]*?)<\/script>/)[1]);
fs.writeFileSync('index.html',s);
for(const file of ['visual.css','assets/pizza-hero.png','assets/menu-photography.png','assets/pizzazz-mark.svg'])if(!fs.existsSync(file))throw Error('Missing asset '+file);
console.log('App script syntax valid; all local visual assets exist.');
