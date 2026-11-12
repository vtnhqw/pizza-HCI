const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const source=fs.readFileSync('tests/prototype.test.cjs','utf8');
const boot=new Function('require','__dirname',source.slice(0,source.indexOf('function pizza('))+'return boot;')(require,path.resolve('tests'));
const b=boot();
for(const category of ['Pasta','Drinks']){b.click('category',{value:category});assert.equal((b.api.home().match(/class="food-card"/g)||[]).length,4);}
for(const id of ['bolognese','alfredo','arrabbiata','lemon-tea','orange-juice','sparkling-water']){b.click('product',{id});assert.match(b.elements.get('#app').innerHTML,new RegExp(`data-food="${id}"`));b.click('menu-add',{id});}
assert.equal(b.api.state.cart.length,6);assert.equal(boot(b.saved()).api.state.cart.length,6);
assert.equal(b.api.state.cart.reduce((sum,x)=>sum+x.price,0).toFixed(2),'62.40');
console.log('PASS: both categories have four choices; six new details and cart entries work; prices total RM 62.40; cart survives reload.');
