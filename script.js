/* ============================================
   PLANSIO - Complete Script
   ============================================ */

// ============================================
// NAVBAR
// ============================================
const hamburger = document.getElementById('hamburger');
const mobDrawer  = document.getElementById('mobDrawer');
const mobOverlay = document.getElementById('mobOverlay');

function openMob()  { mobDrawer.classList.add('open'); mobOverlay.classList.add('open'); hamburger.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeMob() { mobDrawer.classList.remove('open'); mobOverlay.classList.remove('open'); hamburger.classList.remove('open'); document.body.style.overflow = ''; }

if (hamburger) hamburger.addEventListener('click', () => mobDrawer.classList.contains('open') ? closeMob() : openMob());

// Sticky shadow
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.13)' : '0 2px 12px rgba(0,0,0,0.07)';
});

// ============================================
// SCROLL ANIMATIONS (data-aos)
// ============================================
function initAOS() {
  const els = document.querySelectorAll('[data-aos]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.aosDelay || 0;
        setTimeout(() => e.target.classList.add('aos-animate'), parseInt(delay));
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

// ============================================
// PAYMENT METHOD SWITCHER
// ============================================
function switchPayment(method) {
  // Update selected styling
  ['cod','upi','bank'].forEach(m => {
    const lbl = document.getElementById('pml-' + m);
    if (lbl) lbl.classList.remove('selected');
  });
  const map = { COD: 'cod', UPI: 'upi', 'Bank Transfer': 'bank' };
  const selLbl = document.getElementById('pml-' + map[method]);
  if (selLbl) selLbl.classList.add('selected');

  // Show correct info panel
  ['COD','UPI','Bank'].forEach(m => {
    const panel = document.getElementById('pi-' + m);
    if (panel) panel.classList.add('hidden');
  });
  const key = method === 'Bank Transfer' ? 'Bank' : method;
  const active = document.getElementById('pi-' + key);
  if (active) active.classList.remove('hidden');
}

// ============================================
// QUANTITY CONTROL
// ============================================
function changeQty(delta) {
  const inp = document.getElementById('o-qty');
  if (!inp) return;
  const current = parseInt(inp.value) || 1;
  const newVal = Math.min(50, Math.max(1, current + delta));
  inp.value = newVal;
  calcTotal();
}

// ============================================
// ORDER TOTAL CALCULATOR
// ============================================
function calcTotal() {
  const sel = document.getElementById('o-product');
  const qty = parseInt(document.getElementById('o-qty')?.value) || 1;
  const prodAmt = document.getElementById('otProductAmt');
  const grandTotal = document.getElementById('otGrandTotal');
  if (!sel || !prodAmt || !grandTotal) return;
  if (!sel.value) { prodAmt.textContent = '₹0'; grandTotal.textContent = '₹0'; return; }
  const price = parseInt(sel.value.split('|')[1]) || 0;
  const total = price * qty;
  prodAmt.textContent  = '₹' + total.toLocaleString('en-IN');
  grandTotal.textContent = '₹' + total.toLocaleString('en-IN');
}

// ============================================
// COPY TO CLIPBOARD
// ============================================
function copyText(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('✅ ' + (label || text) + ' copied!');
  }).catch(() => {
    // Fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast('✅ Copied!');
  });
}

// ============================================
// FORM VALIDATION
// ============================================
function validateForm() {
  const name    = document.getElementById('o-name').value.trim();
  const phone   = document.getElementById('o-phone').value.trim();
  const product = document.getElementById('o-product').value;
  const address = document.getElementById('o-address').value.trim();

  if (!name) { showToast('⚠️ Please enter your full name'); document.getElementById('o-name').focus(); return false; }
  if (!phone || !/^[6-9][0-9]{9}$/.test(phone)) { showToast('⚠️ Enter a valid 10-digit mobile number'); document.getElementById('o-phone').focus(); return false; }
  if (!product) { showToast('⚠️ Please select a product'); document.getElementById('o-product').focus(); return false; }
  if (!address || address.length < 10) { showToast('⚠️ Please enter a complete delivery address'); document.getElementById('o-address').focus(); return false; }
  return true;
}

