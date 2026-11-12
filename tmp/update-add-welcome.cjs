const fs=require('fs');
const file='index.html';let s=fs.readFileSync(file,'utf8');
s=s.replace("${p.category==='Pizza'?'Customize':'Add'} ${p.name}${p.category==='Pizza'?'':' to cart'}", "Add ${p.name}${p.category==='Pizza'?' — choose size':' to cart'}");
s=s.replace("${p.category==='Pizza'?'Customize':icon('plus')+' Add'}", "${icon('plus')} Add");
s=s.replace('Customize toppings & size','Choose a size · toppings optional').replace('Customize Pizza →','+ Add');
s=s.replace('Margherita → Customize → Add to cart','Margherita → + Add → Choose size → Add to cart');
const a=s.indexOf('function login()');const b=s.indexOf('\nfunction home()',a);
s=s.slice(0,a)+`function login(){return \`<section class="welcome" aria-labelledby="welcome-title"><div class="brand"><img src="assets/pizzazz-mark.svg" alt="" width="42" height="42"/><div class="brand-copy"><span class="brand-name">pizzazz<span style="color:var(--red)">.</span></span><small>PIZZA HUT CONCEPT</small></div></div><p class="welcome-kicker">FRESHLY BAKED. MADE FOR YOU.</p><div class="welcome-visual"><img src="assets/pizza-hero.png" alt="Freshly baked pepperoni pizza with golden crust and basil" width="240" height="240" fetchpriority="high"/><span class="welcome-stamp">\${icon('flame')}Fresh from<br/>the oven</span></div><h1 id="welcome-title">Your next favourite<br/><span>pizza awaits.</span></h1><p class="welcome-copy">Pick your pizza. Make it yours.<br/>We’ll take care of the delicious part.</p><div class="welcome-actions"><button class="primary" data-action="demo-login">Start ordering \${icon('arrow-right')}</button><p class="welcome-guest-note">Explore the menu. No account needed.</p><div class="welcome-account-actions"><button class="outline" data-action="demo-login">Log in</button><button class="outline" data-action="demo-signup">Sign up</button></div></div><p class="welcome-note">Demo experience · no real orders or payments</p></section>\`}
`+s.slice(b);
s=s.replace("${topMarkup()}","${st?topMarkup():''}");
s=s.replace("${state.editingCart?'Edit pizza':'Pizza Builder'}","${state.editingCart?'Edit pizza':st?'Customize pizza':'Add pizza'}");
s=s.replace('${main}<p class="builder-price"','${main}${st===0?`<p class="pizza-choice-note">${p.name} · ${state.toppings.length?state.toppings.map(id=>TOPPINGS.find(t=>t.id===id).name).join(\', \'):\'Original recipe · no extra toppings\'}</p><button class="outline optional-toppings" data-action="builder-next">Customize toppings <span>Optional ${icon(\'chevron-right\')}</span></button>`:\'\'}<p class="builder-price"');
s=s.replace("${st===3?'add-custom':'builder-next'}", "${st===0||st===3?'add-custom':'builder-next'}");
s=s.replace("${st===3?state.editingCart?", "${st===0||st===3?state.editingCart?");
fs.writeFileSync(file,s);
