/* ============================================
   PLANSIO Admin Script - Complete
   ============================================ */

// ============================================
// DEFAULT DATA
// ============================================
const DEFAULTS = {
  password: 'plansio123',
  products: [
    {
      id: 'p1', name: 'PLANSIO Vermicompost', subtitle: 'PREMIUM DEEP-NUTRIENT FERTILIZER',
      weight: '1 KG', type: 'vermicompost', price: 299, mrp: 499,
      stock: 'In Stock', badge: 'Best Seller',
      desc: 'Made from natural organic sources, PLANSIO Vermicompost improves soil structure, retains moisture and boosts plant growth naturally.',
      features: 'Stronger Roots\nFaster Growth\nBetter Fruits/Flowers\nFertile Soil',
      tagline: 'Nurture Your Soil', n: '1.5–2.0%', p: '1.0–1.5%', k: '1.0–1.5%', free: 'yes'
    },
    {
      id: 'p2', name: 'PLANSIO Vermicompost', subtitle: 'PREMIUM DEEP-NUTRIENT FERTILIZER',
      weight: '5 KG', type: 'vermicompost', price: 999, mrp: 1499,
      stock: 'In Stock', badge: '',
      desc: 'Economy pack for farms and large gardens. Same premium quality in a bigger size for extended use.',
      features: 'Stronger Roots\nFaster Growth\nBetter Fruits/Flowers\nFertile Soil',
      tagline: 'Nurture Your Soil', n: '1.5–2.0%', p: '1.0–1.5%', k: '1.0–1.5%', free: 'yes'
    },
    {
      id: 'p3', name: 'PLANSIO Neem Powder', subtitle: 'NATURAL PEST CONTROL · PREMIUM QUALITY',
      weight: '50g', type: 'neem', price: 0, mrp: 99,
      stock: 'In Stock', badge: 'FREE',
      desc: 'Pure neem powder for natural pest control and soil enrichment. Also great for skin and hair.',
      features: 'Pure Neem Power\nFor Plants · Skin · Hair\nNatural · Safe · Chemical-Free',
      tagline: 'Enrich Your Soil, Naturally', n: '', p: '', k: '', free: 'no'
    },
    {
      id: 'p4', name: 'PLANSIO Combo Pack', subtitle: '2 VERMICOMPOST + 2 NEEM POWDER',
      weight: 'Combo', type: 'vermicompost', price: 549, mrp: 796,
      stock: 'In Stock', badge: 'Best Value',
      desc: '2 Vermicompost (1KG each) + 2 Neem Powder (50g each FREE). Perfect combo for healthy plants.',
      features: 'Boosts Growth\nRich in Nutrients\nEco Friendly\nSafe & Effective',
      tagline: 'Nourish Your Plants The Natural Way', n: '1.5–2.0%', p: '1.0–1.5%', k: '1.0–1.5%', free: 'yes'
    }
  ],
  nutrients: { n: '1.5–2.0%', p: '1.0–1.5%', k: '1.0–1.5%', extra: [] },
  howtoSteps: [
    'Fill pot with soil. Loosen the topsoil 2–3 inches deep for best absorption.',
    'Add PLANSIO Vermicompost (50–100g) evenly around the plant roots.',
    'Mix evenly with soil using a small garden trowel.',
    'Water the plant thoroughly and watch healthy growth.'
  ],
  caution: [
    'Keep out of reach of children.',
    'Do not ingest. Wash hands after use.',
    'Avoid inhalation of dust during application.',
    'Store in cool, dry place away from direct sunlight.'
  ],
  manufacturer: {
    brand: 'PLANSIO', firm: 'J.K. Enterprises',
    phone: '9358572425', email: 'Plansio.Jk@gmail.com',
    address: 'Pratapsinghpura Road, Madhosinghpura, Neemrana, Kotputli-Behror, Rajasthan',
    about: 'J.K. Enterprises is a trusted manufacturer of premium organic fertilizers committed to sustainable agriculture.',
    tagline: 'Healthy Soil, Healthy Harvest'
  },
  payment: {
    upi: 'Plansio.Jk@okicici', upiName: 'J.K. Enterprises',
    accName: 'J.K. Enterprises', accNum: '', ifsc: '', bank: '',
    wa: '919358572425'
  },
  orders: []
};

// ============================================
// STATE
// ============================================
let D = {};

