/* ============================================
   PLANSIO - Main Website Script (FIXED)
   ============================================ */

// ---- HERO SLIDER ----
(function(){
  const slider = document.getElementById('heroSlider');
  if(!slider) return;
  const slides = slider.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hdot');
  const prev   = document.getElementById('hPrev');
  const next   = document.getElementById('hNext');
  let cur = 0, timer;

  function goTo(n){
    cur = (n + slides.length) % slides.length;
    slider.style.transform = `translateX(-${cur * 100}%)`;
    dots.forEach((d,i) => d.classList.toggle('active', i===cur));
  }
  function start(){ timer = setInterval(()=>goTo(cur+1), 4500); }
  function reset(){ clearInterval(timer); start(); }

  prev?.addEventListener('click', ()=>{ goTo(cur-1); reset(); });
  next?.addEventListener('click', ()=>{ goTo(cur+1); reset(); });
  dots.forEach((d,i) => d.addEventListener('click', ()=>{ goTo(i); reset(); }));
  start();
})();

// ---- NAVBAR ----
const navHam  = document.getElementById('navHam');
const mobMenu = document.getElementById('mobMenu');
const mobBg   = document.getElementById('mobBg');

function closeMob(){
  mobMenu?.classList.remove('open');
  mobBg?.classList.remove('open');
  navHam?.classList.remove('open');
}
navHam?.addEventListener('click', ()=>{
  mobMenu.classList.add('open');
  mobBg.classList.add('open');
  navHam.classList.add('open');
});

window.addEventListener('scroll', ()=>{
  const nav = document.getElementById('navbar');
  if(nav) nav.style.boxShadow = window.scrollY > 10
    ? '0 4px 20px rgba(0,0,0,.10)' : 'none';
});

// ---- PAYMENT SWITCH ----
function showPayInfo(val){
  document.querySelectorAll('.pay-info').forEach(el=>el.classList.remove('active'));
  document.getElementById('pay-'+val)?.classList.add('active');
}

// ---- QTY ----
function changeQty(delta){
  const inp = document.getElementById('o-qty');
  if(!inp) return;
  inp.value = Math.max(1, Math.min(50, parseInt(inp.value)+delta));
  calcTotal();
}

// ---- ORDER TOTAL ----
function calcTotal(){
  const sel = document.getElementById('o-product');
  const qty = parseInt(document.getElementById('o-qty')?.value)||1;
  const amtEl  = document.getElementById('otAmt');
  const totEl  = document.getElementById('otTotal');
  if(!sel||!amtEl||!totEl) return;
  if(!sel.value){ amtEl.textContent='₹0'; totEl.textContent='₹0'; return; }
  const price = parseInt(sel.value.split('|')[1])||0;
  const total = price*qty;
  amtEl.textContent = '₹'+total.toLocaleString('en-IN');
  totEl.textContent = '₹'+total.toLocaleString('en-IN');
}

// ---- COPY UPI ----
function copyUPI(){
  navigator.clipboard?.writeText('Plansio.Jk@okicici').catch(()=>{});
  showToast('✅ UPI ID copied!');
}

// ---- CATEGORY FILTER ----
function filterCat(e, cat){
  e.preventDefault();
  document.querySelectorAll('.cat-item').forEach(el=>el.classList.remove('cat-selected'));
  e.currentTarget.classList.add('cat-selected');

  const banner = document.getElementById('comingSoonBanner');
  const title  = document.getElementById('pgrid-title');

  const names = {
    all:'All Products', fertiliser:'Fertilisers', pestcontrol:'Pest Control',
    combo:'Combo Pack', plants:'Plants', soils:'Soils', seeds:'Seeds',
    tools:'Garden Tools', watering:'Watering', pots:'Pots'
  };
  const soon = ['plants','soils','seeds','tools','watering','pots'];

  if(soon.includes(cat)){
    if(banner) banner.style.display='block';
    const t = document.getElementById('csb-title');
    if(t) t.textContent = (names[cat]||cat)+' — Coming Soon!';
    document.querySelectorAll('.pgcard').forEach(c=>c.style.display='none');
    if(title) title.textContent = names[cat]||cat;
    banner?.scrollIntoView({behavior:'smooth',block:'nearest'});
    return;
  }

  if(banner) banner.style.display='none';
  if(title) title.textContent = names[cat]||'All Products';

  document.querySelectorAll('.pgcard').forEach(card=>{
    const cats = card.dataset.cat||'';
    card.style.display = (cat==='all'||cats.includes(cat)) ? '' : 'none';
  });
  document.getElementById('products')?.scrollIntoView({behavior:'smooth',block:'start'});
}

// ---- WISHLIST ----
function toggleWishlist(btn){
  btn.classList.toggle('wishlisted');
  const name = btn.closest('.pgcard')?.querySelector('.pgcard-name')?.textContent||'Item';
  if(btn.classList.contains('wishlisted')){
    btn.innerHTML='<i class="fa fa-heart"></i>';
    showToast('❤️ '+name+' added to wishlist!');
  } else {
    btn.innerHTML='<i class="far fa-heart"></i>';
    showToast('💔 Removed from wishlist');
  }
}

