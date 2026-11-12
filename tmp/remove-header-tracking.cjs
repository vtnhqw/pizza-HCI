const fs=require('fs');
let html=fs.readFileSync('index.html','utf8');
const pattern=/<button class="iconbtn" data-action="go-orders" aria-label="Track orders" title="Track orders">[^<]*<\/button>/g;
if((html.match(pattern)||[]).length!==1)throw new Error('Expected exactly one header tracking button');
html=html.replace(pattern,'');
fs.writeFileSync('index.html',html);
if(!html.includes("['Orders','clipboard-list','orders']"))throw new Error('Orders navigation missing');
console.log('Removed duplicate header tracking button; bottom Orders tab retained.');