function load() {
  try {
    const s = localStorage.getItem('plansio_admin_data');
    D = s ? { ...DEFAULTS, ...JSON.parse(s) } : { ...DEFAULTS };
    if (!D.products) D.products = [...DEFAULTS.products];
    if (!D.orders)   D.orders   = [];
    if (!D.nutrients) D.nutrients = { ...DEFAULTS.nutrients };
    if (!D.manufacturer) D.manufacturer = { ...DEFAULTS.manufacturer };
    if (!D.payment) D.payment = { ...DEFAULTS.payment };
    if (!D.howtoSteps) D.howtoSteps = [...DEFAULTS.howtoSteps];
    if (!D.caution) D.caution = [...DEFAULTS.caution];
  } catch(e) { D = { ...DEFAULTS }; }
}

function persist() {
  localStorage.setItem('plansio_admin_data', JSON.stringify(D));
}

// ============================================
// LOGIN / LOGOUT
// ============================================
function doLogin() {
  const pass = document.getElementById('loginPass').value;
  load();
  if (pass === D.password) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    initAdmin();
  } else {
    showToast('❌ Wrong password. Try again.', 'error');
    document.getElementById('loginPass').value = '';
    document.getElementById('loginPass').focus();
  }
}

function doLogout() {
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginPass').value = '';
}

function togglePass() {
  const inp = document.getElementById('loginPass');
  const ico = document.getElementById('eyeIcon');
  if (inp.type === 'password') { inp.type = 'text'; ico.className = 'fa fa-eye-slash'; }
  else { inp.type = 'password'; ico.className = 'fa fa-eye'; }
}

// ============================================
// INIT
// ============================================
function initAdmin() {
  load();
  fillForms();
  renderProducts();
  renderOrders();
  renderExtraNutrients();
  renderHowtoSteps();
  renderCautionItems();
  renderTemplateList();
  updateDashboard();
  updateBadges();
  initSidebar();
  initTabs();
}

// ============================================
// SIDEBAR + TABS
// ============================================
function initSidebar() {
  const ham = document.getElementById('tbHam');
  const sb  = document.getElementById('sidebar');
  const cls = document.getElementById('sbClose');
  if (ham) ham.addEventListener('click', () => sb.classList.add('open'));
  if (cls) cls.addEventListener('click', () => sb.classList.remove('open'));
}

function initTabs() {
  document.querySelectorAll('.sbn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.dataset.tab;
      if (tab) switchTab(tab);
      if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
    });
  });
  document.querySelectorAll('.link-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); switchTab(btn.dataset.tab); });
  });
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sbn').forEach(n => n.classList.remove('active'));
  const tab = document.getElementById('tab-' + name);
  const nav = document.querySelector(`.sbn[data-tab="${name}"]`);
  if (tab) tab.classList.add('active');
  if (nav) nav.classList.add('active');
  const titles = {
    dashboard:'Dashboard', products:'Products', template:'Product Templates',
    orders:'Orders', nutrients:'Nutrients / NPK', howto:'How to Use',
    manufacturer:'Manufacturer', payment:'Payment Settings', password:'Change Password'
  };
  document.getElementById('tbTitle').textContent = titles[name] || name;
  if (name === 'dashboard') updateDashboard();
  if (name === 'orders') renderOrders();
  if (name === 'template') renderTemplateList();
}

// ============================================
// FILL FORMS
// ============================================
function fillForms() {
  const sv = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  const m = D.manufacturer;
  sv('m-brand', m.brand); sv('m-firm', m.firm); sv('m-phone', m.phone);
  sv('m-email', m.email); sv('m-address', m.address);
  sv('m-about', m.about); sv('m-tagline', m.tagline);
  const n = D.nutrients;
  sv('n-val', n.n); sv('p-val', n.p); sv('k-val', n.k);
  const p = D.payment;
  sv('pay-upi', p.upi); sv('pay-upi-name', p.upiName);
  sv('pay-acc-name', p.accName); sv('pay-acc-num', p.accNum);
  sv('pay-ifsc', p.ifsc); sv('pay-bank', p.bank); sv('pay-wa', p.wa);
}

// ============================================
// SAVE ALL
// ============================================
function saveAll() {
  collectForms();
  collectExtraNutrients();
  collectHowtoSteps();
  collectCautionItems();
  persist();
  updateDashboard();
  updateBadges();
  showToast('✅ All changes saved!', 'success');
}

