const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

// Execute the real app with a minimal DOM/storage boundary; no business logic is mocked.
function boot(saved){
  const elements=new Map();
  const element=()=>({innerHTML:'',style:{},dataset:{},value:'',inert:false,scrollTop:0,scrollTo(){},focus(){},setSelectionRange(){},setAttribute(){},removeAttribute(){},querySelector(){return null},querySelectorAll(){return []},classList:{toggle(){}}});
  for(const id of ['#app','#bottom-nav','#toast-root','#modal-root']) elements.set(id,element());
  const listeners={};let stored=saved===undefined?null:JSON.stringify(saved);let interval;
  const sandbox={document:{querySelector:s=>elements.get(s)||null,querySelectorAll:()=>[],activeElement:null,addEventListener:(n,fn)=>listeners[n]=fn},localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v,removeItem:()=>stored=null},setTimeout:()=>1,clearTimeout(){},setInterval:fn=>interval=fn,confirm:()=>true,console,crypto:require('node:crypto').webcrypto};
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.createContext(sandbox);
  vm.runInContext(code.replace(/\}\)\(\);\s*$/, 'globalThis.api={get state(){return state},action,render,checkout,tracking,cart,home,rewards,placeOrder,save,addCart};})();'),sandbox);
  return {api:sandbox.api,elements,listeners,interval:()=>interval(),saved:()=>JSON.parse(stored),click:(action,data={})=>sandbox.api.action({dataset:{action,...data}})};
}
function pizza(toppings=[]){return {id:'margherita',name:'Margherita',category:'Pizza',emoji:'🍕',size:'M',toppings,price:15.99,qty:1}}
function order(mode='Delivery',stage=0){return {id:'#TEST',items:[pizza()],total:19.99,mode,address:'Demo location',payment:'Card (demo)',stage,createdAt:Date.now()}}

