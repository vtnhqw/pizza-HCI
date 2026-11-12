const fs=require('fs');
let html=fs.readFileSync('index.html','utf8');
const helper=`// Original ingredient drawings only where Lucide has no exact ingredient match.
function toppingIcon(id){
  const named={pepperoni:'sausage',onions:'onion',cheese:'cheese',olives:'olive'};
  if(named[id])return icon(named[id]);
  const paths=id==='mushrooms'?'<path d="M3 13a9 9 0 0 1 18 0Z"/><path d="M9 13v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-6"/><path d="M8 9h.01M12 7h.01M16 10h.01"/>':'<path d="M12 7c0-3 1-4 3-5"/><path d="M12 7C6 3 2 9 5 17c1 4 4 5 7 3 3 2 6 1 7-3 3-8-1-14-7-10Z"/><path d="M9 10c-1 3-1 6 0 8M15 10c1 3 1 6 0 8"/>';
  return '<svg class="ingredient-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+paths+'</svg>';
}
`;
html=html.replace('function foodArt(p){',helper+'function foodArt(p){');
const old='${pizzaSVG(state.toppings)}';
if(html.split(old).length-1!==4)throw Error('Expected four builder illustrations');
html=html.split(old).join('${foodArt(p)}');
html=html.replace('<span class="te">${t.emoji}</span>','<span class="te">${toppingIcon(t.id)}</span>');
html=html.replace('<div style="width:105px;height:105px">${foodArt(p)}</div>','<div class="builder-review-photo">${foodArt(p)}</div>');
html=html.replace('<div class="section-title">Your pizza preview</div>','<div class="section-title">Your pizza</div>');
html=html.replace('<div class="summary"><b>Selected toppings</b>','<p class="builder-photo-caption">Original recipe pictured. Your extra toppings are listed below.</p><div class="summary"><b>Selected toppings</b>');
html=html.replace(/^function pizzaSVG\(tops=\[\]\).*\r?\n/m,'');
fs.writeFileSync('index.html',html);
console.log('Builder now uses selected menu photography in all four steps and explicit topping icons.');
