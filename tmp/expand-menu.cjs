const fs=require('fs');let s=fs.readFileSync('index.html','utf8');
const entries=[
{id:'bolognese',name:'Spaghetti Bolognese',description:'Spaghetti in rich beef & tomato sauce',price:14.90,emoji:'🍝',category:'Pasta'},
{id:'alfredo',name:'Chicken Alfredo',description:'Fettuccine, grilled chicken & creamy sauce',price:16.90,emoji:'🍝',category:'Pasta'},
{id:'arrabbiata',name:'Spicy Arrabbiata',description:'Penne with tomato, garlic & a chilli kick',price:12.90,emoji:'🍝',category:'Pasta'},
{id:'lemon-tea',name:'Lemon Iced Tea',description:'Chilled black tea with a zesty lemon slice',price:5.90,emoji:'🥤',category:'Drinks'},
{id:'orange-juice',name:'Orange Juice',description:'Bright, citrusy orange juice served cold',price:6.90,emoji:'🥤',category:'Drinks'},
{id:'sparkling-water',name:'Sparkling Water',description:'Crisp sparkling water with ice & lime',price:4.90,emoji:'🥤',category:'Drinks'}];
const line=s.match(/const PIZZAS=\[.*?\];/)[0];s=s.replace(line,line.slice(0,-2)+','+entries.map(x=>JSON.stringify(x)).join(',')+'];');
fs.writeFileSync('index.html',s);
let css='\n/* Additional pasta and drink photography: two columns, three rows. */\n';
entries.forEach((p,i)=>{css+=`.food-photo[data-food="${p.id}"]{background-image:url('assets/pasta-drinks-menu.png');background-size:200% 300%;background-position:${i%2?100:0}% ${Math.floor(i/2)*50}%}\n`});
fs.appendFileSync('visual.css',css);
fs.appendFileSync('PROJECT.md','\n## Pasta and drinks expansion (2026-11-12)\n\nPasta and Drinks now each have four choices. Added Spaghetti Bolognese (RM 14.90), Chicken Alfredo (RM 16.90), Spicy Arrabbiata (RM 12.90), Lemon Iced Tea (RM 5.90), Orange Juice (RM 6.90) and Sparkling Water (RM 4.90). All use existing details, search and direct-add cart flows. Prices and food photography are illustrative. Existing item IDs remain unchanged for saved carts.\n');
fs.appendFileSync('assets/README.md','\n## Expanded menu\n\n`pasta-drinks-menu.png`: AI-generated illustrative photography, two columns by three rows. Row 1: spaghetti bolognese / chicken Alfredo. Row 2: penne arrabbiata / lemon iced tea. Row 3: orange juice / sparkling water. All cells use warm ivory backgrounds and centered dishes, with no text or branding.\n');
