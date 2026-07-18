const OSS='https://curtisyan.oss-cn-shenzhen.aliyuncs.com/meisubaocai-mini-app/';
const products=[
  {id:'B3',name:'静电袋',subtitle:'电子产品的透明防线',category:'塑料包装',desc:'用于电子产品及敏感器件包装，降低静电积累带来的风险。',images:['静电袋.jpg'],color:'#ff684b'},
  {id:'B8',name:'网格袋',subtitle:'看得见的静电防护',category:'塑料包装',desc:'网格结构兼顾可视性与静电防护，是电子零部件包装的代表产品。',images:['网格防静电袋.jpg'],color:'#8bd3df'},
  {id:'B6',name:'黑色导电袋',subtitle:'稳定屏蔽，强力保护',category:'塑料包装',desc:'黑色导电材料形成稳定屏蔽层，为静电敏感器件提供可靠保护。',images:['黑色导电袋.png'],color:'#b59dff'},
  {id:'B7',name:'黑色防静电袋',subtitle:'遮光与静电防护',category:'塑料包装',desc:'适合需要遮光与静电保护的产品。',images:['黑色防静电袋.jpg'],color:'#f1b1c6'},
  {id:'B2',name:'自封口 PE 袋',subtitle:'柔韧与防护兼得',category:'塑料包装',desc:'便捷密封，可按尺寸、厚度及印刷要求定制。',images:['自封口PE袋.jpg'],color:'#c8f04f'},
  {id:'B5',name:'PE 袋',subtitle:'轻薄、耐用、按需定制',category:'塑料包装',desc:'通用型工业包装，可按需求定制。',images:['PE袋.jpg'],color:'#f3cd45'},
  {id:'A2',name:'海绵',subtitle:'柔软，也可以非常精确',category:'泡棉材料',desc:'多用途缓冲材料，可按产品结构裁切。',images:['海绵1.jpg','海绵2.jpg','海绵3.jpg'],color:'#7ca9ff'},
  {id:'A1',name:'珍珠棉',subtitle:'轻盈缓冲材料',category:'泡棉材料',desc:'用于缓冲、隔离和保护的轻质材料，可按产品结构与尺寸要求裁切成型。',images:['珍珠棉1.png','珍珠棉2.png','珍珠棉3.png','珍珠棉4.jpg'],color:'#ded8cc'},
  {id:'C1',name:'食品级原料',subtitle:'从原料开始控制品质',category:'工厂机器',desc:'从源头把控材料稳定性与洁净度。',images:['食品级原料.jpg'],color:'#c8f04f'},
  {id:'C2',name:'整洁车间',subtitle:'规范、洁净的生产现场',category:'工厂机器',desc:'整洁有序的生产车间，为稳定生产提供保障。',images:['整洁车间.jpg'],color:'#8bd3df'},
  {id:'C3',name:'大型仓库',subtitle:'充足库存与规范仓储',category:'工厂机器',desc:'支持日常供货与定制订单周转。',images:['大型仓库.png'],color:'#f1b1c6'},
  {id:'C4',name:'机器设备',subtitle:'三组生产设备实景',category:'工厂机器',desc:'左右滑动可连续查看三张设备图片。',images:['机器设备1.jpg','机器设备2.jpg','机器设备3.jpg'],color:'#ff684b'}
];
const url=name=>OSS+encodeURIComponent(name);
const byId=id=>products.find(product=>product.id===id);
const device=document.querySelector('#device');
const hero=document.querySelector('#hero');
const modal=document.querySelector('#detailModal');
const sheet=document.querySelector('#detailSheet');
let activeProduct=products[0],detailIndex=0;
document.querySelector('#year').textContent=new Date().getFullYear();
document.querySelector('#heroImage').src=url(activeProduct.images[0]);

const productList=document.querySelector('#productList');
products.slice(1,8).forEach((product,index)=>{
  const card=document.createElement('button');
  card.className='product-card';card.dataset.product=product.id;card.style.setProperty('--card',product.color);
  card.innerHTML=`<span class="card-color"></span><img loading="lazy" src="${url(product.images[0])}" alt="${product.name}"><span class="card-copy"><span>${String(index+2).padStart(3,'0')} / ${product.category}</span><div><h3>${product.name}</h3><p>${product.subtitle}</p></div><i>↗</i></span>`;
  productList.appendChild(card);
});

function showPage(name){
  document.querySelectorAll('.page').forEach(page=>page.classList.toggle('is-active',page.dataset.name===name));
  document.querySelectorAll('.dock button').forEach(button=>button.classList.toggle('is-active',button.dataset.page===name));
  const index=['home','category','contact'].indexOf(name);device.style.setProperty('--dock-x',`${index*100}%`);
  window.scrollTo({top:0,behavior:'smooth'});
}
document.addEventListener('click',event=>{const target=event.target.closest('[data-page]');if(!target)return;closeDetail();showPage(target.dataset.page)});

