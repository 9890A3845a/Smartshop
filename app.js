const $ = (s) => document.querySelector(s);
const money = n => new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR',maximumFractionDigits:2}).format(Number(n));
const demoProducts = [
 {id:'d1',name:'55-inch 4K Smart TV',brand:'Example brand A',category:'Televisions',price:6999,retailer:'Example retailer A',quality:4.2,warranty:2,energy:3.8,specs:'4K UHD, Wi-Fi, 3 HDMI ports',url:'',verified:false,demo:true},
 {id:'d2',name:'50-inch 4K Smart TV',brand:'Example brand B',category:'Televisions',price:6299,retailer:'Example retailer B',quality:4.0,warranty:2,energy:4.1,specs:'4K UHD, Wi-Fi, 2 HDMI ports',url:'',verified:false,demo:true},
 {id:'d3',name:'65-inch 4K Smart TV',brand:'Example brand C',category:'Televisions',price:8999,retailer:'Example retailer C',quality:4.6,warranty:3,energy:3.5,specs:'4K UHD, voice control, 4 HDMI ports',url:'',verified:false,demo:true},
 {id:'d4',name:'Ink-tank All-in-One Printer',brand:'Example brand D',category:'Printers',price:3299,retailer:'Example retailer A',quality:4.3,warranty:1,energy:4.0,specs:'Print, scan, copy, Wi-Fi',url:'',verified:false,demo:true},
 {id:'d5',name:'250L Bottom-Freezer Fridge',brand:'Example brand E',category:'Refrigerators',price:7999,retailer:'Example retailer B',quality:4.1,warranty:2,energy:4.4,specs:'250L capacity, frost-free',url:'',verified:false,demo:true},
 {id:'d6',name:'8kg Front-Load Washer',brand:'Example brand F',category:'Washing machines',price:6499,retailer:'Example retailer C',quality:4.5,warranty:3,energy:4.2,specs:'8kg capacity, 1400 rpm',url:'',verified:false,demo:true}
];
let products = loadProducts();
let selected = [];
function loadProducts(){try{const saved=JSON.parse(localStorage.getItem('smartshop_products'));return Array.isArray(saved)?saved:demoProducts.slice()}catch{return demoProducts.slice()}}
function save(){localStorage.setItem('smartshop_products',JSON.stringify(products))}
function score(p){
 const prices=products.filter(x=>x.category===p.category).map(x=>Number(x.price));
 const min=Math.min(...prices),max=Math.max(...prices);
 const affordability=max===min?5:1+4*(max-Number(p.price))/(max-min);
 const quality=Number(p.quality)||0, warranty=Math.min(Number(p.warranty)||0,5);
 const energy=Number(p.energy)||0;
 return Math.round((affordability/5*30)+(quality/5*25)+(4/5*20)+(warranty/5*15)+(energy/5*10));
}
function icon(cat){return ({Televisions:'📺',Printers:'🖨️',Refrigerators:'🧊','Washing machines':'🧺',Laptops:'💻','Other electronics':'🔌'})[cat]||'📦'}
function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
function render(){
 const q=$('#searchInput').value.toLowerCase().trim(),cat=$('#categoryFilter').value,sort=$('#sortFilter').value;
 let list=products.filter(p=>(cat==='All'||p.category===cat)&&[p.name,p.brand,p.retailer,p.specs].join(' ').toLowerCase().includes(q));
 if(sort==='price-low')list.sort((a,b)=>a.price-b.price);if(sort==='price-high')list.sort((a,b)=>b.price-a.price);if(sort==='score')list.sort((a,b)=>score(b)-score(a));if(sort==='recommended')list.sort((a,b)=>score(b)-score(a));
 $('#productGrid').innerHTML=list.map(p=>`<article class="product-card"><div class="product-visual"><span class="category-tag">${safe(p.category)}</span>${p.demo?'<span class="demo-tag">DEMO DATA</span>':''}<span class="emoji">${icon(p.category)}</span></div><div class="product-info"><span class="product-brand">${safe(p.brand||'Brand not specified')}</span><h3>${safe(p.name)}</h3><span class="product-retailer">${safe(p.retailer||'Retailer not specified')} · ${p.verified?'Details checked':'Unverified details'}</span><div class="price-row"><strong class="price">${money(p.price)}</strong><span class="score-pill">${score(p)}/100 value</span></div><p class="spec-line">${safe(p.specs||'No specifications added')}</p><div class="card-actions"><button class="button ${selected.includes(p.id)?'button-primary':'button-outline'}" data-compare="${safe(p.id)}">${selected.includes(p.id)?'✓ Added':'＋ Add to compare'}</button><button class="button button-outline" data-detail="${safe(p.id)}">Details</button></div></div></article>`).join('');
 $('#emptyState').classList.toggle('hidden',list.length>0);renderCompare();renderCompareDock();
}
function renderCompareDock(){
 const dock=$('#compareDock');
 dock.hidden=selected.length===0;
 $('#compareCount').textContent=`${selected.length} product${selected.length===1?'':'s'} selected (up to 3)`;
}
function renderCompare(){
 const chosen=selected.map(id=>products.find(p=>p.id===id)).filter(Boolean),host=$('#compareContent');
 if(!chosen.length){host.className='compare-empty';host.innerHTML='<div class="compare-empty-icon">⇄</div><h3>Your comparison is waiting</h3><p>Select “Compare” on product cards to see the differences here.</p>';return}
 host.className='compare-table-wrap';
 const rows=[['Product','name'],['Brand','brand'],['Price','price'],['Retailer','retailer'],['Category','category'],['Specifications','specs'],['Quality rating','quality'],['Warranty','warranty'],['Energy efficiency','energy'],['Value score','score'],['Information status','verified']];
 let html='<table class="compare-table"><thead><tr><th>Compare</th>'+chosen.map(p=>`<th>${safe(p.name)}<br><button class="remove-compare" data-remove="${safe(p.id)}">Remove ×</button></th>`).join('')+'</tr></thead><tbody>';
 rows.forEach(([label,key])=>{let vals=chosen.map(p=>key==='price'?money(p.price):key==='score'?score(p)+'/100':key==='quality'?p.quality+'/5':key==='warranty'?p.warranty+' years':key==='energy'?p.energy+'/5':key==='verified'?(p.verified?'Checked by user':'Not verified'):safe(p[key]||'Not provided'));let best=-1;if(key==='price')best=chosen.reduce((a,p,i)=>p.price<chosen[a].price?i:a,0);if(key==='score')best=chosen.reduce((a,p,i)=>score(p)>score(chosen[a])?i:a,0);html+=`<tr><th>${label}</th>${vals.map((v,i)=>`<td class="${i===best?'best-cell':''}">${v}${i===best?'<br><span class="best-label">'+(key==='price'?'LOWEST PRICE':'TOP SCORE')+'</span>':''}</td>`).join('')}</tr>`});
 html+='</tbody></table>';host.innerHTML=html;
}
function openDialog(){$('#productForm').reset();$('#formError').textContent='';$('#productDialog').showModal()}
$('#addTop').onclick=$('#addMain').onclick=openDialog;
$('#closeDialog').onclick=$('#cancelDialog').onclick=()=>$('#productDialog').close();
$('#productForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget),p=Object.fromEntries(f.entries());p.id='p'+Date.now();p.price=Number(p.price);p.quality=Number(p.quality);p.warranty=Number(p.warranty||0);p.energy=Number(p.energy);p.verified=f.has('verified');p.demo=false;if(p.url&&!/^https?:\/\//i.test(p.url)){ $('#formError').textContent='Please enter a valid link beginning with https:// or http://';return}products.unshift(p);save();$('#productDialog').close();render();toast('Product added to your catalogue');});
$('#productGrid').addEventListener('click',e=>{const c=e.target.closest('[data-compare]'),d=e.target.closest('[data-detail]');if(c){const id=c.dataset.compare;if(selected.includes(id))selected=selected.filter(x=>x!==id);else if(selected.length>=3){toast('You can compare up to three products');return}else selected.push(id);render();}if(d){const p=products.find(x=>x.id===d.dataset.detail);if(p)alert(`${p.name}\n\nBrand: ${p.brand||'Not provided'}\nPrice: ${money(p.price)}\nRetailer: ${p.retailer||'Not provided'}\nSpecifications: ${p.specs||'Not provided'}\nWarranty: ${p.warranty} years\nQuality: ${p.quality}/5\nEnergy efficiency: ${p.energy}/5\nValue score: ${score(p)}/100\n\n${p.verified?'Details marked as checked by user.':'Please verify all details with the retailer.'}${p.url?'\n\nProduct link: '+p.url:''}`)}});
$('#compareContent').addEventListener('click',e=>{const r=e.target.closest('[data-remove]');if(r){selected=selected.filter(x=>x!==r.dataset.remove);render()}});
$('#clearCompare').onclick=()=>{selected=[];render()};
$('#openCompare').onclick=()=>document.querySelector('#compare').scrollIntoView({behavior:'smooth',block:'start'});
$('#searchInput').oninput=render;$('#categoryFilter').onchange=render;$('#sortFilter').onchange=render;
$('#year').textContent=new Date().getFullYear();
render();