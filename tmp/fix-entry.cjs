const fs=require('fs');
let s=fs.readFileSync('index.html','utf8');
s=s.replace("if(s.view==='home'&&!s.visualRefreshSeen)","if(raw?.view==='home'&&s.view==='home'&&!s.visualRefreshSeen)");
fs.writeFileSync('index.html',s);
let t=fs.readFileSync('tests/prototype.test.cjs','utf8');
t=t.replace("test('Lucide navigation is rendered as locally available SVG',()=>{const b=boot();", "test('Lucide navigation is rendered as locally available SVG',()=>{const b=boot();b.click('demo-login');");
fs.writeFileSync('tests/prototype.test.cjs',t);
