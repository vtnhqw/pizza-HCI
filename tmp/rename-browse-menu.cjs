const fs=require('fs');
for(const file of ['index.html','tests/prototype.test.cjs','PROJECT.md']){
 let s=fs.readFileSync(file,'utf8').replaceAll('Start ordering','Browse menu');
 if(file==='index.html')s=s.replace('Explore the menu. No account needed.','Take a look before you sign up.').replace('Demo experience · no real orders or payments','All options open Home with a demo account.<br/>No real orders or payments.');
 fs.writeFileSync(file,s);
}
