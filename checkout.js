/* ============================================
   PLANSIO - Checkout Script
   ============================================ */

const API_URL = 'http://localhost:5000/api/v1';
const SESSION_ID = localStorage.getItem('sessionId') || 'session_' + Date.now();
localStorage.setItem('sessionId', SESSION_ID);

let authToken = localStorage.getItem('authToken');
let currentUser = null;
let cartData = [];
let selectedAddress = null;
let selectedPayment = 'COD';
let currentStep = 1;

// ── Fetch with Auth ──
async function apiCall(endpoint, method = 'GET', data = null) {
  const headers = { 'Content-Type': 'application/json', 'X-Session-ID': SESSION_ID };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);
  const res = await fetch(API_URL + endpoint, options);
  if (!res.ok && res.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/index.html';
    return null;
  }
  return res.json();
}

// ── Load Cart ──
async function loadCart() {
  const res = await apiCall('/cart');
  if (res?.success) {
    cartData = res.cart?.items || [];
    renderCart();
    renderSummary();
  }
}

// ── Render Cart Items ──
function renderCart() {
  const html = cartData.map(item => `
    <div class="cart-item-mini">
      <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}">
      <div>
        <div><strong>${item.name}</strong></div>
        <div>Qty: ${item.quantity}</div>
        <div>₹${(item.price * item.quantity).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
  document.getElementById('cartItemsList').innerHTML = html || '<p>Cart is empty</p>';
}

// ── Render Summary ──
function renderSummary() {
  const subtotal = cartData.reduce((s, i) => s + (i.price * i.quantity), 0);
  const delivery = subtotal >= 499 ? 0 : 50;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + delivery + tax;

  document.getElementById('summaryContent').innerHTML = `
    <div class="summary-item">
      <span>Subtotal (${cartData.length} items)</span>
      <span>₹${subtotal.toLocaleString()}</span>
    </div>
    <div class="summary-item">
      <span>Delivery</span>
      <span>${delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
    </div>
    <div class="summary-item">
      <span>Tax (5% GST)</span>
      <span>₹${tax.toLocaleString()}</span>
    </div>
    <div class="summary-item total">
      <span>Total Amount</span>
      <span>₹${total.toLocaleString()}</span>
    </div>
  `;
}

// ── Render Saved Addresses ──
async function renderAddresses() {
  if (!authToken) {
    document.getElementById('savedAddresses').innerHTML = '<p style="color:#f44336">Please login first</p>';
    return;
  }
  const res = await apiCall('/users/profile');
  if (res?.user?.addresses?.length) {
    const html = res.user.addresses.map((addr, i) => `
      <div class="address-card ${!selectedAddress ? 'selected' : ''}" onclick="selectAddress(${i})">
        <input type="radio" name="address" ${!selectedAddress ? 'checked' : ''}>
        <div>
          <strong>${addr.label}: ${addr.name}</strong><br>
          ${addr.line1}, ${addr.line2}<br>
          ${addr.city}, ${addr.state} - ${addr.pincode}<br>
          <small>${addr.phone}</small>
        </div>
      </div>
    `).join('');
    document.getElementById('savedAddresses').innerHTML = html;
  }
}

// ── Select Address ──
function selectAddress(index) {
  selectedAddress = index;
  document.querySelectorAll('.address-card').forEach((el, i) => {
    el.classList.toggle('selected', i === index);
    el.querySelector('input').checked = i === index;
  });
}

// ── Check Pincode ──
async function checkPincode() {
  const pincode = document.getElementById('addrPincode').value;
  if (!/^\d{6}$/.test(pincode)) return;
  const res = await apiCall(`/pincode/check/${pincode}`);
  const msg = document.getElementById('pincodeMsg');
  if (res?.valid) {
    msg.textContent = `✅ Serviceable - Delivery in ${res.deliveryDays} days`;
    msg.classList.add('available');
    document.getElementById('addrCity').value = res.city;
    document.getElementById('addrState').value = res.state;
  } else {
    msg.textContent = '❌ Not serviceable in this area';
    msg.classList.add('unavailable');
  }
}

// ── Render Payment Options ──
function renderPaymentOptions() {
  const html = `
    <label class="payment-option selected">
      <input type="radio" name="payment" value="COD" checked onchange="selectedPayment='COD'">
      <div>
        <strong>Cash on Delivery</strong><br>
        <small>Pay when your order arrives</small>
      </div>
    </label>
    <label class="payment-option">
      <input type="radio" name="payment" value="UPI" onchange="selectedPayment='UPI'">
      <div>
        <strong>UPI (Google Pay / PhonePe)</strong><br>
        <small>Instant payment via UPI</small>
      </div>
    </label>
    <label class="payment-option">
      <input type="radio" name="payment" value="Card" onchange="selectedPayment='Card'">
      <div>
        <strong>Credit/Debit Card</strong><br>
        <small>Visa, Mastercard, RuPay</small>
      </div>
    </label>
  `;
  document.getElementById('paymentOptions').innerHTML = html;
}

// ── Go to Step ──
function goToStep(step) {
  if (step === 2 && !cartData.length) {
    alert('Cart is empty!');
    return;
  }
  if (step === 3 && !selectedAddress) {
    alert('Please select a delivery address');
    return;
  }

  currentStep = step;
  document.querySelectorAll('.step-content').forEach((el, i) => {
    el.classList.toggle('active', i + 1 === step);
  });
  document.querySelectorAll('.step-number').forEach((el, i) => {
    el.classList.toggle('active', i + 1 === step);
    el.classList.toggle('completed', i + 1 < step);
  });

  if (step === 2) renderAddresses();
  if (step === 3) renderPaymentOptions();
}

// ── Place Order ──
async function placeOrder() {
  if (!selectedAddress) {
    alert('Please select address');
    return;
  }

  // Get selected address from form or saved
  let address;
  const savedAddrs = document.querySelectorAll('.address-card.selected');
  
  if (savedAddrs.length) {
    // Use saved address (from user profile)
    address = {
      name: document.getElementById('addrName').value || currentUser?.name,
      phone: document.getElementById('addrPhone').value || currentUser?.phone,
      line1: document.getElementById('addrLine1').value,
      line2: document.getElementById('addrLine2').value,
      city: document.getElementById('addrCity').value,
      state: document.getElementById('addrState').value,
      pincode: document.getElementById('addrPincode').value
    };
  } else {
    address = {
      name: document.getElementById('addrName').value,
      phone: document.getElementById('addrPhone').value,
      line1: document.getElementById('addrLine1').value,
      line2: document.getElementById('addrLine2').value,
      city: document.getElementById('addrCity').value,
      state: document.getElementById('addrState').value,
      pincode: document.getElementById('addrPincode').value
    };
  }

  if (!address.name || !address.phone || !address.line1 || !address.pincode) {
    alert('Please fill all address fields');
    return;
  }

  const orderData = {
    items: cartData.map(i => ({ 
      product: i.product._id || i.product, 
      quantity: i.quantity 
    })),
    address,
    payment: { method: selectedPayment },
    guestInfo: authToken ? undefined : { 
      name: document.getElementById('addrName').value,
      phone: document.getElementById('addrPhone').value,
      email: 'guest@plansio.com'
    }
  };

  try {
    const res = await apiCall('/orders', 'POST', orderData);
    if (res?.success) {
      alert(`✅ Order Placed!\n\nOrder ID: ${res.order.orderId}\n\nTotal: ₹${res.order.total}`);
      localStorage.removeItem('cartItems');
      window.location.href = `order-confirmation.html?id=${res.order._id}`;
    } else {
      alert(`❌ Error: ${res?.message || 'Could not place order'}`);
    }
  } catch (err) {
    alert('❌ Error: ' + err.message);
  }
}

// ── Handle User Login ──
async function handleUser() {
  if (authToken) {
    localStorage.removeItem('authToken');
    location.reload();
  } else {
    // Show login modal
    const phone = prompt('Enter phone number:');
    if (phone) {
      const res = await apiCall('/auth/send-otp', 'POST', { phone });
      if (res?.success) {
        const otp = prompt('Enter OTP:');
        if (otp) {
          const verifyRes = await apiCall('/auth/verify-otp', 'POST', { phone, otp, sessionId: SESSION_ID });
          if (verifyRes?.success) {
            authToken = verifyRes.token;
            localStorage.setItem('authToken', authToken);
            location.reload();
          }
        }
      }
    }
  }
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  if (authToken) {
    apiCall('/auth/me').then(res => {
      if (res?.user) {
        document.getElementById('userName').textContent = res.user.name || 'Profile';
      }
    });
  }
});
