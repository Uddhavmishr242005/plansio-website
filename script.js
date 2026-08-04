/* ============================================
   PLANSIO - Clean Main Script
   ============================================ */

// ── CONFIG ──
const API_URL = 'http://localhost:5000/api/v1';
const SESSION_ID = localStorage.getItem('sessionId') || 'session_' + Date.now();
localStorage.setItem('sessionId', SESSION_ID);

let authToken = localStorage.getItem('authToken');
let currentUser = null;

// ── API CALL HELPER ──
async function apiCall(endpoint, method = 'GET', data = null) {
  const headers = { 'Content-Type': 'application/json', 'X-Session-ID': SESSION_ID };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);
  try {
    const res = await fetch(API_URL + endpoint, options);
    if (!res.ok && res.status === 401) {
      localStorage.removeItem('authToken');
      authToken = null;
    }
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return null;
  }
}

// ── LEAD FORM HANDLER ──
function handleLeadSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  // Simple validation
  if (!data.name || !data.phone || !data.location || !data.product) {
    showToast('Please fill all fields', 'error');
    return;
  }
  
  // Save lead to localStorage for now
  const leads = JSON.parse(localStorage.getItem('leads') || '[]');
  leads.push({
    ...data,
    timestamp: new Date().toISOString(),
    id: 'lead_' + Date.now()
  });
  localStorage.setItem('leads', JSON.stringify(leads));
  
  showToast('✅ Thank you! We will call you within 24 hours.', 'success');
  form.reset();
}

// ── HERO SLIDER ──
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

// ── NAVBAR ──
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

// ── PRODUCTS ──
async function loadProducts() {
  const res = await apiCall('/products?featured=true&limit=12');
  if (res?.success && res.products?.length) {
    displayProductsGrid(res.products);
  }
}

function displayProductsGrid(products) {
  const gridContainer = document.getElementById('productGrid');
  if (!gridContainer) return;

  gridContainer.innerHTML = products.map(p => `
    <div class="product-card" onclick="viewProduct('${p._id}')">
      <div class="product-image">
        <img src="${p.images?.[0]?.url || 'https://via.placeholder.com/250x250'}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/250x250'">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <h3 class="product-title">${p.title}</h3>
        <p class="product-desc">${p.shortDesc || p.description?.substring(0, 50) + '...'}</p>
        <div class="product-rating">
          ${'★'.repeat(Math.ceil(p.rating || 4))}${'☆'.repeat(5 - Math.ceil(p.rating || 4))}
          <span>(${p.numReviews || 0})</span>
        </div>
        <div class="product-pricing">
          <span class="price">₹${p.price.toLocaleString()}</span>
          ${p.mrp ? `<span class="mrp">₹${p.mrp.toLocaleString()}</span>` : ''}
        </div>
        <button class="btn-add-cart" onclick="addToCart('${p._id}'); event.stopPropagation();">
          🛒 Add to Cart
        </button>
      </div>
    </div>
  `).join('');
}

function viewProduct(productId) {
  window.location.href = `/product.html?id=${productId}`;
}

// ── CART ──
async function addToCart(productId) {
  if (!authToken) {
    const phone = prompt('📱 Enter phone number to login:');
    if (!phone) return;
    const res = await apiCall('/auth/send-otp', 'POST', { phone });
    if (res?.success) {
      const otp = prompt('🔐 Enter 6-digit OTP:');
      if (otp) {
        const verifyRes = await apiCall('/auth/verify-otp', 'POST', { phone, otp, sessionId: SESSION_ID });
        if (verifyRes?.success) {
          authToken = verifyRes.token;
          localStorage.setItem('authToken', authToken);
          currentUser = verifyRes.user;
        } else {
          alert('❌ Invalid OTP');
          return;
        }
      } else return;
    }
  }

  const res = await apiCall('/cart/add', 'POST', { productId, quantity: 1 });
  if (res?.success) {
    alert('✅ Added to cart!');
    updateCartBadge();
  }
}

async function showCart() {
  const res = await apiCall('/cart');
  if (res?.success && res.cart?.items.length) {
    const items = res.cart.items;
    const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const msg = items.map(i => `• ${i.name} x${i.quantity} = ₹${(i.price * i.quantity).toLocaleString()}`).join('\n');
    alert(`🛒 CART\n\n${msg}\n\n━━━━━━━━━━━━\nTotal: ₹${total.toLocaleString()}`);
    if (confirm('Go to Checkout?')) {
      window.location.href = '/checkout.html';
    }
  } else {
    alert('🛒 Your cart is empty');
  }
}

async function updateCartBadge() {
  const res = await apiCall('/cart');
  const count = res?.cart?.items?.length || 0;
  document.querySelectorAll('.cart-badge').forEach(el => el.textContent = count);
}

// ── ORDERS ──
async function showMyOrders() {
  if (!authToken) {
    alert('Please login first');
    handleUser();
    return;
  }
  window.location.href = '/my-orders.html';
}

// ── AUTH ──
async function handleUser() {
  if (authToken) {
    if (confirm('Logout?')) {
      localStorage.removeItem('authToken');
      authToken = null;
      location.reload();
    }
  } else {
    const phone = prompt('📱 Enter phone number:');
    if (!phone) return;
    const res = await apiCall('/auth/send-otp', 'POST', { phone });
    if (res?.success) {
      const otp = prompt('🔐 Enter OTP:');
      if (otp) {
        const verifyRes = await apiCall('/auth/verify-otp', 'POST', { phone, otp, sessionId: SESSION_ID });
        if (verifyRes?.success) {
          authToken = verifyRes.token;
          localStorage.setItem('authToken', authToken);
          currentUser = verifyRes.user;
          alert(`✅ Welcome ${verifyRes.user.name || 'User'}!`);
          location.reload();
        } else {
          alert('❌ Invalid OTP');
        }
      }
    } else {
      alert('❌ Error sending OTP');
    }
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  if (authToken) {
    apiCall('/auth/me').then(res => {
      if (res?.user) {
        currentUser = res.user;
        const userBtn = document.getElementById('userBtn');
        if (userBtn) userBtn.textContent = res.user.name || 'Profile';
      }
    });
  }
  updateCartBadge();
});