// ---- SELECT PRODUCT FROM GRID (scrolls to order) ----
function selectProduct(val){
  const sel = document.getElementById('o-product');
  if(sel){
    for(let opt of sel.options){
      if(opt.value===val){ sel.value=val; break; }
    }
  }
  calcTotal();
  setTimeout(()=>{
    document.getElementById('order')?.scrollIntoView({behavior:'smooth',block:'start'});
  },100);
}

// ---- SUBMIT ORDER ----
function submitOrder(e){
  e.preventDefault();
  const name  = document.getElementById('o-name').value.trim();
  const phone = document.getElementById('o-phone').value.trim();
  const prod  = document.getElementById('o-product').value;
  const addr  = document.getElementById('o-address').value.trim();

  if(!name){ showToast('⚠️ Please enter your name'); return; }
  if(!/^[6-9][0-9]{9}$/.test(phone)){ showToast('⚠️ Enter valid 10-digit phone number'); return; }
  if(!prod){ showToast('⚠️ Please select a product'); return; }
  if(addr.length<10){ showToast('⚠️ Enter complete delivery address'); return; }

  const [product, priceStr] = prod.split('|');
  const qty     = parseInt(document.getElementById('o-qty').value)||1;
  const amount  = (parseInt(priceStr)||0)*qty;
  const orderId = 'PL-'+Date.now().toString().slice(-7);
  const date    = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  const payment = document.getElementById('o-payment').value;
  const email   = document.getElementById('o-email')?.value.trim()||'';
  const notes   = document.getElementById('o-notes')?.value.trim()||'';

  try{
    const saved = localStorage.getItem('plansio_admin_data');
    const data  = saved ? JSON.parse(saved) : {};
    if(!data.orders) data.orders=[];
    data.orders.push({id:orderId,date,name,phone,email,product,qty,amount,payment,address:addr,notes,status:'Pending'});
    localStorage.setItem('plansio_admin_data', JSON.stringify(data));
  }catch(err){}

  document.getElementById('omOrderId').textContent = 'Order ID: '+orderId;
  document.getElementById('orderModal').classList.add('open');
  e.target.reset();
  calcTotal();
  showPayInfo('COD');
}

function closeModal(){
  document.getElementById('orderModal').classList.remove('open');
}
document.getElementById('orderModal')?.addEventListener('click',function(e){
  if(e.target===this) closeModal();
});

// ---- TOAST ----
function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.remove('show'),3000);
}

// ---- LOAD ADMIN IMAGES (IndexedDB) ----
async function loadAdminImages(){
  if(!window.PlansioMedia) return;
  try{
    // Hero slides
    for(let i=1;i<=3;i++){
      const img = await window.PlansioMedia.getMedia('slide'+i);
      if(!img) continue;
      const slide = document.querySelectorAll('.hero-slide')[i-1];
      if(slide) slide.innerHTML = `<img src="${img}" class="hero-slide-img" style="width:100%;object-fit:cover;display:block;"/>`;
    }
    // Product card images
    const imgBoxMap = {
      'vermicompost-main':['img-box-p1','img-box-p2'],
      'neem-main':['img-box-p3'],
      'combo-pack':['img-box-p4']
    };
    for(const [key,ids] of Object.entries(imgBoxMap)){
      const img = await window.PlansioMedia.getMedia(key);
      if(!img) continue;
      ids.forEach(id=>{
        const box = document.getElementById(id);
        if(box) box.innerHTML = `<img src="${img}" style="width:100%;height:100%;object-fit:contain;padding:.5rem"/>`;
      });
    }
    // Logo
    const logo = await window.PlansioMedia.getMedia('logo');
    if(logo){
      document.querySelectorAll('.navbar-logo img, .mob-logo, .footer-logo').forEach(el=>{ el.src=logo; });
    }
  }catch(e){ console.warn('loadAdminImages:',e); }
}

