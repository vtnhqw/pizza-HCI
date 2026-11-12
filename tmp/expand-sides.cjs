const fs=require('fs');let s=fs.readFileSync('index.html','utf8');
const entries=[
{id:'garlic-bread',name:'Garlic Bread',description:'Four toasted slices with garlic butter & parsley',price:6.90,emoji:'🍟',category:'Sides'},
{id:'mozzarella-sticks',name:'Mozzarella Sticks',description:'Five crispy cheese sticks with marinara dip',price:9.90,emoji:'🍟',category:'Sides'},
{id:'potato-wedges',name:'Potato Wedges',description:'Golden skin-on wedges with savoury seasoning',price:7.90,emoji:'🍟',category:'Sides'},
{id:'mushroom-soup',name:'Mushroom Soup',description:'Creamy mushroom soup finished with parsley',price:6.50,emoji:'🍟',category:'Sides'}];
const line=s.match(/const PIZZAS=\[.*?\];/)[0];s=s.replace(line,line.slice(0,-2)+','+entries.map(x=>JSON.stringify(x)).join(',')+'];');fs.writeFileSync('index.html',s);
let css='\n/* Additional side photography: two columns, two rows. */\n';entries.forEach((p,i)=>{css+=`.food-photo[data-food="${p.id}"]{background-image:url('assets/sides-menu.png');background-size:200% 200%;background-position:${i%2?100:0}% ${Math.floor(i/2)*100}%}\n`});fs.appendFileSync('visual.css',css);
fs.appendFileSync('PROJECT.md','\n## Sides expansion (2026-11-12)\n\nSides now has six choices: existing wings/fries plus Garlic Bread (RM 6.90), Mozzarella Sticks (RM 9.90), Potato Wedges (RM 7.90), and Mushroom Soup (RM 6.50). Added items use existing search, details, cart and free-side voucher eligibility. Prices are illustrative.\n');
fs.appendFileSync('assets/README.md','\n`sides-menu.png`: AI-generated illustrative photography, two columns by two rows. Top: garlic bread / mozzarella sticks with marinara. Bottom: potato wedges / mushroom soup. Warm ivory backgrounds, centered dishes, no branding.\n');
