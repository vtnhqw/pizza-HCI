const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const source=fs.readFileSync('tests/prototype.test.cjs','utf8');
const boot=new Function('require','__dirname',source.slice(0,source.indexOf('function pizza('))+'return boot;')(require,path.resolve('tests'));
for(const action of ['demo-login','demo-signup']){
  const b=boot();assert.equal(b.api.state.view,'login');assert.equal(b.elements.get('#bottom-nav').style.display,'none');
  b.click(action);assert.equal(b.api.state.view,'home');assert.equal(b.elements.get('#bottom-nav').style.display,'grid');
  b.click('show-login');assert.equal(b.api.state.view,'login');b.click(action);assert.equal(b.api.state.cart.length,0);
}
const existing=boot({view:'home',points:250,cart:[]});assert.equal(existing.api.state.view,'login');existing.click('demo-login');assert.equal(existing.api.state.points,250);assert.equal(boot(existing.saved()).api.state.view,'home');
existing.click('featured-builder');assert.equal(existing.api.state.view,'builder');assert.equal(existing.api.state.selectedId,'margherita');
for(const category of ['Pizza','Pasta','Sides','Drinks']){existing.click('go-home');existing.click('category',{value:category});assert.match(existing.api.home(),/class="food-photo"/)}
for(const file of ['assets/pizzazz-mark.svg','assets/pizza-hero.png','assets/menu-photography.png','visual.css'])assert.ok(fs.statSync(file).size>100);
assert.ok(!fs.readFileSync('visual.css','utf8').includes('https://'));
console.log('PASS: login and signup go home, welcome hides navigation, existing demo data survives migration, feature CTA works, all food categories render local photography, and local assets exist.');