function collectForms() {
  const gv = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  D.manufacturer = {
    brand: gv('m-brand'), firm: gv('m-firm'), phone: gv('m-phone'),
    email: gv('m-email'), address: gv('m-address'),
    about: gv('m-about'), tagline: gv('m-tagline')
  };
  D.nutrients.n = gv('n-val'); D.nutrients.p = gv('p-val'); D.nutrients.k = gv('k-val');
  D.payment = {
    upi: gv('pay-upi'), upiName: gv('pay-upi-name'),
    accName: gv('pay-acc-name'), accNum: gv('pay-acc-num'),
    ifsc: gv('pay-ifsc'), bank: gv('pay-bank'), wa: gv('pay-wa')
  };
}

// ============================================
// DASHBOARD
// ============================================
function updateDashboard() {
  const orders = D.orders || [];
  const total     = orders.length;
  const pending   = orders.filter(o => o.status === 'Pending').length;
  const shipped   = orders.filter(o => o.status === 'Shipped').length;
  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const cancelled = orders.filter(o => o.status === 'Cancelled').length;
  const revenue   = orders.filter(o => o.status !== 'Cancelled').reduce((s,o) => s + (o.amount||0), 0);
  const sv = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  sv('dsTotalOrders', total); sv('dsPending', pending); sv('dsShipped', shipped);
  sv('dsDelivered', delivered); sv('dsCancelled', cancelled);
  sv('dsRevenue', '₹' + revenue.toLocaleString('en-IN'));
  renderRecentOrders();
}

function updateBadges() {
  const pending = (D.orders||[]).filter(o => o.status === 'Pending').length;
  const pEl = document.getElementById('badgeOrders');
  if (pEl) pEl.textContent = pending;
  const prEl = document.getElementById('badgeProducts');
  if (prEl) prEl.textContent = (D.products||[]).length;
}

function renderRecentOrders() {
  const tbody = document.getElementById('recentTbody');
  if (!tbody) return;
  const orders = [...(D.orders||[])].reverse().slice(0, 5);
  if (!orders.length) { tbody.innerHTML = '<tr><td colspan="7" class="no-data">No orders yet</td></tr>'; return; }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.name}</td>
      <td>${o.product}</td>
      <td>${o.qty}</td>
      <td><strong>₹${(o.amount||0).toLocaleString('en-IN')}</strong></td>
      <td>${o.payment}</td>
      <td><span class="status-badge s-${o.status}">${o.status}</span></td>
    </tr>`).join('');
}

// ============================================
// ORDERS
// ============================================
function renderOrders() {
  const tbody = document.getElementById('ordersTbody');
  if (!tbody) return;
  const filter = document.getElementById('orderFilter')?.value || 'all';
  const search = (document.getElementById('orderSearch')?.value || '').toLowerCase();
  let orders = [...(D.orders||[])].reverse();
  if (filter !== 'all') orders = orders.filter(o => o.status === filter);
  if (search) orders = orders.filter(o =>
    o.name?.toLowerCase().includes(search) ||
    o.phone?.toLowerCase().includes(search) ||
    o.id?.toLowerCase().includes(search)
  );
  if (!orders.length) { tbody.innerHTML = '<tr><td colspan="11" class="no-data">No orders found</td></tr>'; return; }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td style="white-space:nowrap">${o.date}</td>
      <td>${o.name}</td>
      <td><a href="tel:${o.phone}" style="color:#2d8a45;font-weight:700">${o.phone}</a></td>
      <td>${o.product}</td>
      <td style="text-align:center">${o.qty}</td>
      <td><strong>₹${(o.amount||0).toLocaleString('en-IN')}</strong></td>
      <td>${o.payment}</td>
      <td style="max-width:160px;font-size:.72rem;color:#6b7280">${o.address}</td>
      <td>
        <select class="order-status-sel" onchange="updateOrderStatus('${o.id}', this.value)">
          ${['Pending','Confirmed','Shipped','Delivered','Cancelled'].map(s =>
            `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`
          ).join('')}
        </select>
      </td>
      <td>
        <button class="btn-sm-del" onclick="deleteOrder('${o.id}')">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>`).join('');
}

function updateOrderStatus(id, status) {
  const order = D.orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    persist();
    updateDashboard();
    updateBadges();
    showToast(`✅ Order ${id} → ${status}`, 'success');
  }
}

function deleteOrder(id) {
  if (!confirm(`Delete order ${id}?`)) return;
  D.orders = D.orders.filter(o => o.id !== id);
  persist();
  renderOrders();
  updateDashboard();
  updateBadges();
  showToast('🗑️ Order deleted');
}

function clearAllOrders() {
  if (!confirm('Delete ALL orders? This cannot be undone!')) return;
  D.orders = [];
  persist();
  renderOrders();
  updateDashboard();
  updateBadges();
  showToast('🗑️ All orders cleared');
}

