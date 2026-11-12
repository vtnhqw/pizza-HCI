const fs=require('fs');
const vm=require('vm');
(async()=>{
  let html=fs.readFileSync('index.html','utf8');
  const block=html.match(/const ICONS=(\{[\s\S]*?\n\});/);
  const current=vm.runInNewContext('('+block[1]+')');
  const entries=await Promise.all(Object.keys(current).map(async name=>{
    const url='https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/'+name+'.svg';
    const response=await fetch(url);if(!response.ok)throw new Error(name+': '+response.status);
    const svg=await response.text();const content=svg.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/)?.[1];
    if(!content||!/<(path|circle|rect|line|polyline|polygon|ellipse)\b/.test(content))throw new Error('Invalid SVG '+name);
    return [name,content.trim().replace(/\s*\n\s*/g,'')];
  }));
  html=html.replace(block[0],'const ICONS='+JSON.stringify(Object.fromEntries(entries),null,2)+';');
  html=html.replace('// Inline Lucide SVG references: no package, CDN or network dependency.','// Official Lucide SVG paths vendored from lucide-icons/lucide, 2026-11-12. No runtime network dependency.');
  fs.writeFileSync('index.html',html);
  fs.mkdirSync('assets/lucide',{recursive:true});
  const license=await fetch('https://raw.githubusercontent.com/lucide-icons/lucide/main/LICENSE');
  if(!license.ok)throw new Error('License fetch failed');
  fs.writeFileSync('assets/lucide/LICENSE',await license.text());
  fs.writeFileSync('assets/lucide/README.md','# Lucide icons\n\nOfficial SVG paths from https://github.com/lucide-icons/lucide/tree/main/icons, retrieved 12 November 2026. Embedded in the ICONS object in index.html for offline operation. License retained alongside this file.\n\nIcons: '+entries.map(x=>x[0]).join(', ')+'.\n');
  console.log('Vendored '+entries.length+' official Lucide icons and license.');
})().catch(e=>{console.error(e.message);process.exitCode=1});