// ============================================
// SUBMIT ORDER
// ============================================
function submitOrder(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const name    = document.getElementById('o-name').value.trim();
  const phone   = document.getElementById('o-phone').value.trim();
  const email   = document.getElementById('o-email')?.value.trim() || '';
  const prodVal = document.getElementById('o-product').value;
  const qty     = parseInt(document.getElementById('o-qty').value) || 1;
  const address = document.getElementById('o-address').value.trim();
  const payment = document.querySelector('input[name="payment"]:checked')?.value || 'COD';
  const notes   = document.getElementById('o-notes')?.value.trim() || '';

  const [product, priceStr] = prodVal.split('|');
  const price  = parseInt(priceStr) || 0;
  const amount = price * qty;
  const orderId = 'PL-' + Date.now().toString().slice(-7);
  const now = new Date();
  const date = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const order = { id: orderId, date, name, phone, email, product, qty, amount, payment, address, notes, status: 'Pending' };

  // Save to localStorage (admin panel reads this)
  try {
    const saved = localStorage.getItem('plansio_admin_data');
    const data = saved ? JSON.parse(saved) : {};
    if (!data.orders) data.orders = [];
    data.orders.push(order);
    localStorage.setItem('plansio_admin_data', JSON.stringify(data));
  } catch(err) { console.warn('Could not save order:', err); }

  // Show modal
  const oidEl = document.getElementById('modalOid');
  const payNote = document.getElementById('modalPayNote');
  if (oidEl) oidEl.textContent = 'Order ID: ' + orderId;
  if (payNote) {
    if (payment === 'UPI') payNote.textContent = '📱 Please complete UPI payment to: Plansio.Jk@okicici';
    else if (payment === 'Bank Transfer') payNote.textContent = '🏦 Please complete bank transfer and share UTR on WhatsApp: 9358572425';
    else payNote.textContent = '💵 Pay in cash when your order is delivered.';
  }
  document.getElementById('orderModal').classList.add('open');
  e.target.reset();
  calcTotal();
  // Reset payment UI
  switchPayment('COD');
  document.querySelector('input[name="payment"][value="COD"]').checked = true;
}

function closeModal() {
  document.getElementById('orderModal').classList.remove('open');
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('orderModal');
  if (modal && e.target === modal) closeModal();
});

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================
// BACK TO TOP BUTTON
// ============================================
function initBackToTop() {
  const btn = document.createElement('button');
  btn.innerHTML = '<i class="fa fa-chevron-up"></i>';
  btn.setAttribute('aria-label', 'Back to top');
  Object.assign(btn.style, {
    position: 'fixed', bottom: '2rem', right: '2rem',
    width: '44px', height: '44px', borderRadius: '50%',
    background: '#2d8a45', color: '#fff', border: 'none',
    cursor: 'pointer', display: 'none', alignItems: 'center',
    justifyContent: 'center', fontSize: '1rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: '999',
    transition: 'all 0.3s ease'
  });
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => { btn.style.display = window.scrollY > 500 ? 'flex' : 'none'; });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  btn.addEventListener('mouseenter', () => { btn.style.background = '#1a5c2a'; btn.style.transform = 'translateY(-3px)'; });
  btn.addEventListener('mouseleave', () => { btn.style.background = '#2d8a45'; btn.style.transform = 'translateY(0)'; });
}

// ============================================
// LOAD PRODUCT VARIANTS FROM ADMIN DATA
// ============================================
function loadVariantsFromAdmin() {
  try {
    const saved = localStorage.getItem('plansio_admin_data');
    if (!saved) return;
    const data = JSON.parse(saved);
    if (!data.variants || !data.variants.length) return;

    const sel = document.getElementById('o-product');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Select Pack —</option>';
    data.variants.forEach(v => {
      if (v.stock !== 'Out of Stock') {
        const opt = document.createElement('option');
        opt.value = `${v.name}|${v.price}`;
        opt.textContent = `${v.name} — ₹${v.price.toLocaleString('en-IN')}`;
        sel.appendChild(opt);
      }
    });
  } catch(e) {}
}

// ============================================
// INIT ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initBackToTop();
  loadVariantsFromAdmin();
  calcTotal();

  // Set COD panel visible by default
  switchPayment('COD');

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
});
