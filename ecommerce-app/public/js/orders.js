// public/js/orders.js

const ordersList = document.getElementById('orders-list');
const justPlacedEl = document.getElementById('just-placed');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadOrders() {
  const meRes = await fetch('/api/auth/me');
  const { user } = await meRes.json();

  if (!user) {
    ordersList.innerHTML = `<div class="empty-state">
      <a href="/login.html?next=/orders.html" style="text-decoration:underline;">Log in</a> to see your order history.
    </div>`;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const justPlaced = params.get('justPlaced');
  if (justPlaced) {
    justPlacedEl.innerHTML = `<div class="alert alert-success">Order #${justPlaced} placed successfully. Thank you!</div>`;
  }

  const res = await fetch('/api/orders');
  const orders = await res.json();

  if (orders.length === 0) {
    ordersList.innerHTML = `<div class="empty-state">No orders yet. <a href="/index.html" style="text-decoration:underline;">Start shopping</a>.</div>`;
    return;
  }

  ordersList.innerHTML = orders
    .map(
      (o) => `
    <div class="order-card">
      <div class="order-head">
        <span class="id">Order #${o.id} <span class="badge">${escapeHtml(o.status)}</span></span>
        <span class="date">${new Date(o.created_at).toLocaleString()}</span>
      </div>
      ${o.items
        .map(
          (i) => `<div class="order-line"><span>${i.quantity} &times; ${escapeHtml(i.name)}</span><span>$${(i.price * i.quantity).toFixed(2)}</span></div>`
        )
        .join('')}
      <div class="order-line" style="font-weight:600; border-top:1px solid var(--line); margin-top:8px; padding-top:8px;">
        <span>Total</span><span>$${o.total.toFixed(2)}</span>
      </div>
      <p style="font-size:0.85rem; color:var(--muted); margin:10px 0 0;">
        Shipping to ${escapeHtml(o.shipping_name)} &mdash; ${escapeHtml(o.shipping_address)}
      </p>
    </div>
  `
    )
    .join('');
}

loadOrders();
