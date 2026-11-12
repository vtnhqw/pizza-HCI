const fs=require('fs');let s=fs.readFileSync('index.html','utf8');
s=s.replace('  "minus":', '  "trash-2": '+JSON.stringify('<path d="M3 6h18"/><path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M10 11v6"/><path d="M14 11v6"/>')+',\n  "minus":');
s=s.replace('<div class="qty"><button','<div class="cart-item-actions"><div class="qty" role="group" aria-label="Quantity for ${esc(x.name)}"><button');
s=s.replace('<button class="linkbtn remove-item" data-action="remove"','</div><button class="remove-item" data-action="remove"');
s=s.replace('aria-label="Remove ${esc(x.name)}">Remove</button>','aria-label="Remove ${esc(x.name)}" title="Remove item">${icon(\'trash-2\')}</button>');
fs.writeFileSync('index.html',s);