// ---- LOAD ADMIN PRODUCTS ----
async function loadAdminProducts(){
  try{
    const saved = localStorage.getItem('plansio_admin_data');
    if(!saved) return;
    const data = JSON.parse(saved);
    if(!data.products || !data.products.length) return;
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    grid.querySelectorAll('.pgcard-admin').forEach(c=>c.remove());
    const sel = document.getElementById('o-product');
    if(sel) sel.querySelectorAll('.admin-option').forEach(o=>o.remove());
    for(const p of data.products){
      // Add to dropdown
      if(sel && p.stock!=='Out of Stock'){
        const opt = document.createElement('option');
        opt.value = `${p.name}|${p.price}`;
        opt.textContent = `${p.name} ${p.weight} — ₹${p.price.toLocaleString('en-IN')}`;
        opt.className = 'admin-option';
        sel.appendChild(opt);
      }
      // Get product image from IndexedDB
      let imgHtml = `<span class="pgcard-emoji">🌿</span>`;
      try{
        const prodImg = await window.PlansioMedia.getMedia('product_'+p.id);
        if(prodImg) imgHtml = `<img src="${prodImg}" style="width:100%;height:100%;object-fit:contain;padding:.5rem"/>`;
      }catch(e){}
      const discount = p.mrp>p.price ? Math.round((1-p.price/p.mrp)*100) : 0;
      const isFree = p.price===0;
      let catTag = 'all';
      const nl = (p.name||'').toLowerCase();
      if(nl.includes('vermi')) catTag='fertiliser all';
      else if(nl.includes('neem')) catTag='pestcontrol all';
      else if(nl.includes('combo')) catTag='combo all';
      const card = document.createElement('div');
      card.className='pgcard pgcard-admin';
      card.dataset.cat=catTag;
      card.innerHTML=`
        <div class="pgcard-img-wrap">
          <span class="pgcard-badge bestseller">${p.badge||'NEW'}</span>
          <div class="pgcard-img-box">${imgHtml}</div>
          <button class="pgcard-wishlist" onclick="toggleWishlist(this)"><i class="far fa-heart"></i></button>
        </div>
        <div class="pgcard-info">
          <div class="pgcard-rating"><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><span>5.0</span></div>
          <h3 class="pgcard-name">${p.name}</h3>
          <p class="pgcard-sub">${p.subtitle||''} ${p.weight?'· '+p.weight:''}</p>
          <div class="pgcard-price">
            <span class="pgcard-sp ${isFree?'free-price':''}">${isFree?'FREE':'₹'+p.price.toLocaleString('en-IN')}</span>
            ${p.mrp>p.price?`<span class="pgcard-mrp"><del>₹${p.mrp.toLocaleString('en-IN')}</del></span>`:''}
            ${discount>0?`<span class="pgcard-off">${discount}% off</span>`:''}
          </div>
          <p class="pgcard-free"><i class="fa fa-gift"></i> + FREE Neem Powder 50g</p>
          <button class="pgcard-btn" onclick="selectProduct('${p.name}|${p.price}')">View Product</button>
        </div>`;
      grid.appendChild(card);
    }
  }catch(e){ console.warn('loadAdminProducts:',e); }
}

// ---- LOAD VIDEOS ----
async function loadAdminVideos(){
  if(!window.PlansioMedia) return;
  try{
    for(let i=1;i<=3;i++){
      const video = await window.PlansioMedia.getMedia('video'+i);
      const title = await window.PlansioMedia.getMedia('video'+i+'_title');
      const card = document.getElementById('vcard-'+i);
      const inner = document.getElementById('vinner-'+i);
      const titleEl = document.getElementById('vtitle-'+i);
      if(video && inner){
        inner.innerHTML=`<video src="${video}" controls playsinline muted loop style="width:100%;height:100%;object-fit:cover;"></video>
          <div class="vrc-play-btn"><i class="fa fa-play"></i></div>`;
      }
      if(title && titleEl) titleEl.textContent = title;
    }
  }catch(e){ console.warn('loadAdminVideos:',e); }
}

// ---- SCROLL ANIMATIONS ----
function initAOS(){
  const els = document.querySelectorAll('[data-aos]');
  if(!els.length) return;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach((entry,i)=>{
      if(entry.isIntersecting){
        setTimeout(()=>entry.target.classList.add('aos-in'), i*80);
        obs.unobserve(entry.target);
      }
    });
  },{threshold:0.08,rootMargin:'0px 0px -30px 0px'});
  els.forEach(el=>obs.observe(el));
}

// ---- BACK TO TOP ----
function initBackToTop(){
  const btn = document.createElement('button');
  btn.innerHTML='<i class="fa fa-chevron-up"></i>';
  btn.setAttribute('aria-label','Back to top');
  Object.assign(btn.style,{
    position:'fixed',bottom:'2rem',right:'2rem',
    width:'44px',height:'44px',borderRadius:'50%',
    background:'#2d8a45',color:'#fff',border:'none',
    cursor:'pointer',display:'none',alignItems:'center',
    justifyContent:'center',fontSize:'1rem',
    boxShadow:'0 4px 16px rgba(0,0,0,.2)',zIndex:'999',
    transition:'all .3s'
  });
  document.body.appendChild(btn);
  window.addEventListener('scroll',()=>{ btn.style.display=window.scrollY>500?'flex':'none'; });
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  btn.addEventListener('mouseenter',()=>{ btn.style.background='#1a5c2a'; btn.style.transform='translateY(-3px)'; });
  btn.addEventListener('mouseleave',()=>{ btn.style.background='#2d8a45'; btn.style.transform='translateY(0)'; });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded',()=>{
  initAOS();
  initBackToTop();
  calcTotal();
  showPayInfo('COD');
  loadAdminImages();
  loadAdminProducts();
  loadAdminVideos();
});
