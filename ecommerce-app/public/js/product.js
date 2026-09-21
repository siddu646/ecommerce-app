// public/js/product.js

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const detailEl = document.getElementById('product-detail');
const alertSlot = document.getElementById('alert-slot');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showAlert(message, type = 'error') {
  alertSlot.innerHTML = `<div class="alert alert-${type}">${escapeHtml(message)}</div>`;
  setTimeout(() => (alertSlot.innerHTML = ''), 3000);
}

async function loadProduct() {
  if (!productId) {
    detailEl.innerHTML = `<div class="empty-state">No product specified.</div>`;
    return;
  }

  const res = await fetch(`/api/products/${productId}`);
  if (!res.ok) {
    detailEl.innerHTML = `<div class="empty-state">Product not found.</div>`;
    return;
  }
  const p = await res.json();
  document.title = `${p.name} — Fieldstone`;

  detailEl.innerHTML = `
    <img src="${p.image_url}" alt="${escapeHtml(p.name)}">
    <div>
      <span class="category">${escapeHtml(p.category)}</span>
      <h1>${escapeHtml(p.name)}</h1>
      <div class="price">$${p.price.toFixed(2)}</div>
      <p class="description">${escapeHtml(p.description)}</p>
      <p class="stock-note">${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</p>
      <div class="qty-row">
        <label for="qty">Qty</label>
        <input type="number" id="qty" value="1" min="1" max="${p.stock}" ${p.stock === 0 ? 'disabled' : ''}>
        <button id="add-to-cart" class="btn btn-primary" ${p.stock === 0 ? 'disabled' : ''}>Add to cart</button>
      </div>
    </div>
  `;

  document.getElementById('add-to-cart')?.addEventListener('click', async () => {
    const qty = Number(document.getElementById('qty').value) || 1;
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: p.id, quantity: qty })
    });
    const data = await res.json();
    if (!res.ok) {
      showAlert(data.error || 'Could not add to cart.');
      return;
    }
    showAlert('Added to cart.', 'success');
    initNav();
  });
}

loadProduct();
