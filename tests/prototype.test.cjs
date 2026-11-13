const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

// Execute the real app with a minimal DOM/storage boundary; no business logic is mocked.
function boot(saved,clock){
  const elements=new Map();
  const element=()=>({innerHTML:'',style:{},dataset:{},value:'',inert:false,scrollTop:0,scrollTo(){},focus(){},setSelectionRange(){},setAttribute(){},removeAttribute(){},querySelector(){return null},querySelectorAll(){return []},classList:{toggle(){}}});
  for(const id of ['html','#app','#bottom-nav','#toast-root','#modal-root','.device','.phone-frame','.phone-power','.phone-wake']) elements.set(id,element());
  const listeners={};let stored=saved===undefined?null:JSON.stringify(saved);let interval;
  const sandbox={document:{querySelector:s=>elements.get(s)||null,querySelectorAll:()=>[],activeElement:null,addEventListener:(n,fn)=>listeners[n]=fn},localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v,removeItem:()=>stored=null},setTimeout:()=>1,clearTimeout(){},setInterval:fn=>interval=fn,confirm:()=>true,console,crypto:require('node:crypto').webcrypto};
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  if(clock)sandbox.Date=class extends Date{static now(){return clock.now}};
  vm.createContext(sandbox);
  vm.runInContext(code.replace(/\}\)\(\);\s*$/, 'globalThis.api={get state(){return state},action,render,checkout,tracking,cart,home,rewards,placeOrder,save,addCart};})();'),sandbox);
  return {api:sandbox.api,elements,listeners,interval:()=>interval(),saved:()=>JSON.parse(stored),click:(action,data={})=>sandbox.api.action({dataset:{action,...data}})};
}
function pizza(toppings=[]){return {id:'margherita',name:'Margherita',category:'Pizza',emoji:'🍕',size:'M',toppings,price:15.99,qty:1}}
test('pizza size selection offers immediate cart entry and optional toppings',()=>{
  const b=boot();b.click('menu-customize',{id:'margherita'});
  const markup=b.elements.get('#app').innerHTML;
  assert.match(markup,/data-action="add-custom"/);
  assert.match(markup,/Customize toppings/);
  b.click('size',{value:'L'});b.click('add-custom');
  assert.equal(b.api.state.cart.length,1);
  assert.equal(b.api.state.cart[0].size,'L');
  assert.equal(b.api.state.cart[0].toppings.length,0);
});
test('quick size-to-cart preserves saved extras and supports editing',()=>{
  const b=boot();b.click('menu-customize',{id:'margherita'});b.click('topping',{id:'olives'});b.click('exit-builder');
  b.click('menu-customize',{id:'margherita'});
  assert.match(b.elements.get('#app').innerHTML,/Olives/);
  b.click('add-custom');b.click('edit-cart',{index:'0'});b.click('size',{value:'S'});b.click('add-custom');
  assert.equal(b.api.state.cart.length,1);assert.equal(b.api.state.cart[0].size,'S');
  assert.deepEqual(Array.from(b.api.state.cart[0].toppings),['olives']);
});
test('order-first welcome and account actions open the demo menu',()=>{
  const b=boot();assert.match(b.elements.get('#app').innerHTML,/Browse menu/);
  b.click('demo-login');assert.equal(b.api.state.view,'home');
  b.click('show-login');b.click('demo-signup');assert.equal(b.api.state.view,'home');
});
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
test('each round has exactly one rewarding box and two empty boxes',()=>{
  for(const winner of [0,1,2]){
    const gains=[0,1,2].map(pick=>{
      const b=boot({view:'game',gameWin:winner,gameRevealed:[],points:120});
      b.click('game-pick',{index:String(pick)});
      if(pick!==winner)assert.match(b.elements.get('#app').innerHTML,/No reward/);
      return b.api.state.points-120;
    });
    assert.deepEqual(gains.sort((a,b)=>a-b),[0,0,20]);
  }
});
test('Lucide navigation is rendered as locally available SVG',()=>{const b=boot();b.click('demo-login');assert.match(b.elements.get('#bottom-nav').innerHTML,/<svg[^>]*class="lucide/);assert.match(b.elements.get('#app').innerHTML,/lucide-shopping-cart/)});

test('customization drafts survive reload independently for each pizza',()=>{
  const b=boot();b.click('start-builder');b.click('size',{value:'L'});b.click('topping',{id:'cheese'});
  b.click('product',{id:'pepperoni'});b.click('start-builder');assert.equal(b.api.state.size,'M');assert.equal(b.api.state.toppings.length,0);
  b.click('size',{value:'S'});const restored=boot(b.saved());restored.click('product',{id:'margherita'});restored.click('start-builder');assert.equal(restored.api.state.size,'L');assert.deepEqual(Array.from(restored.api.state.toppings),['cheese']);
});
test('fulfillment values are independent and pickup selection is saved',()=>{
  const b=boot();b.api.state.cart=[pizza()];b.api.state.address='Delivery Road';b.click('mode',{value:'Takeaway'});assert.equal(b.api.state.pickupOutlet,'Bukit Bintang — Demo outlet');assert.equal((b.api.checkout().match(/<option /g)||[]).length,3);
  b.listeners.change({target:{id:'address',value:'KL Sentral — Demo outlet',removeAttribute(){}}});b.click('mode',{value:'Dine-in'});b.listeners.input({target:{id:'address',value:'Demo Table 2',removeAttribute(){}}});
  b.click('mode',{value:'Delivery'});assert.match(b.api.checkout(),/value="Delivery Road"/);b.click('mode',{value:'Takeaway'});b.api.placeOrder();assert.equal(b.api.state.order.address,'KL Sentral — Demo outlet');assert.equal(b.api.state.order.total,15.99);
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
  for(const view of ['home','product','builder','cart','checkout','confirmation','tracking','orders','rewards','profile','vouchers']){
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
  const b=boot();assert.match(b.api.home(),/Small from/);b.click('start-builder');assert.match(b.elements.get('#app').innerHTML,/Medium.*10/);assert.match(b.elements.get('#app').innerHTML,/Customize toppings/);
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

test('payment providers persist per method and are recorded on orders',()=>{
  const b=boot({view:'checkout',cart:[pizza()]});
  assert.match(b.api.checkout(),/Visa/);
  b.listeners.change({target:{name:'payment-provider',value:'mastercard'}});
  b.listeners.change({target:{name:'payment',value:'E-Wallet (demo)'}});
  assert.match(b.api.checkout(),/Touch &amp; Go eWallet/);
  b.listeners.change({target:{name:'payment-provider',value:'grabpay'}});
  b.listeners.change({target:{name:'payment',value:'Card (demo)'}});
  assert.equal(b.api.state.cardProvider,'mastercard');
  b.api.placeOrder();assert.equal(b.api.state.order.payment,'Mastercard (demo)');
  const restored=boot(b.saved());assert.equal(restored.api.state.walletProvider,'grabpay');
});
test('invalid saved payment providers recover to safe defaults',()=>{
  const b=boot({cardProvider:'invalid',walletProvider:'invalid'});
  assert.equal(b.api.state.cardProvider,'visa');assert.equal(b.api.state.walletProvider,'touchngo');
});


test('profile theme applies globally and survives navigation and reload',()=>{
  const b=boot({view:'profile',cart:[pizza()]});
  assert.match(b.elements.get('#app').innerHTML,/Open settings/);
  b.click('navigate',{view:'settings'});
  assert.match(b.elements.get('#app').innerHTML,/Appearance/);
  b.listeners.change({target:{name:'theme',value:'dark'}});
  assert.equal(b.api.state.theme,'dark');
  assert.equal(b.elements.get('html').dataset.theme,'dark');
  b.click('navigate',{view:'home'});
  assert.equal(b.elements.get('html').dataset.theme,'dark');
  const restored=boot(b.saved());assert.equal(restored.api.state.theme,'dark');
  assert.equal(restored.elements.get('html').dataset.theme,'dark');
  assert.equal(restored.api.state.cart.length,1);
  restored.listeners.change({target:{name:'theme',value:'light'}});
  assert.equal(restored.elements.get('html').dataset.theme,'light');
});
test('theme defaults safely and ignores invalid changes',()=>{
  const b=boot({theme:'invalid'});assert.equal(b.api.state.theme,'light');
  b.listeners.change({target:{name:'theme',value:'invalid'}});
  assert.equal(b.api.state.theme,'light');
});

test('settings is separate from profile and returns there after reload',()=>{
 const b=boot({view:'profile'});assert.doesNotMatch(b.elements.get('#app').innerHTML,/name="theme"/);
 b.click('navigate',{view:'settings'});assert.match(b.elements.get('#app').innerHTML,/name="theme"/);
 const r=boot(b.saved());assert.equal(r.api.state.view,'settings');r.click('back');assert.equal(r.api.state.view,'profile');
});
test('non-pizza categories promote matching food instead of pizza builder',()=>{
 const b=boot();for(const [category,id] of [['Pasta','pasta'],['Sides','garlic-bread'],['Drinks','lemon-tea']]){
 b.click('category',{value:category});const html=b.api.home();assert.doesNotMatch(html,/Build your perfect pizza|featured-builder/);assert.match(html,new RegExp('data-action="product" data-id="'+id+'"'));
 }b.click('category',{value:'Pizza'});assert.match(b.api.home(),/featured-builder/);
});

test('settings uses the official Lucide gear artwork',()=>{
 const b=boot({view:'profile'});const svg=fs.readFileSync(path.join(__dirname,'../assets/lucide/settings.svg'),'utf8');
 const gearPath=svg.match(/<path d="([^"]+)"/)[1];assert.ok(b.elements.get('#app').innerHTML.includes(gearPath));
});
test('dark theme stays applied across every screen',()=>{
 const b=boot({theme:'dark',cart:[pizza()],order:order()});
 for(const view of ['login','home','product','builder','cart','checkout','confirmation','tracking','orders','rewards','profile','settings','vouchers']){
  b.api.state.view=view;b.api.render();assert.equal(b.elements.get('html').dataset.theme,'dark',view);assert.ok(b.elements.get('#app').innerHTML.length>100,view);
 }
});

test('confirmation shows the payment saved on the order, not current preferences',()=>{
 const b=boot({cart:[pizza()],payment:'E-Wallet (demo)',walletProvider:'touchngo'});b.api.placeOrder();
 b.api.state.payment='Cash (demo)';b.api.render();
 assert.match(b.elements.get('#app').innerHTML,/Payment method/);assert.match(b.elements.get('#app').innerHTML,/Touch &amp; Go eWallet \(demo\)/);
 b.api.state.order.payment='<bad>';b.api.render();assert.match(b.elements.get('#app').innerHTML,/&lt;bad&gt;/);
});
test('every category banner names and prices its featured item',()=>{
 const b=boot();for(const [category,name,price] of [['Pizza','Margherita','12.99'],['Pasta','Creamy Pasta','11.90'],['Sides','Garlic Bread','6.90'],['Drinks','Lemon Iced Tea','5.90']]){
 b.api.state.category=category;const banner=b.api.home().match(/<section class="hero category-promo">([\s\S]*?)<\/section>/)?.[1];assert.ok(banner,category);assert.ok(banner.includes(name));assert.ok(banner.includes('RM '+price));
 }b.click('featured-builder');assert.equal(b.api.state.selectedId,'margherita');
});

test('main page defaults to the app-only layout',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.match(html,/<html lang="en" data-presentation="app">/);
});
test('/1 entry uses the same app with notes enabled and parent-relative assets',()=>{
 const main=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const notes=fs.readFileSync(path.join(__dirname,'../1/index.html'),'utf8');
 assert.equal(notes,main.replace('data-presentation="app"','data-presentation="notes"').replace('<head>','<head>\n<base href="../"/>'));
 for(const asset of ['visual.css','assets/pizzazz-logo.png'])assert.ok(fs.existsSync(path.join(__dirname,'..',asset)));
});

test('rider tracking is offered only while a delivery is out',()=>{
 for(const [mode,stage,visible] of [['Delivery',2,false],['Delivery',3,true],['Delivery',4,false],['Takeaway',3,false],['Dine-in',3,false]]){
 const b=boot({view:'tracking',order:order(mode,stage)});assert.equal(b.api.tracking().includes('data-action="track-rider"'),visible);
 b.click('track-rider');assert.equal(b.api.state.view==='rider',visible);assert.equal(b.elements.get('#modal-root').innerHTML,'');
 }
});
test('rider page shows a simulated map, ETA, destination and returns to order',()=>{
 const o=order('Delivery',3);o.address='<Test address>';const b=boot({view:'tracking',order:o});b.click('track-rider');
 const html=b.elements.get('#app').innerHTML;assert.match(html,/Simulated route/);assert.match(html,/Estimated arrival/);assert.match(html,/&lt;Test address&gt;/);assert.match(html,/data-action="back"/);
 assert.equal(b.elements.get('#app').inert,false);b.click('back');assert.equal(b.api.state.view,'tracking');assert.equal(b.elements.get('#modal-root').innerHTML,'');
});

test('rider position and estimate update, then stop at arrival',()=>{
 const clock={now:Date.now()};const b=boot({view:'tracking',order:order('Delivery',3)},clock);
 b.click('track-rider');const target={innerHTML:''};b.elements.set('#rider-location',target);
 clock.now+=15000;b.interval();assert.match(target.innerHTML,/50 percent/);assert.match(target.innerHTML,/6 min/);
 clock.now+=15000;b.interval();assert.equal(b.api.state.order.stage,4);assert.match(target.innerHTML,/100 percent/);assert.match(target.innerHTML,/Rider has arrived/);assert.doesNotMatch(target.innerHTML,/Estimated arrival/);
 clock.now+=30000;b.interval();assert.equal(b.api.state.order.stage,4);assert.match(target.innerHTML,/Rider has arrived/);
});

test('power toggles the screen without changing page, cart or theme',()=>{
 const b=boot({view:'checkout',cart:[pizza()],theme:'dark'});b.click('phone-power');assert.equal(b.elements.get('.device').inert,true);assert.equal(b.elements.get('.phone-frame').dataset.power,'off');
 b.click('navigate',{view:'home'});assert.equal(b.api.state.view,'checkout');b.click('phone-power');assert.equal(b.elements.get('.device').inert,false);assert.equal(b.elements.get('.phone-frame').dataset.power,'on');assert.equal(b.api.state.view,'checkout');assert.equal(b.api.state.cart.length,1);assert.equal(b.api.state.theme,'dark');
});
test('screen sleep pauses tracking and can wake by tapping the screen',()=>{
 const clock={now:Date.now()};const b=boot({view:'tracking',order:order('Delivery',3)},clock);b.click('phone-power');clock.now+=60000;b.interval();assert.equal(b.api.state.order.stage,3);b.click('phone-wake');b.interval();assert.equal(b.api.state.order.stage,3);assert.equal(b.elements.get('.device').inert,false);clock.now+=30000;b.interval();assert.equal(b.api.state.order.stage,4);
});

test('opening and leaving the rider page preserves delivery progress',()=>{
 const clock={now:Date.now()};const b=boot({view:'tracking',order:order('Delivery',3)},clock);clock.now+=10000;b.click('track-rider');
 assert.equal(b.api.state.view,'rider');assert.match(b.elements.get('#app').innerHTML,/33 percent/);clock.now+=10000;b.click('back');b.click('track-rider');assert.match(b.elements.get('#app').innerHTML,/67 percent/);clock.now+=10000;b.interval();assert.equal(b.api.state.order.stage,4);
});
test('rider page restores valid deliveries and recovers invalid saved routes',()=>{
 const valid=boot({view:'rider',order:order('Delivery',3)});assert.equal(valid.api.state.view,'rider');assert.match(valid.elements.get('#app').innerHTML,/Rider location/);
 for(const o of [null,order('Takeaway',3),order('Delivery',1)]){const b=boot({view:'rider',order:o});assert.equal(b.api.state.view,'tracking')}
});

test('orders separate all unfinished orders from completed history',()=>{
 const list=[{...order('Delivery',2),id:'#ACTIVE-DELIVERY'},{...order('Takeaway',3),id:'#ACTIVE-PICKUP'},{...order('Dine-in',3),id:'#ACTIVE-DINE'},{...order('Delivery',4),id:'#DONE-DELIVERY'},{...order('Takeaway',4),id:'#DONE-PICKUP'},{...order('Dine-in',4),id:'#DONE-DINE'}];
 const b=boot({view:'orders',order:list[3],orders:list});const html=b.elements.get('#app').innerHTML;
 const active=html.match(/<section aria-labelledby="active-orders-title">([\s\S]*?)<\/section>/)?.[1];const history=html.match(/<section aria-labelledby="order-history-title">([\s\S]*?)<\/section>/)?.[1];assert.ok(active);assert.ok(history);
 for(const o of list){assert.equal(active.includes(o.id),o.stage<4);assert.equal(history.includes(o.id),o.stage===4)}
 assert.match(active,/Track order/);assert.doesNotMatch(history,/Track order/);assert.match(history,/View details/);
 b.click('history',{id:'#ACTIVE-PICKUP'});assert.equal(b.api.state.order.id,'#ACTIVE-PICKUP');
});
test('completed orders move to history and stay there after reload',()=>{
 const b=boot({view:'tracking',order:order('Delivery',3)});b.click('advance');b.click('navigate',{view:'orders'});
 assert.match(b.elements.get('#app').innerHTML,/No active orders/);assert.match(b.elements.get('#app').innerHTML,/View details/);
 const r=boot(b.saved());assert.match(r.elements.get('#app').innerHTML,/No active orders/);r.click('history',{id:'#TEST'});assert.match(r.elements.get('#app').innerHTML,/Order details/);
});
test('empty Orders explains active orders and history separately',()=>{
 const b=boot({view:'orders'});const html=b.elements.get('#app').innerHTML;assert.match(html,/No active orders/);assert.match(html,/No completed orders yet/);assert.match(html,/Browse menu/);
});

test('welcome opens separate login and registration forms',()=>{
 const b=boot();assert.match(b.elements.get('#app').innerHTML,/data-action="show-signin"/);assert.match(b.elements.get('#app').innerHTML,/data-action="show-signup"/);
 b.click('show-signin');assert.equal(b.api.state.view,'signin');assert.match(b.elements.get('#app').innerHTML,/Log in/);assert.match(b.elements.get('#app').innerHTML,/id="demo-auth-form"[^>]*novalidate/);b.click('back');assert.equal(b.api.state.view,'login');
 b.click('show-signup');assert.equal(b.api.state.view,'signup');assert.match(b.elements.get('#app').innerHTML,/Full name/);assert.match(b.elements.get('#app').innerHTML,/Register/);
});
test('both demo forms continue without validation or storing entered credentials',()=>{
 for(const view of ['signin','signup']){
 const b=boot({view,cart:[pizza()],theme:'dark'});let prevented=false;
 b.listeners.submit({preventDefault(){prevented=true},target:{id:'demo-auth-form',elements:{email:{value:'not-an-email'},password:{value:'never-store-this'}}}});
 assert.equal(prevented,true);assert.equal(b.api.state.view,'home');assert.equal(b.api.state.cart.length,1);assert.equal(b.api.state.theme,'dark');assert.doesNotMatch(JSON.stringify(b.saved()),/never-store-this|not-an-email/);
 }
});
test('demo account pages survive reload and support switching forms',()=>{
 const b=boot({view:'signin'});assert.equal(b.api.state.view,'signin');b.click('show-signup');const r=boot(b.saved());assert.equal(r.api.state.view,'signup');r.click('show-signin');assert.equal(r.api.state.view,'signin');
});

test('categories advertise horizontal browsing and expand or collapse',()=>{
 const b=boot({view:'home',visualRefreshSeen:true});assert.match(b.api.home(),/Swipe for more/);assert.match(b.api.home(),/aria-controls="category-list" aria-expanded="false"/);
 b.click('toggle-categories');assert.equal(b.api.state.categoriesExpanded,true);assert.match(b.api.home(),/aria-expanded="true"/);assert.match(b.api.home(),/category-grid expanded/);
 b.click('category',{value:'Desserts'});assert.equal(b.api.state.category,'Desserts');b.click('toggle-categories');assert.equal(b.api.state.categoriesExpanded,false);assert.equal(b.api.state.category,'Desserts');
 const r=boot(b.saved());assert.equal(r.api.state.category,'Desserts');assert.match(r.api.home(),/Chocolate Brownie/);
});
test('new chicken and dessert items add directly and survive reload',()=>{
 const b=boot();for(const [category,ids] of [['Chicken',['chicken-tenders','bbq-wings','popcorn-chicken']],['Desserts',['brownie','cheesecake','cookies']]]){
 b.click('category',{value:category});for(const id of ids){assert.match(b.api.home(),new RegExp('data-id="'+id+'"'));b.click('menu-add',{id});b.click('close-modal')}
 }
 assert.equal(b.api.state.cart.length,6);assert.ok(b.api.state.cart.every(x=>x.size===null));const r=boot(b.saved());assert.equal(r.api.state.cart.length,6);
 r.api.state.query='brownie';assert.match(r.api.home(),/Chocolate Brownie/);
});

test('pizza picker groups varieties and preserves separate customization drafts',()=>{
 const b=boot();b.click('start-builder');const html=b.elements.get('#app').innerHTML;
 for(const group of ['Chicken','Beef','Vegetarian'])assert.match(html,new RegExp('optgroup label="'+group+'"'));
 assert.match(html,/Chicken Aloha/);b.click('size',{value:'L'});b.click('topping',{id:'olives'});
 b.listeners.change({target:{id:'pizza-variety',value:'chicken-aloha'}});assert.equal(b.api.state.selectedId,'chicken-aloha');assert.equal(b.api.state.size,'M');
 b.click('size',{value:'S'});b.listeners.change({target:{id:'pizza-variety',value:'margherita'}});assert.equal(b.api.state.size,'L');assert.deepEqual(Array.from(b.api.state.toppings),['olives']);
 b.listeners.change({target:{id:'pizza-variety',value:'chicken-aloha'}});b.click('add-custom');assert.equal(b.api.state.cart[0].id,'chicken-aloha');assert.equal(b.api.state.cart[0].price,17.90);
});
test('changing pizza variety during cart edit preserves quantity and survives reload',()=>{
 const b=boot({cart:[{...pizza(),qty:2}]});b.click('edit-cart',{index:'0'});b.listeners.change({target:{id:'pizza-variety',value:'beef-supreme'}});b.click('topping',{id:'cheese'});const r=boot(b.saved());assert.ok(r.api.state.editingCart);r.click('add-custom');assert.equal(r.api.state.cart.length,1);assert.equal(r.api.state.cart[0].id,'beef-supreme');assert.equal(r.api.state.cart[0].qty,2);assert.equal(r.api.state.cart[0].price,24.40);
});
test('cancelling a variety change leaves the original cart item intact',()=>{
 const b=boot({cart:[pizza()]});b.click('edit-cart',{index:'0'});b.listeners.change({target:{id:'pizza-variety',value:'spicy-chicken'}});b.click('exit-builder');assert.equal(b.api.state.cart[0].id,'margherita');
});

test('Rewards links to a dedicated game page and winnings update the rewards balance',()=>{
 const b=boot({view:'rewards',points:90,gameWin:1});assert.doesNotMatch(b.api.rewards(),/data-action="game-pick"/);assert.match(b.api.rewards(),/data-action="go-game"/);
 b.click('go-game');assert.equal(b.api.state.view,'game');b.click('game-pick',{index:'1'});assert.equal(b.api.state.points,110);assert.match(b.elements.get('#app').innerHTML,/110/);b.click('back');assert.equal(b.api.state.view,'rewards');assert.match(b.api.rewards(),/Redeem reward/);
 const r=boot(b.saved());assert.equal(r.api.state.points,110);
});
test('game detour retains return-to-checkout context',()=>{
 const b=boot({view:'rewards',rewardsReturn:'checkout',cart:[pizza()]});b.click('go-game');const r=boot(b.saved());assert.equal(r.api.state.view,'game');r.click('back');assert.equal(r.api.state.rewardsReturn,'checkout');r.click('resume-checkout');assert.equal(r.api.state.view,'checkout');
});
test('vouchers have a persistent 30-day expiry and cannot discount after expiry',()=>{
 const clock={now:Date.now()};const b=boot({points:200,view:'rewards',cart:[{id:'fries',qty:1}]},clock);b.click('redeem');const expiry=b.api.state.vouchers[0].expiresAt;assert.equal(expiry,clock.now+30*86400000);assert.match(b.api.rewards(),/Expires/);
 const r=boot(b.saved(),clock);assert.equal(r.api.state.vouchers[0].expiresAt,expiry);r.click('apply-voucher');clock.now=expiry;r.api.render();assert.equal(r.api.state.appliedVoucher,null);r.click('go-vouchers');assert.match(r.elements.get('#app').innerHTML,/Expired/);r.click('apply-voucher');assert.equal(r.api.state.appliedVoucher,null);r.api.placeOrder();assert.equal(r.api.state.order.total,9.90);
});
test('expired vouchers may be redeemed again and old undated vouchers migrate once',()=>{
 const clock={now:Date.now()};const legacy=boot({vouchers:[{id:'free-side'}]},clock);const expiry=legacy.api.state.vouchers[0].expiresAt;clock.now+=86400000;assert.equal(boot(legacy.saved(),clock).api.state.vouchers[0].expiresAt,expiry);
 const expired=boot({points:100,vouchers:[{id:'free-side',expiresAt:clock.now-1}]},clock);expired.click('redeem');assert.equal(expired.api.state.points,0);assert.equal(expired.api.state.vouchers.length,1);assert.equal(expired.api.state.vouchers[0].expiresAt,clock.now+30*86400000);
});
