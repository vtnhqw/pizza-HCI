const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const testSource=fs.readFileSync('tests/prototype.test.cjs','utf8');
const boot=new Function('require','__dirname',testSource.slice(0,testSource.indexOf('function pizza('))+'return boot;')(require,path.resolve('tests'));
for(const id of ['margherita','pepperoni','veggie','bbq']){
  const b=boot();b.click('product',{id});b.click('start-builder');
  for(let step=0;step<4;step++){
    const rendered=b.elements.get('#app').innerHTML;
    assert.ok(rendered.includes('data-food="'+id+'"'));assert.ok(!rendered.includes('pizza-svg'));
    if(step===1){for(const name of ['sausage','onion','cheese','olive'])assert.ok(rendered.includes('lucide-'+name));assert.equal((rendered.match(/class="ingredient-icon"/g)||[]).length,2);b.click('topping',{id:'cheese'});assert.ok(b.api.state.toppings.includes('cheese'));}
    if(step<3)b.click('builder-next');
  }
}
console.log('PASS: all four pizzas show their own menu photo across all four builder steps; ingredient icons render and topping selections remain functional.');
let doc=fs.readFileSync('PROJECT.md','utf8');
doc=doc.replace('The dynamic builder illustrations and `assets/pizzazz-mark.svg` are original prototype artwork.','The mushroom/capsicum ingredient icons and `assets/pizzazz-mark.svg` are original prototype artwork.');
doc=doc.replace('The pizza builder retains schematic SVG artwork to show selected extra toppings.','The pizza builder uses the selected pizza’s original menu photo; extra toppings are shown through selected controls and the summary.');
doc=doc.replace('SVG preview, selection feedback and live price','Original menu photo, selection feedback and live price');
doc=doc.replace('Builder artwork stays dynamic SVG.','Builder artwork now uses the original selected menu photo (see the later builder refinement).');
doc += '\n## Builder imagery and ingredient icons — 12 November 2026\n\nUser requested replacing the drawn pizza with the original menu picture. All four builder steps now show the selected pizza’s existing photo. The image stays unchanged when extra toppings are selected; selected cards, the summary and price provide feedback. Preview copy makes clear the original recipe is pictured.\n\nIngredient icons: official Lucide cheese; official Lucide Lab sausage (pepperoni), onion and olive. Lucide core/Lab inventories had no exact mushroom or capsicum match; these two use original ingredient-specific SVG drawings in the same stroke style, rather than generic circles/leaves. Lab license is retained in assets/lucide/LICENSE-lab.\n\nValidation: all 22 regression checks passed; additional smoke checks confirmed the matching photo in all 16 pizza/step combinations, all ingredient icons, and functioning topping selection. Browser visuals were not reverified.\n';
fs.writeFileSync('PROJECT.md',doc);