let heroStart=null;
function setHeroMotion(dx,dy){const x=Math.max(-90,Math.min(90,dx)),y=Math.max(-70,Math.min(70,dy));hero.style.setProperty('--dx',`${x}px`);hero.style.setProperty('--dy',`${y}px`);hero.style.setProperty('--ry',`${x/12}deg`);hero.style.setProperty('--rx',`${-y/15}deg`)}
hero.addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;heroStart={x:event.clientX,y:event.clientY};hero.classList.remove('is-releasing');hero.setPointerCapture(event.pointerId)});
hero.addEventListener('pointermove',event=>{if(!heroStart)return;setHeroMotion(event.clientX-heroStart.x,event.clientY-heroStart.y)});
function releaseHero(){if(!heroStart)return;heroStart=null;hero.classList.add('is-releasing');setHeroMotion(0,0)}
hero.addEventListener('pointerup',releaseHero);hero.addEventListener('pointercancel',releaseHero);

function renderDetail(product){
  activeProduct=product;detailIndex=0;
  document.querySelector('#detailNumber').textContent=`${String(products.indexOf(product)+1).padStart(3,'0')} / ${product.category}`;
  document.querySelector('#detailName').textContent=product.name;
  document.querySelector('#detailSubtitle').textContent=product.subtitle;
  document.querySelector('#detailDescription').textContent=product.desc;
  const track=document.querySelector('#detailTrack'),dots=document.querySelector('#detailDots');track.innerHTML='';dots.innerHTML='';
  product.images.forEach((image,index)=>{track.insertAdjacentHTML('beforeend',`<img draggable="false" src="${url(image)}" alt="${product.name} ${index+1}">`);dots.insertAdjacentHTML('beforeend',`<i class="${index===0?'active':''}"></i>`)});
  updateDetailTrack();
}
function updateDetailTrack(){document.querySelector('#detailTrack').style.transform=`translateX(${-detailIndex*100}%)`;document.querySelectorAll('#detailDots i').forEach((dot,index)=>dot.classList.toggle('active',index===detailIndex))}
function openDetail(product){renderDetail(product);modal.classList.remove('is-closing');modal.classList.add('is-open');modal.setAttribute('aria-hidden','false')}
function closeDetail(){if(!modal.classList.contains('is-open'))return;modal.classList.add('is-closing');setTimeout(()=>{modal.classList.remove('is-open','is-closing');sheet.style.removeProperty('--sheet-y')},500)}
document.querySelector('#heroOpen').addEventListener('click',event=>{event.stopPropagation();openDetail(products[0])});
productList.addEventListener('click',event=>{const card=event.target.closest('[data-product]');if(card)openDetail(byId(card.dataset.product))});
document.querySelector('.modal-mask').addEventListener('click',closeDetail);document.querySelector('.sheet-dismiss').addEventListener('click',closeDetail);

let mediaStart=0;
document.querySelector('.detail-media').addEventListener('pointerdown',event=>mediaStart=event.clientX);
document.querySelector('.detail-media').addEventListener('pointerup',event=>{const dx=event.clientX-mediaStart;if(Math.abs(dx)>45&&activeProduct.images.length>1){detailIndex=dx<0?Math.min(activeProduct.images.length-1,detailIndex+1):Math.max(0,detailIndex-1);updateDetailTrack()}});
let sheetStart=null;
sheet.addEventListener('pointerdown',event=>{if(sheet.scrollTop>0)return;sheetStart=event.clientY;sheet.classList.add('is-dragging')});
sheet.addEventListener('pointermove',event=>{if(sheetStart===null)return;const dy=Math.max(0,event.clientY-sheetStart);sheet.style.setProperty('--sheet-y',`${dy}px`)});
sheet.addEventListener('pointerup',event=>{if(sheetStart===null)return;const dy=event.clientY-sheetStart;sheetStart=null;sheet.classList.remove('is-dragging');if(dy>110)closeDetail();else sheet.style.setProperty('--sheet-y','0px')});

