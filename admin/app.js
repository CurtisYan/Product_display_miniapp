let catalog, editingItem=null, editingCategory=-1, draggedCategory=-1, draggedItem=null
const $=selector=>document.querySelector(selector)
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
const OSS='https://curtisyan.oss-cn-shenzhen.aliyuncs.com/meisubaocai-mini-app/'
const imageUrl=value=>/^https?:\/\//.test(value)?value:OSS+value.split('/').map(encodeURIComponent).join('/')
const thumbUrl=value=>{const url=imageUrl(value);if(!url.includes('curtisyan.oss-cn-shenzhen.aliyuncs.com')||url.includes('x-oss-process='))return url;return url+(url.includes('?')?'&':'?')+'x-oss-process=image/resize,w_320,limit_1/format,webp/quality,q_76'}
const settingKeys=['headlinePrimary','headlineSecondary','intro','marqueeText','contactTitle','contactIntro','contactSlogan','website','websiteLabel']

async function load(){
  catalog=await fetch('/api/catalog').then(response=>response.json())
  catalog.products=[...(catalog.products||[]),...(catalog.companyShowcase||[])]
  catalog.companyShowcase=[]
  catalog.products.forEach(item=>{item.images=(item.images||[]).map(imageUrl)})
  catalog.categories=(catalog.categories||inferCategories()).map(category=>({id:category.id||'category-'+Date.now(),name:category.name}))
  for(const key of settingKeys)$('#'+key).value=catalog.settings[key]||''
  render()
}
function inferCategories(){return [...new Set(catalog.products.map(item=>item.category))].map((name,index)=>({id:'category-'+index,name}))}
function itemsFor(category){return catalog.products.filter(item=>item.category===category.name)}
function setItems(category,ordered){const positions=[];catalog.products.forEach((item,index)=>{if(item.category===category.name)positions.push(index)});positions.forEach((position,index)=>catalog.products[position]=ordered[index])}

function render(){
  $('#categories').innerHTML=catalog.categories.map((category,categoryIndex)=>{const items=itemsFor(category);return `<section class="category-panel" draggable="true" data-category="${categoryIndex}"><div class="category-head"><div class="category-order">${String(categoryIndex+1).padStart(2,'0')}</div><div><b>${escapeHtml(category.name)}</b><small>${items.length} 个展示项</small></div><div class="category-actions"><button data-add-item="${categoryIndex}">＋ 添加</button><button data-edit-category="${categoryIndex}">配置</button></div></div><div class="category-items" data-drop-category="${categoryIndex}">${items.map((item,itemIndex)=>`<article class="item" draggable="true" data-category="${categoryIndex}" data-item="${itemIndex}"><div class="number">${String(itemIndex+1).padStart(2,'0')}</div><img class="thumb" src="${escapeHtml(thumbUrl(item.images[0]||''))}" loading="lazy" decoding="async" alt="${escapeHtml(item.name)}"><div class="copy"><b>${escapeHtml(item.name)}</b><span>${escapeHtml(item.subtitle)}</span></div><div class="actions"><button class="hero ${catalog.settings.heroId===item.id?'active':''}" data-hero="${escapeHtml(item.id)}">${catalog.settings.heroId===item.id?'首页主推':'设为主推'}</button><button data-edit-item="${categoryIndex}:${itemIndex}">编辑</button></div></article>`).join('')||'<p class="empty">这个大类还没有展示项</p>'}</div></section>`}).join('')
  bind()
}

function bind(){
  document.querySelectorAll('.category-panel').forEach(panel=>{panel.ondragstart=event=>{if(event.target!==panel)return;draggedCategory=+panel.dataset.category;panel.classList.add('dragging')};panel.ondragend=()=>panel.classList.remove('dragging');panel.ondragover=event=>event.preventDefault();panel.ondrop=event=>{if(draggedCategory<0)return;event.preventDefault();const target=+panel.dataset.category;if(target!==draggedCategory)catalog.categories.splice(target,0,catalog.categories.splice(draggedCategory,1)[0]);draggedCategory=-1;render()}})
  document.querySelectorAll('.item').forEach(row=>{row.ondragstart=event=>{event.stopPropagation();draggedItem={category:+row.dataset.category,index:+row.dataset.item};row.classList.add('dragging')};row.ondragend=()=>row.classList.remove('dragging');row.ondragover=event=>event.preventDefault();row.ondrop=event=>{event.stopPropagation();event.preventDefault();const categoryIndex=+row.dataset.category,target=+row.dataset.item;if(!draggedItem||draggedItem.category!==categoryIndex)return;const category=catalog.categories[categoryIndex],items=itemsFor(category);items.splice(target,0,items.splice(draggedItem.index,1)[0]);setItems(category,items);draggedItem=null;render()}})
  document.querySelectorAll('[data-hero]').forEach(button=>button.onclick=()=>{catalog.settings.heroId=button.dataset.hero;render()})
  document.querySelectorAll('[data-edit-item]').forEach(button=>button.onclick=()=>{const [category,index]=button.dataset.editItem.split(':').map(Number);openItem(category,index)})
  document.querySelectorAll('[data-add-item]').forEach(button=>button.onclick=()=>openItem(+button.dataset.addItem,-1))
  document.querySelectorAll('[data-edit-category]').forEach(button=>button.onclick=()=>openCategory(+button.dataset.editCategory))
}