// ============================================
// PRODUCTS LIST
// ============================================
function renderProducts() {
  const el = document.getElementById('productsList');
  if (!el) return;
  if (!D.products.length) {
    el.innerHTML = '<div style="text-align:center;color:#6b7280;padding:2rem">No products yet. Add your first product!</div>';
    return;
  }
  el.innerHTML = D.products.map((p, i) => {
    const thumb = p.type === 'neem' ? 'pi-thumb-neem' : p.type === 'custom' ? 'pi-thumb-custom' : 'pi-thumb-verm';
    const ico   = p.type === 'neem' ? '🌿' : '🌱';
    const stockClass = p.stock === 'In Stock' ? 'stock-in' : p.stock === 'Out of Stock' ? 'stock-out' : 'stock-limited';
    const priceDisplay = p.price === 0 ? '<span style="color:#065f46;font-weight:800">FREE</span>' :
      `<span class="pi-price-tag">₹${p.price.toLocaleString('en-IN')}</span>` +
      (p.mrp > p.price ? `<span class="pi-mrp-tag">₹${p.mrp.toLocaleString('en-IN')}</span>` : '');
    return `
      <div class="product-item" id="pitem-${p.id}">
        <div class="pi-thumb ${thumb}">${ico}</div>
        <div class="pi-info">
          <h4>${p.name}</h4>
          <p>${p.subtitle || ''} ${p.weight ? '· ' + p.weight : ''}</p>
          <div class="pi-info-row">
            ${priceDisplay}
            <span class="pi-stock-tag ${stockClass}">${p.stock}</span>
            ${p.badge ? `<span style="background:#fef3c7;color:#92400e;font-size:.68rem;font-weight:800;padding:.12rem .45rem;border-radius:50px">${p.badge}</span>` : ''}
          </div>
        </div>
        <div class="pi-actions">
          <button class="btn-sm-preview" onclick="previewProductTemplate('${p.id}')">
            <i class="fa fa-eye"></i> Preview
          </button>
          <button class="btn-sm-edit" onclick="openEditProduct('${p.id}')">
            <i class="fa fa-edit"></i> Edit
          </button>
          <button class="btn-sm-del" onclick="deleteProduct('${p.id}')">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>`;
  }).join('');
  updateBadges();
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  D.products = D.products.filter(p => p.id !== id);
  persist();
  renderProducts();
  renderTemplateList();
  showToast('🗑️ Product deleted');
}

// ============================================
// ADD / EDIT PRODUCT MODAL
// ============================================
function openAddProduct() {
  clearProductForm();
  document.getElementById('productModalTitle').textContent = 'Add New Product';
  document.getElementById('pm-id').value = '';
  document.getElementById('productModal').classList.add('open');
  updateTemplatePreview();
}