const categories=[{name:'塑料包装',en:'PLASTIC PACKAGING',color:'#ff684b'},{name:'泡棉材料',en:'FOAM MATERIAL',color:'#c8f04f'},{name:'工厂机器',en:'FACTORY & MACHINES',color:'#7ca9ff'}];
const categoryIndex=document.querySelector('#categoryIndex');
categories.forEach((category,index)=>{const count=products.filter(product=>product.category===category.name).length;categoryIndex.insertAdjacentHTML('beforeend',`<article class="category-row ${index===0?'is-current':''}" style="--cat:${category.color}" data-category="${category.name}"><span class="cat-orbit"></span><button><small>0${index+1} / ${category.en}</small><h2>${category.name}</h2><p>${String(count).padStart(2,'0')} ITEMS　↗</p></button></article>`)});
const catObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting&&entry.intersectionRatio>.62){document.querySelectorAll('.category-row').forEach(row=>{row.classList.toggle('is-current',row===entry.target);row.classList.toggle('is-near',row!==entry.target)})}}),{threshold:[.62]});document.querySelectorAll('.category-row').forEach(row=>catObserver.observe(row));
categoryIndex.addEventListener('click',event=>{const row=event.target.closest('.category-row');if(row)openCollection(row.dataset.category)});
function openCollection(category){
  const backdrop=document.createElement('div'),panel=document.createElement('section');backdrop.className='collection-backdrop';panel.className='collection';
  panel.innerHTML=`<div class="collection-head"><div><span class="kicker">CATEGORY COLLECTION</span><h2>${category}</h2></div><button class="collection-close">×</button></div><div class="collection-grid"></div>`;
  products.filter(product=>product.category===category).forEach(product=>panel.querySelector('.collection-grid').insertAdjacentHTML('beforeend',`<button class="collection-item" data-product="${product.id}"><span>${product.subtitle}</span><b>${product.name}</b><img loading="lazy" src="${url(product.images[0])}" alt="${product.name}"></button>`));
  device.append(backdrop,panel);panel.querySelector('.collection-close').onclick=()=>{backdrop.remove();panel.remove()};panel.querySelector('.collection-grid').onclick=event=>{const item=event.target.closest('[data-product]');if(item)openDetail(byId(item.dataset.product))};
}

const listObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const card=entry.target;const rect=card.getBoundingClientRect(),center=innerHeight/2;card.style.setProperty('--shift',`${Math.max(-18,Math.min(18,(rect.top+rect.height/2-center)*-.045))}px`)}),{threshold:[0,.5,1]});document.querySelectorAll('.product-card').forEach(card=>listObserver.observe(card));

const showcaseTabs=document.querySelector('.showcase-tabs');
showcaseTabs.addEventListener('click',event=>{
  const button=event.target.closest('[data-showcase-option]');if(!button)return;
  showcaseTabs.querySelectorAll('[data-showcase-option]').forEach(item=>item.classList.toggle('is-active',item===button));
  document.querySelectorAll('[data-showcase-panel]').forEach(panel=>panel.classList.toggle('is-active',panel.dataset.showcasePanel===button.dataset.showcaseOption));
});

const specimenAssets=[
  '01-meisu-red-v2.png','02-botanical-white.png','03-sfy-grid.png',
  '04-sfy-pattern-purple.png','05-sfy-seal-black.png','06-amber-abstract.png'
];
const specimenLayout=[
  ['8%','7%','45%','30%'],['49%','8%','43%','29%'],['7%','34%','46%','31%'],
  ['49%','35%','44%','30%'],['10%','63%','42%','29%'],['49%','62%','45%','30%']
];
const specimenPath=name=>`../assets/oss/contact-playground/${name}`;
document.querySelectorAll('[data-specimen-scene]').forEach(scene=>{
  specimenAssets.forEach((asset,index)=>{
    const [left,top,width,height]=specimenLayout[index];
    scene.insertAdjacentHTML('beforeend',`<button class="specimen-piece" style="--left:${left};--top:${top};--width:${width};--height:${height}" aria-label="可拖动产品样本"><span class="specimen-piece-body"><img loading="lazy" draggable="false" src="${specimenPath(asset)}" alt="包装产品样本"></span></button>`);
  });
  let drag=null;
  scene.addEventListener('pointerdown',event=>{
    const piece=event.target.closest('.specimen-piece');if(!piece)return;
    drag={piece,x:event.clientX,y:event.clientY,moved:false};piece.classList.add('is-dragging');piece.setPointerCapture(event.pointerId);
  });
  scene.addEventListener('pointermove',event=>{
    if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(Math.abs(dx)>4||Math.abs(dy)>4)drag.moved=true;
    drag.piece.style.setProperty('--drag-x',`${dx}px`);drag.piece.style.setProperty('--drag-y',`${dy}px`);drag.piece.style.setProperty('--tilt',`${Math.max(-7,Math.min(7,dx*.06))}deg`);
  });
  const release=()=>{
    if(!drag)return;const {piece,moved}=drag;drag=null;piece.classList.remove('is-dragging');
    piece.style.setProperty('--drag-x','0px');piece.style.setProperty('--drag-y','0px');piece.style.setProperty('--tilt','0deg');
    if(!moved){piece.classList.remove('is-popping');void piece.offsetWidth;piece.classList.add('is-popping');setTimeout(()=>piece.classList.remove('is-popping'),650)}
  };
  scene.addEventListener('pointerup',release);scene.addEventListener('pointercancel',release);
});

const qr=document.querySelector('#qrModal');qr.querySelector('img').src=url('微信二维码.jpeg');document.querySelector('#wechatOpen').onclick=()=>{qr.classList.add('is-open');qr.setAttribute('aria-hidden','false')};qr.querySelector('.qr-mask').onclick=()=>{qr.classList.remove('is-open');qr.setAttribute('aria-hidden','true')};