function getImageValues(){return [...document.querySelectorAll('[data-image-input]')].map(input=>input.value.trim())}
function renderImagePreviews(){const values=getImageValues().filter(Boolean).map(imageUrl);$('#image-previews').innerHTML=values.map((url,index)=>`<figure class="image-preview"><img src="${escapeHtml(url)}" alt="图片 ${index+1}"><figcaption>${index+1}. ${escapeHtml(url)}</figcaption></figure>`).join('')}
function renderImageFields(values){const list=values.length?values:[''];$('#image-fields').innerHTML=list.map((value,index)=>`<div class="image-field-row"><span class="image-field-number">${String(index+1).padStart(2,'0')}</span><input data-image-input value="${escapeHtml(value)}" placeholder="https://curtisyan.oss-cn-shenzhen.aliyuncs.com/..."><button type="button" class="image-field-remove" data-remove-image="${index}" ${list.length===1?'disabled':''}>删除</button></div>`).join('');document.querySelectorAll('[data-image-input]').forEach(input=>input.addEventListener('input',renderImagePreviews));document.querySelectorAll('[data-remove-image]').forEach(button=>button.onclick=()=>{const next=getImageValues();next.splice(+button.dataset.removeImage,1);renderImageFields(next);renderImagePreviews()});renderImagePreviews()}
function openItem(categoryIndex,itemIndex){editingItem={categoryIndex,itemIndex};const category=catalog.categories[categoryIndex],item=itemIndex<0?{id:'P'+Date.now(),name:'新展示项',subtitle:'',description:'',category:category.name,images:[]}:itemsFor(category)[itemIndex],form=$('#editor form');for(const key of ['id','name','subtitle','description'])form.elements[key].value=item[key]||'';renderImageFields((item.images||[]).map(imageUrl));form.elements.limited.checked=!!item.limited;$('#delete').style.visibility=itemIndex<0?'hidden':'visible';$('#editor').showModal()}
$('#editor').addEventListener('close',()=>{if($('#editor').returnValue!=='save'||!editingItem)return;const {categoryIndex,itemIndex}=editingItem,category=catalog.categories[categoryIndex],form=$('#editor form'),item={category:category.name};for(const key of ['id','name','subtitle','description'])item[key]=form.elements[key].value.trim();item.images=getImageValues().filter(Boolean).map(imageUrl);if(form.elements.limited.checked)item.limited=true;if(itemIndex<0)catalog.products.push(item);else{const old=itemsFor(category)[itemIndex],position=catalog.products.indexOf(old);catalog.products[position]=item}editingItem=null;render()})
$('#delete').onclick=()=>{if(!editingItem||editingItem.itemIndex<0)return;const category=catalog.categories[editingItem.categoryIndex],item=itemsFor(category)[editingItem.itemIndex];if(confirm('确定删除这个展示项？')){catalog.products.splice(catalog.products.indexOf(item),1);$('#editor').close('cancel');editingItem=null;render()}}

function openCategory(index){editingCategory=index;const category=index<0?{id:'category-'+Date.now(),name:'新大类'}:catalog.categories[index],form=$('#category-editor form');form.elements.name.value=category.name;$('#delete-category').style.visibility=index<0?'hidden':'visible';$('#category-editor').showModal()}
$('#category-editor').addEventListener('close',()=>{if($('#category-editor').returnValue!=='save')return;const form=$('#category-editor form'),old=editingCategory<0?null:catalog.categories[editingCategory],next={id:old?.id||'category-'+Date.now(),name:form.elements.name.value.trim()};if(old&&old.name!==next.name)catalog.products.forEach(item=>{if(item.category===old.name)item.category=next.name});if(editingCategory<0)catalog.categories.push(next);else catalog.categories[editingCategory]=next;render()})
$('#delete-category').onclick=()=>{const category=catalog.categories[editingCategory];if(category&&itemsFor(category).length===0&&confirm('确定删除这个空大类？')){catalog.categories.splice(editingCategory,1);$('#category-editor').close('cancel');render()}else if(category)toast('请先删除大类中的展示项')}
$('#add-category').onclick=()=>openCategory(-1)
$('#save').onclick=async()=>{for(const key of settingKeys)catalog.settings[key]=$(`#${key}`).value.trim();$('#save').disabled=true;$('#save').textContent='保存并构建中…';try{const response=await fetch('/api/catalog',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(catalog)});const result=await response.json();toast(result.ok?'配置已保存，小程序已自动构建':result.message)}finally{$('#save').disabled=false;$('#save').textContent='保存配置'}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2400)}
$('#add-image').onclick=()=>{const values=getImageValues();values.push('');renderImageFields(values);document.querySelectorAll('[data-image-input]')[values.length-1].focus()}
load()
