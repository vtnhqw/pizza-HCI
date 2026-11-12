const fs=require('fs'),vm=require('vm');
(async()=>{
const specs=[['lucide','cheese'],['lucide-lab','onion'],['lucide-lab','olive'],['lucide-lab','sausage']];
const entries=await Promise.all(specs.map(async([repo,name])=>{const r=await fetch('https://raw.githubusercontent.com/lucide-icons/'+repo+'/main/icons/'+name+'.svg');if(!r.ok)throw Error(name+': '+r.status);const svg=await r.text();const inner=svg.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/)?.[1];if(!inner)throw Error('Invalid icon '+name);return [name,inner.trim().replace(/\s*\n\s*/g,'')]}));
const r=await fetch('https://raw.githubusercontent.com/lucide-icons/lucide-lab/main/LICENSE');if(!r.ok)throw Error('Lab license: '+r.status);const license=await r.text();
let html=fs.readFileSync('index.html','utf8'),block=html.match(/const ICONS=(\{[\s\S]*?\n\});/),icons=vm.runInNewContext('('+block[1]+')');Object.assign(icons,Object.fromEntries(entries));
html=html.replace(block[0],'const ICONS='+JSON.stringify(icons,null,2)+';');fs.writeFileSync('index.html',html);fs.writeFileSync('assets/lucide/LICENSE-lab',license);
fs.appendFileSync('assets/lucide/README.md','\nIngredient icons added: cheese (Lucide core); onion, olive, sausage (official Lucide Lab). Source: https://github.com/lucide-icons/lucide-lab/tree/main/icons. Lab license retained in LICENSE-lab.\n');
console.log('Added official ingredient icons: '+entries.map(x=>x[0]).join(', '));
})().catch(e=>{console.error(e.message);process.exitCode=1});