test('builder keeps selected size and toppings when reopened',()=>{
  const b=boot();b.click('start-builder');b.click('size',{value:'L'});b.click('topping',{id:'olives'});b.click('back');b.click('start-builder');
  assert.equal(b.api.state.size,'L');assert.deepEqual(Array.from(b.api.state.toppings),['olives']);
});
test('pickup does not reuse a delivery address',()=>{
  const b=boot();b.api.state.address='99 Delivery Road';b.click('mode',{value:'Takeaway'});
  assert.ok(!b.api.checkout().includes('value="99 Delivery Road"'));
});
test('checkout visibly confirms the selected order mode',()=>{
  const b=boot();b.click('mode',{value:'Dine-in'});assert.match(b.api.checkout(),/Order type[\s\S]*Dine-in/);
});
for(const [mode,ready,done] of [['Takeaway','Ready for Pickup','Collected'],['Dine-in','Ready to Serve','Served']]){
  test(`${mode} tracking uses the correct ready and completion stages`,()=>{
    const b=boot({order:order(mode,3)});assert.match(b.api.tracking(),new RegExp(ready));assert.doesNotMatch(b.api.tracking(),/Out for Delivery|Estimated arrival/);
    b.click('advance');assert.match(b.api.tracking(),new RegExp(done));assert.doesNotMatch(b.api.tracking(),/Delivered|Delivery completed/);
  });
}
test('identical toppings selected in a different order merge in the cart',()=>{
  const b=boot();b.api.addCart(pizza(['onions','olives']));b.api.addCart(pizza(['olives','onions']));assert.equal(b.api.state.cart.length,1);assert.equal(b.api.state.cart[0].qty,2);
});
test('changing payment updates the selected visual state',()=>{
  const b=boot({view:'checkout',cart:[pizza()]});b.listeners.change({target:{name:'payment',value:'Cash (demo)'}});
  assert.match(b.elements.get('#app').innerHTML,/payment-row active[^]*?value="Cash \(demo\)" checked/);
  assert.doesNotMatch(b.elements.get('#app').innerHTML,/value="Card \(demo\)" checked/);
});
test('reset does not retain a mutated default cart',()=>{
  const b=boot();b.api.addCart(pizza());b.click('reset');assert.equal(b.api.state.cart.length,0);
});
test('malformed saved collections recover without crashing',()=>{
  const b=boot({cart:null,orders:'bad',toppings:['unknown'],size:'XL',points:-50,query:8});
  assert.equal(b.api.state.cart.length,0);assert.equal(b.api.state.orders.length,0);assert.ok(b.api.state.points>=0);assert.doesNotThrow(()=>b.api.home());
});
test('confirmation restored without an order safely returns home',()=>{
  const b=boot({view:'confirmation',order:null});assert.equal(b.api.state.view,'home');
});
test('reward redemption stores a voucher and cannot spend points twice',()=>{
  const b=boot();b.click('redeem');assert.equal(b.api.state.points,20);assert.equal(b.api.state.vouchers.length,1);b.click('redeem');assert.equal(b.api.state.points,20);
  assert.equal(b.saved().vouchers.length,1);
});
test('redeemed sides voucher discounts one side and is consumed only on order',()=>{
  const b=boot();b.click('redeem');b.api.state.cart=[{id:'fries',name:'French Fries',category:'Sides',size:null,toppings:[],price:5.90,qty:2}];
  b.click('apply-voucher');assert.match(b.api.checkout(),/5\.90/);assert.equal(b.api.state.vouchers.length,1);
  b.api.placeOrder();assert.equal(b.api.state.order.total,9.90);assert.equal(b.api.state.vouchers.length,0);assert.equal(b.api.state.cart.length,0);
});
test('empty cart cannot create an order',()=>{const b=boot();b.api.placeOrder();assert.equal(b.api.state.order,null)});
test('script-like saved addresses are escaped in checkout',()=>{const b=boot();b.api.state.address='\"><img src=x onerror=alert(1)>';assert.ok(!b.api.checkout().includes('<img src=x'))});
test('a game awards points at most once per round',()=>{const b=boot();b.click('game-pick',{index:String(b.api.state.gameWin)});const points=b.api.state.points;b.click('game-pick',{index:String(b.api.state.gameWin)});assert.equal(b.api.state.points,points)});
test('Lucide navigation is rendered as locally available SVG',()=>{const b=boot();b.click('demo-login');assert.match(b.elements.get('#bottom-nav').innerHTML,/<svg[^>]*class="lucide/);assert.match(b.elements.get('#app').innerHTML,/lucide-shopping-cart/)});

test('customization drafts survive reload independently for each pizza',()=>{
  const b=boot();b.click('start-builder');b.click('size',{value:'L'});b.click('topping',{id:'cheese'});
  b.click('product',{id:'pepperoni'});b.click('start-builder');assert.equal(b.api.state.size,'M');assert.equal(b.api.state.toppings.length,0);
  b.click('size',{value:'S'});const restored=boot(b.saved());restored.click('product',{id:'margherita'});restored.click('start-builder');assert.equal(restored.api.state.size,'L');assert.deepEqual(Array.from(restored.api.state.toppings),['cheese']);
});
test('fulfillment values are independent and missing pickup blocks order creation',()=>{
  const b=boot();b.api.state.cart=[pizza()];b.api.state.address='Delivery Road';b.click('mode',{value:'Takeaway'});b.api.placeOrder();assert.equal(b.api.state.order,null);
  b.listeners.input({target:{id:'address',value:'Demo Pickup',removeAttribute(){}}});b.click('mode',{value:'Dine-in'});b.listeners.input({target:{id:'address',value:'Demo Table 2',removeAttribute(){}}});
  b.click('mode',{value:'Delivery'});assert.match(b.api.checkout(),/value="Delivery Road"/);b.click('mode',{value:'Takeaway'});b.api.placeOrder();assert.equal(b.api.state.order.address,'Demo Pickup');assert.equal(b.api.state.order.total,15.99);
});
test('removing the eligible side removes its discount without consuming the voucher',()=>{
  const b=boot();b.click('redeem');b.api.state.cart=[pizza(),{id:'fries',name:'French Fries',category:'Sides',size:null,toppings:[],price:5.90,qty:1}];b.click('apply-voucher');b.click('remove',{index:'1'});b.api.placeOrder();assert.equal(b.api.state.order.total,19.99);assert.equal(b.api.state.vouchers.length,1);
});
test('double submission does not duplicate an order or loyalty points',()=>{
  const b=boot();b.api.state.cart=[pizza()];b.api.placeOrder();b.api.placeOrder();assert.equal(b.api.state.orders.length,1);assert.equal(b.api.state.points,139);
});
test('completed orders cannot advance past their last stage',()=>{
  const b=boot({order:order('Delivery',4)});b.click('advance');assert.equal(b.api.state.order.stage,4);assert.match(b.api.tracking(),/Order completed/);
});
test('all views render without exceptions with representative demo data',()=>{
  const b=boot({order:order(),cart:[pizza()]});
  for(const view of ['home','product','builder','cart','checkout','confirmation','tracking','orders','rewards','profile','thirdparty','vouchers']){
    b.api.state.view=view;b.api.render();assert.ok(b.elements.get('#app').innerHTML.length>0,view);
    assert.doesNotMatch(b.elements.get('#app').innerHTML,/\b(?:NaN|undefined)\b/,view);
    assert.doesNotMatch(b.elements.get('#app').innerHTML,/[🛒🛵📦🎁👤🍕]/u,view);
  }
});

test('menu actions distinguish details, pizza customization and direct add',()=>{
  const b=boot();b.click('menu-customize',{id:'pepperoni'});assert.equal(b.api.state.view,'builder');assert.equal(b.api.state.selectedId,'pepperoni');
  b.click('exit-builder');assert.equal(b.api.state.view,'home');b.click('menu-add',{id:'cola'});assert.equal(b.api.state.cart[0].id,'cola');assert.equal(b.api.state.cart[0].qty,1);
  b.click('menu-add',{id:'margherita'});assert.equal(b.api.state.cart.length,1);
});
test('header and footer Back both return one builder step',()=>{
  for(const action of ['back','builder-prev']){const b=boot();b.click('start-builder');b.click('builder-next');b.click('builder-next');b.click(action);assert.equal(b.api.state.view,'builder');assert.equal(b.api.state.builderStep,1)}
});
test('cross-category search removes the misleading selected category',()=>{
  const b=boot();b.api.state.query='cola';const html=b.api.home();assert.match(html,/Results across all categories/);assert.match(html,/data-food="cola"/);assert.doesNotMatch(html,/class="category active"/);
});
test('menu price states the starting size and builder shows the selected size',()=>{
  const b=boot();assert.match(b.api.home(),/Small from/);b.click('start-builder');assert.match(b.elements.get('#app').innerHTML,/Medium.*10/);assert.match(b.elements.get('#app').innerHTML,/Choose toppings/);
});
test('editing a cart pizza preserves quantity and changes the existing item',()=>{
  const b=boot({view:'cart',cart:[{...pizza(),qty:3}]});b.click('edit-cart',{index:'0'});assert.equal(b.api.state.view,'builder');b.click('size',{value:'L'});b.click('topping',{id:'cheese'});b.click('add-custom');
  assert.equal(b.api.state.view,'cart');assert.equal(b.api.state.cart.length,1);assert.equal(b.api.state.cart[0].qty,3);assert.equal(b.api.state.cart[0].size,'L');assert.equal(b.api.state.cart[0].price,21.49);
});
test('cancelling a cart edit leaves the original and saved browsing draft untouched',()=>{
  const b=boot({view:'cart',cart:[pizza()],drafts:{margherita:{size:'S',toppings:['olives']}}});const original=JSON.stringify(b.api.state.cart);b.click('edit-cart',{index:'0'});b.click('size',{value:'L'});b.click('topping',{id:'cheese'});b.click('exit-builder');
  assert.equal(b.api.state.view,'cart');assert.equal(JSON.stringify(b.api.state.cart),original);assert.equal(b.api.state.drafts.margherita.size,'S');
});
test('cart edit survives reload and merges identical configurations without losing quantity',()=>{
  const b=boot({view:'cart',cart:[{...pizza(),qty:2},{...pizza(['cheese']),qty:3}]});b.click('edit-cart',{index:'0'});b.click('topping',{id:'cheese'});const restored=boot(b.saved());restored.click('add-custom');
  assert.equal(restored.api.state.cart.length,1);assert.equal(restored.api.state.cart[0].qty,5);assert.equal(restored.api.state.view,'cart');
});
test('an edit that would merge above the quantity limit does not modify either item',()=>{
  const b=boot({view:'cart',cart:[{...pizza(),qty:2},{...pizza(['cheese']),qty:99}]});const original=JSON.stringify(b.api.state.cart);b.click('edit-cart',{index:'0'});b.click('topping',{id:'cheese'});b.click('add-custom');assert.equal(JSON.stringify(b.api.state.cart),original);assert.equal(b.api.state.view,'builder');
});
test('checkout context survives rewards redemption and voucher application',()=>{
  const b=boot({view:'checkout',cart:[{id:'fries',qty:1}]});b.click('go-vouchers');b.click('voucher-rewards');assert.equal(b.api.state.view,'rewards');b.click('redeem');b.click('go-vouchers');assert.match(b.elements.get('#app').innerHTML,/Apply and return to checkout/);b.click('apply-voucher');assert.equal(b.api.state.view,'checkout');assert.equal(b.api.state.appliedVoucher,'free-side');
});
test('Rewards opened from the bottom tab does not inherit old checkout context',()=>{
  const b=boot({view:'checkout',cart:[pizza()]});b.click('go-vouchers');b.click('voucher-rewards');b.click('navigate',{view:'home'});b.click('navigate',{view:'rewards'});b.click('go-vouchers');assert.equal(b.api.state.voucherReturn,'rewards');
});

test('stale cart edit cannot overwrite a different cart item',()=>{
  const b=boot({view:'cart',cart:[pizza()]});b.click('edit-cart',{index:'0'});b.api.state.cart[0]={id:'cola',name:'Iced Cola',category:'Drinks',size:null,toppings:[],qty:1,price:4.5};b.click('add-custom');assert.equal(b.api.state.cart.length,1);assert.equal(b.api.state.cart[0].id,'cola');assert.equal(b.api.state.view,'cart');
});
test('invalid restored cart edit returns to cart without adding a pizza',()=>{
  const b=boot({view:'builder',selectedId:'margherita',editingCart:{index:4,signature:'stale'},cart:[pizza()]});assert.equal(b.api.state.view,'cart');assert.equal(b.api.state.editingCart,null);assert.equal(b.api.state.cart.length,1);
});
test('cancelling after reload preserves cart and does not create a new browsing draft',()=>{
  const b=boot({view:'cart',cart:[pizza()]});b.click('edit-cart',{index:'0'});b.click('size',{value:'L'});const restored=boot(b.saved());restored.click('exit-builder');assert.equal(restored.api.state.cart[0].size,'M');assert.equal(restored.api.state.drafts.margherita,undefined);
});
