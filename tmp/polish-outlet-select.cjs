const fs=require('fs');let s=fs.readFileSync('index.html','utf8');
s=s.replace('  "chevron-left":','  "chevron-down": '+JSON.stringify('<path d="m6 9 6 6 6-6"/>')+',\n  "chevron-left":');
s=s.replace('<select id="address" data-field="pickupOutlet" required aria-describedby="fulfillment-hint">','<div class="outlet-select"><select id="address" data-field="pickupOutlet" required>');
s=s.replace("</select>`:`<input id=", "</select>${icon('chevron-down')}</div>`:`<input id=");
const old=s.match(/  <p id="fulfillment-hint".*?<\/p>/)[0];
s=s.replace(old,'  ${state.mode===\'Takeaway\'?\'\':`<p id="fulfillment-hint" class="para">${state.mode===\'Delivery\'?\'Check the complete address before placing your demo order.\':\'Use a fictional location for this demo. No real outlet booking is made.\'}</p>`}');
fs.writeFileSync('index.html',s);