function openEditProduct(id) {
  const p = D.products.find(x => x.id === id);
  if (!p) return;
  clearProductForm();
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('pm-id').value    = p.id;
  document.getElementById('pm-name').value  = p.name || '';
  document.getElementById('pm-subtitle').value = p.subtitle || '';
  document.getElementById('pm-weight').value   = p.weight || '';
  document.getElementById('pm-type').value     = p.type || 'vermicompost';
  document.getElementById('pm-price').value    = p.price || '';
  document.getElementById('pm-mrp').value      = p.mrp || '';
  document.getElementById('pm-stock').value    = p.stock || 'In Stock';
  document.getElementById('pm-badge').value    = p.badge || '';
  document.getElementById('pm-desc').value     = p.desc || '';
  document.getElementById('pm-features').value = p.features || '';
  document.getElementById('pm-tagline').value  = p.tagline || '';
  document.getElementById('pm-n').value = p.n || '';
  document.getElementById('pm-p').value = p.p || '';
  document.getElementById('pm-k').value = p.k || '';
  document.getElementById('pm-free').value = p.free || 'yes';
  document.getElementById('productModal').classList.add('open');
  updateTemplatePreview();
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

function clearProductForm() {
  ['pm-name','pm-subtitle','pm-weight','pm-price','pm-mrp','pm-badge','pm-desc','pm-features','pm-tagline','pm-n','pm-p','pm-k'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const typeEl = document.getElementById('pm-type'); if (typeEl) typeEl.value = 'vermicompost';
  const stockEl = document.getElementById('pm-stock'); if (stockEl) stockEl.value = 'In Stock';
  const freeEl = document.getElementById('pm-free'); if (freeEl) freeEl.value = 'yes';
}

function saveProduct() {
  const name = document.getElementById('pm-name').value.trim();
  const weight = document.getElementById('pm-weight').value.trim();
  const price = parseInt(document.getElementById('pm-price').value) || 0;
  if (!name) { showToast('⚠️ Product name is required', 'error'); return; }
  if (!weight) { showToast('⚠️ Weight/Size is required', 'error'); return; }

  const id = document.getElementById('pm-id').value || ('p' + Date.now());
  const product = {
    id, name, weight,
    subtitle:  document.getElementById('pm-subtitle').value.trim(),
    type:      document.getElementById('pm-type').value,
    price,
    mrp:       parseInt(document.getElementById('pm-mrp').value) || price,
    stock:     document.getElementById('pm-stock').value,
    badge:     document.getElementById('pm-badge').value.trim(),
    desc:      document.getElementById('pm-desc').value.trim(),
    features:  document.getElementById('pm-features').value.trim(),
    tagline:   document.getElementById('pm-tagline').value.trim(),
    n:         document.getElementById('pm-n').value.trim(),
    p:         document.getElementById('pm-p').value.trim(),
    k:         document.getElementById('pm-k').value.trim(),
    free:      document.getElementById('pm-free').value
  };

  const existing = D.products.findIndex(x => x.id === id);
  if (existing >= 0) D.products[existing] = product;
  else D.products.push(product);

  persist();
  renderProducts();
  renderTemplateList();
  closeProductModal();
  showToast(`✅ "${name}" saved!`, 'success');
}

// ============================================
// PRODUCT TEMPLATE GENERATOR
// ============================================
function buildProductTemplate(p, mode) {
  // mode: 'card' (compact for modal preview) | 'full' (for template page)
  const features = (p.features || '').split('\n').filter(f => f.trim());
  const discount = p.mrp > p.price && p.price > 0 ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  const pktClass = p.type === 'neem' ? 'pt-pkt-neem' : p.type === 'custom' ? 'pt-pkt-custom' : 'pt-pkt-verm';
  const emoji = p.type === 'neem' ? '🌿' : '🌱';
  const stockColor = p.stock === 'In Stock' ? '#065f46' : p.stock === 'Out of Stock' ? '#991b1b' : '#92400e';
  const stockBg = p.stock === 'In Stock' ? '#d1fae5' : p.stock === 'Out of Stock' ? '#fee2e2' : '#fef3c7';
  const badgeClass = p.badge === 'Best Seller' ? 'pt-badge-gold' :
                     p.badge === 'FREE' ? 'pt-badge-green' :
                     p.badge === 'New' ? 'pt-badge-blue' : 'pt-badge-orange';
  const priceHtml = p.price === 0
    ? '<span style="font-size:1.3rem;font-weight:900;color:#065f46">FREE</span>'
    : `<span class="pt-price">₹${p.price.toLocaleString('en-IN')}</span>
       ${p.mrp > p.price ? `<span class="pt-mrp">₹${p.mrp.toLocaleString('en-IN')}</span>` : ''}
       ${discount > 0 ? `<span class="pt-save">Save ${discount}%</span>` : ''}`;

  if (mode === 'full') {
    return `
      <div class="preview-full-card">
        <div class="pfc-top">
          <div class="pfc-brand-row">
            <span class="pfc-brand">${p.name.split(' ')[0] || 'PLANSIO'}</span>
            <span class="pfc-weight-badge">${p.weight}</span>
            ${p.badge ? `<span class="pt-badge ${badgeClass}" style="font-size:.68rem">${p.badge}</span>` : ''}
          </div>
          <div class="pfc-product">${p.name.split(' ').slice(1).join(' ') || p.name}</div>
          ${p.subtitle ? `<div class="pfc-subtitle">${p.subtitle}</div>` : ''}
          <span class="pfc-organic">100% ORGANIC &amp; NATURAL</span>
          <div class="pfc-visual">
            <div class="pfc-emoji">${emoji}</div>
            ${p.tagline ? `<div class="pfc-tagline">"${p.tagline}"</div>` : ''}
          </div>
        </div>
        <div class="pfc-middle">
          ${p.desc ? `<p class="pfc-desc">${p.desc}</p>` : ''}
          ${features.length ? `<div class="pfc-features">${features.map(f => `<div class="pfc-feat"><i class="fa fa-check-circle"></i> ${f}</div>`).join('')}</div>` : ''}
          ${(p.n || p.p || p.k) ? `
          <div class="pfc-npk">
            ${p.n ? `<div class="pfc-npk-chip pt-n"><span class="pt-npk-sym">N</span><span class="pt-npk-val">${p.n}</span><span class="pt-npk-lbl">Nitrogen</span></div>` : ''}
            ${p.p ? `<div class="pfc-npk-chip pt-p"><span class="pt-npk-sym">P</span><span class="pt-npk-val">${p.p}</span><span class="pt-npk-lbl">Phosphorus</span></div>` : ''}
            ${p.k ? `<div class="pfc-npk-chip pt-k"><span class="pt-npk-sym">K</span><span class="pt-npk-val">${p.k}</span><span class="pt-npk-lbl">Potassium</span></div>` : ''}
          </div>` : ''}
        </div>
        <div class="pfc-bottom">
          <div class="pfc-price-row">${priceHtml}</div>
          ${p.free === 'yes' ? `<div class="pfc-free"><i class="fa fa-gift"></i> + FREE Neem Powder 50g (worth ₹99)</div>` : ''}
          <button class="pfc-btn"><i class="fa fa-shopping-cart"></i> Order Now</button>
          <div class="pfc-mfg">Mfd. by: ${D.manufacturer?.firm || 'J.K. Enterprises'} | ${D.manufacturer?.tagline || 'Healthy Soil, Healthy Harvest'}</div>
        </div>
      </div>`;
  }

  // COMPACT CARD for modal live preview
  return `
    <div class="prod-template">
      <div class="pt-header">
        <div>
          ${p.badge ? `<span class="pt-badge ${badgeClass}">${p.badge}</span>` : '<span></span>'}
        </div>
        <span class="pt-stock" style="background:${stockBg};color:${stockColor}">${p.stock}</span>
      </div>
      <div class="pt-visual">
        <div class="pt-packet-css ${pktClass}">
          <div class="pt-brand">${p.name.split(' ')[0] || 'PLANSIO'}</div>
          <div class="pt-name">${p.name.split(' ').slice(1).join(' ') || ''}</div>
          <div class="pt-organic-strip">100% ORGANIC &amp; NATURAL</div>
          <div class="pt-emoji">${emoji}</div>
          ${features.length ? `<div class="pt-feats">${features.slice(0,4).map(f => `<span><i class="fa fa-check"></i>${f}</span>`).join('')}</div>` : ''}
          <div class="pt-weight">${p.weight} | ${p.tagline || 'NURTURE YOUR SOIL'}</div>
        </div>
      </div>
      ${p.tagline ? `<div class="pt-tagline-strip">"${p.tagline}"</div>` : ''}
      <div class="pt-body">
        ${p.desc ? `<p class="pt-desc">${p.desc.substring(0,120)}${p.desc.length>120?'…':''}</p>` : ''}
        ${(p.n||p.p||p.k) ? `<div class="pt-npk">
          ${p.n?`<div class="pt-npk-item pt-n"><span class="pt-npk-sym">N</span><span class="pt-npk-val">${p.n}</span><span class="pt-npk-lbl">Nitrogen</span></div>`:''}
          ${p.p?`<div class="pt-npk-item pt-p"><span class="pt-npk-sym">P</span><span class="pt-npk-val">${p.p}</span><span class="pt-npk-lbl">Phosphorus</span></div>`:''}
          ${p.k?`<div class="pt-npk-item pt-k"><span class="pt-npk-sym">K</span><span class="pt-npk-val">${p.k}</span><span class="pt-npk-lbl">Potassium</span></div>`:''}
        </div>` : ''}
        <div class="pt-pricing">${priceHtml}</div>
        ${p.free==='yes'?`<div class="pt-free-tag"><i class="fa fa-gift"></i> + FREE Neem Powder 50g</div>`:''}
        <button class="pt-order-btn"><i class="fa fa-cart-plus"></i> Order Now</button>
      </div>
    </div>`;
}

// ============================================
// LIVE TEMPLATE PREVIEW (in modal, updates as you type)
// ============================================
function updateTemplatePreview() {
  const container = document.getElementById('liveTemplatePreview');
  if (!container) return;
  const p = {
    name:     document.getElementById('pm-name')?.value || 'Product Name',
    subtitle: document.getElementById('pm-subtitle')?.value || '',
    weight:   document.getElementById('pm-weight')?.value || '1 KG',
    type:     document.getElementById('pm-type')?.value || 'vermicompost',
    price:    parseInt(document.getElementById('pm-price')?.value) || 0,
    mrp:      parseInt(document.getElementById('pm-mrp')?.value) || 0,
    stock:    document.getElementById('pm-stock')?.value || 'In Stock',
    badge:    document.getElementById('pm-badge')?.value || '',
    desc:     document.getElementById('pm-desc')?.value || '',
    features: document.getElementById('pm-features')?.value || '',
    tagline:  document.getElementById('pm-tagline')?.value || '',
    n:        document.getElementById('pm-n')?.value || '',
    p:        document.getElementById('pm-p')?.value || '',
    k:        document.getElementById('pm-k')?.value || '',
    free:     document.getElementById('pm-free')?.value || 'yes'
  };
  container.innerHTML = buildProductTemplate(p, 'card');
}

// ============================================
// TEMPLATE PAGE
// ============================================
function renderTemplateList() {
  const el = document.getElementById('templateProductList');
  if (!el) return;
  if (!D.products.length) {
    el.innerHTML = '<p style="color:#6b7280;font-size:.85rem">No products added yet.</p>';
    return;
  }
  el.innerHTML = D.products.map(p => {
    const ico = p.type === 'neem' ? '🌿' : '🌱';
    const bg  = p.type === 'neem' ? 'background:linear-gradient(135deg,#f0fae8,#d4f0c0)' :
                p.type === 'custom' ? 'background:linear-gradient(135deg,#f0f4ff,#dde8ff)' :
                'background:linear-gradient(135deg,#e8f5ec,#c8ebd5)';
    return `
      <div class="tpl-item" id="tpl-${p.id}" onclick="previewProductTemplate('${p.id}')">
        <div class="tpl-item-ico" style="${bg}">${ico}</div>
        <div class="tpl-item-info">
          <strong>${p.name}</strong>
          <span>${p.weight} · ₹${p.price > 0 ? p.price.toLocaleString('en-IN') : 'FREE'}</span>
        </div>
      </div>`;
  }).join('');
}

function previewProductTemplate(id) {
  const p = D.products.find(x => x.id === id);
  if (!p) return;

  // Highlight selected
  document.querySelectorAll('.tpl-item').forEach(el => el.classList.remove('selected'));
  const selEl = document.getElementById('tpl-' + id);
  if (selEl) selEl.classList.add('selected');

  const area = document.getElementById('templatePreviewArea');
  if (!area) return;

  area.innerHTML = `
    <div class="tpa-header">
      <h3>Template Preview: ${p.name} (${p.weight})</h3>
      <div class="tpa-actions">
        <button class="btn-sm-edit" onclick="openEditProduct('${p.id}');switchTab('products')">
          <i class="fa fa-edit"></i> Edit Product
        </button>
        <button class="tb-btn" onclick="window.open('index.html#products','_blank')">
          <i class="fa fa-external-link-alt"></i> View on Website
        </button>
      </div>
    </div>
    <div style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:flex-start">
      <div style="flex:1;min-width:280px">
        <p style="font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.75rem">
          📦 PRODUCT CARD (website listing view)
        </p>
        ${buildProductTemplate(p, 'card')}
      </div>
      <div style="flex:1;min-width:280px">
        <p style="font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.75rem">
          📄 FULL PRODUCT PAGE (detail view)
        </p>
        ${buildProductTemplate(p, 'full')}
      </div>
    </div>`;

  // Switch to template tab if not already there
  if (!document.getElementById('tab-template').classList.contains('active')) {
    switchTab('template');
  }
}

// ============================================
// NUTRIENTS
// ============================================
function renderExtraNutrients() {
  const el = document.getElementById('extraNutrientsList');
  if (!el) return;
  const extras = D.nutrients?.extra || [];
  if (!extras.length) { el.innerHTML = ''; return; }
  el.innerHTML = extras.map((n, i) => `
    <div class="dyn-row dyn-row-3" id="en-row-${i}">
      <div><label>Nutrient Name</label><input type="text" id="en-name-${i}" value="${n.name||''}" placeholder="e.g. Calcium"/></div>
      <div><label>Symbol</label><input type="text" id="en-sym-${i}" value="${n.sym||''}" placeholder="e.g. Ca"/></div>
      <div><label>Content (%)</label><input type="text" id="en-val-${i}" value="${n.val||''}" placeholder="e.g. 0.5%"/></div>
      <button class="del-row-btn" onclick="removeExtraNutrient(${i})"><i class="fa fa-trash"></i></button>
    </div>`).join('');
}

function addExtraNutrient() {
  collectExtraNutrients();
  if (!D.nutrients.extra) D.nutrients.extra = [];
  D.nutrients.extra.push({ name: '', sym: '', val: '' });
  renderExtraNutrients();
}

function removeExtraNutrient(i) {
  collectExtraNutrients();
  D.nutrients.extra.splice(i, 1);
  renderExtraNutrients();
}

function collectExtraNutrients() {
  const rows = document.querySelectorAll('[id^="en-row-"]');
  if (!D.nutrients) D.nutrients = { n: '', p: '', k: '', extra: [] };
  D.nutrients.extra = Array.from(rows).map((_, i) => ({
    name: document.getElementById(`en-name-${i}`)?.value || '',
    sym:  document.getElementById(`en-sym-${i}`)?.value  || '',
    val:  document.getElementById(`en-val-${i}`)?.value  || ''
  })).filter(n => n.name.trim());
}

// ============================================
// HOW TO USE STEPS
// ============================================
function renderHowtoSteps() {
  const el = document.getElementById('howtoStepsList');
  if (!el) return;
  const steps = D.howtoSteps || [];
  el.innerHTML = steps.map((s, i) => `
    <div class="dyn-row dyn-row-2" id="hs-row-${i}">
      <div class="dyn-step-num">${i + 1}</div>
      <textarea id="hs-text-${i}" rows="2" placeholder="Describe step ${i+1}...">${s}</textarea>
      <button class="del-row-btn" onclick="removeHowtoStep(${i})"><i class="fa fa-trash"></i></button>
    </div>`).join('');
}

function addHowtoStep() {
  collectHowtoSteps();
  D.howtoSteps.push('');
  renderHowtoSteps();
}

function removeHowtoStep(i) {
  collectHowtoSteps();
  D.howtoSteps.splice(i, 1);
  renderHowtoSteps();
}

function collectHowtoSteps() {
  const rows = document.querySelectorAll('[id^="hs-row-"]');
  D.howtoSteps = Array.from(rows).map((_, i) =>
    document.getElementById(`hs-text-${i}`)?.value || ''
  ).filter(s => s.trim());
}

// ============================================
// CAUTION ITEMS
// ============================================
function renderCautionItems() {
  const el = document.getElementById('cautionList');
  if (!el) return;
  const items = D.caution || [];
  el.innerHTML = items.map((c, i) => `
    <div class="dyn-row dyn-row-1" id="ci-row-${i}">
      <input type="text" id="ci-text-${i}" value="${c}" placeholder="Caution point..."/>
      <button class="del-row-btn" onclick="removeCautionItem(${i})"><i class="fa fa-trash"></i></button>
    </div>`).join('');
}

function addCautionItem() {
  collectCautionItems();
  D.caution.push('');
  renderCautionItems();
}

function removeCautionItem(i) {
  collectCautionItems();
  D.caution.splice(i, 1);
  renderCautionItems();
}

function collectCautionItems() {
  const rows = document.querySelectorAll('[id^="ci-row-"]');
  D.caution = Array.from(rows).map((_, i) =>
    document.getElementById(`ci-text-${i}`)?.value || ''
  ).filter(s => s.trim());
}

// ============================================
// CHANGE PASSWORD
// ============================================
function changePassword() {
  const curr = document.getElementById('curr-pass').value;
  const nw   = document.getElementById('new-pass').value;
  const conf = document.getElementById('conf-pass').value;
  if (curr !== D.password) { showToast('❌ Current password is wrong', 'error'); return; }
  if (!nw || nw.length < 6) { showToast('❌ New password must be at least 6 characters', 'error'); return; }
  if (nw !== conf) { showToast('❌ Passwords do not match', 'error'); return; }
  D.password = nw;
  persist();
  document.getElementById('curr-pass').value = '';
  document.getElementById('new-pass').value  = '';
  document.getElementById('conf-pass').value = '';
  showToast('✅ Password updated successfully!', 'success');
}

// ============================================
// TOAST
// ============================================
function showToast(msg, type = '') {
  const t = document.getElementById('adminToast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'admin-toast show' + (type ? ' ' + type : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'admin-toast'; }, 3200);
}

// ============================================
// CLOSE MODAL ON BACKDROP CLICK
// ============================================
document.addEventListener('click', (e) => {
  const modal = document.getElementById('productModal');
  if (modal && e.target === modal) closeProductModal();
});

// ============================================
// KEYBOARD: ESC closes modal
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProductModal();
});

// ============================================
// AUTO INIT ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  load();
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminPanel').style.display  = 'none';
});
