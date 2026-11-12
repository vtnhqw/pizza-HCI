const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const source=fs.readFileSync('tests/prototype.test.cjs','utf8');
const boot=new Function('require','__dirname',source.slice(0,source.indexOf('function pizza('))+'return boot;')(require,path.resolve('tests'));
const b=boot();b.click('category',{value:'Sides'});assert.equal((b.api.home().match(/class="food-card"/g)||[]).length,6);
for(const id of ['garlic-bread','mozzarella-sticks','potato-wedges','mushroom-soup']){b.click('product',{id});assert.match(b.elements.get('#app').innerHTML,new RegExp(`data-food="${id}"`));b.click('menu-add',{id});}
assert.equal(b.api.state.cart.length,4);assert.equal(boot(b.saved()).api.state.cart.length,4);
assert.equal(b.api.state.cart.reduce((sum,x)=>sum+x.price,0).toFixed(2),'31.20');
b.click('redeem');b.click('apply-voucher');assert.match(b.api.checkout(),/Free side applied: −RM 6.50/);
console.log('PASS: six sides render; four new items open and add correctly; cart survives reload; voucher discounts cheapest side (RM 6.50).');
