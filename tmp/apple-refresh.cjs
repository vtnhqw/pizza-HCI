const fs=require('fs');
let css=fs.readFileSync('visual.css','utf8');
const colors={'#BD242D':'#C32936','#D63C3F':'#D73A46','#2D2523':'#1D1D1F','#756D68':'#6E6E73','#F7F3EE':'#F2F2F7','#EDE5DC':'#E5E5EA','#FFFCF7':'#F5F5F7','#fff9ef':'#F5F5F7','#fffcf7':'#F5F5F7','#f2ece4':'#E9E9EE','#756b63':'#6E6E73','#72655e':'#6E6E73','#877d74':'#6E6E73','#f9e6de':'#FCECEF','#f6efe6':'#F2F2F7','#7a6552':'#6E6E73','#fff0ec':'#FCECEF','#817260':'#6E6E73','#958577':'#74747A','#978a7f':'#74747A'};
for(const [from,to] of Object.entries(colors))css=css.split(from).join(to);
css=css.replace('/* Pizzazz visual system: local assets, no remote font or image dependencies. */','/* Pizzazz: Apple-inspired surfaces and typography; original mobile structure retained. */');
fs.writeFileSync('visual.css',css);
