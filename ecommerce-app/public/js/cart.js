// public/js/cart.js

const cartBody = document.getElementById('cart-body');
const cartTable = document.getElementById('cart-table');
const cartEmpty = document.getElementById('cart-empty');
const cartSummaryWrap = document.getElementById('cart-summary-wrap');
const checkoutSection = document.getElementById('checkout-section');
const checkoutForm = document.getElementById('checkout-form');
const loginNote = document.getElementById('login-note');
const alertSlot = document.getElementById('alert-slot');
const checkoutAlert = document.getElementById('checkout-alert');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showAlert(el, message, type = 'error') {
  el.innerHTML = `<div class="alert alert-${type}">${escapeHtml(message)}</div>`;
  setTimeout(() => (el.innerHTML = ''), 3500);
}

async function loadCart() {
  const res = await fetch('/api/cart');
  const cart = await res.json();

  if (cart.items.length === 0) {
    cartEmpty.style.display = 'block';
    cartTable.style.display = 'none';
    cartSummaryWrap.style.display = 'none';
    checkoutSection.style.display = 'none';
    return;
  }

  cartEmpty.style.display = 'none';
  cartTable.style.display = 'table';
  cartSummaryWrap.style.display = 'block';
  checkoutSection.style.display = 'block';

  cartBody.innerHTML = cart.items
    .map(
      (i) => `
    <tr data-id="${i.productId}">
      <td>
        <div class="cart-item-info">
          <img src="${i.image_url}" alt="${escapeHtml(i.name)}">
          <span>${escapeHtml(i.name)}</span>
        </div>
      </td>
      <td>$${i.price.toFixed(2)}</td>
      <td><input type="number" min="0" max="${i.stock}" value="${i.quantity}" class="qty-input" data-id="${i.productId}"></td>
      <td>$${i.lineTotal.toFixed(2)}</td>
      <td><button class="btn-danger-text remove-btn" data-id="${i.productId}">Remove</button></td>
    </tr>
  `
    )
    .join('');

  document.getElementById('cart-total').textContent = `$${cart.total.toFixed(2)}`;
  document.getElementById('cart-total-2').textContent = `$${cart.total.toFixed(2)}`;

  document.querySelectorAll('.qty-input').forEach((input) => {
    input.addEventListener('change', async () => {
      const id = input.dataset.id;
      const quantity = Number(input.value);
      const res = await fetch(`/api/cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      const data = await res.json();
      if (!res.ok) showAlert(alertSlot, data.error);
      loadCart();
      initNav();
    });
  });

  document.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await fetch(`/api/cart/${btn.dataset.id}`, { method: 'DELETE' });
      loadCart();
      initNav();
    });
  });

  // Check login state to decide whether to show checkout form or login prompt
  const meRes = await fetch('/api/auth/me');
  const { user } = await meRes.json();
  if (user) {
    checkoutForm.style.display = 'block';
    loginNote.style.display = 'none';
  } else {
    checkoutForm.style.display = 'none';
    loginNote.style.display = 'block';
  }
}

checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const shippingName = document.getElementById('shippingName').value;
  const shippingAddress = document.getElementById('shippingAddress').value;

  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shippingName, shippingAddress })
  });
  const data = await res.json();

  if (!res.ok) {
    showAlert(checkoutAlert, data.error || 'Could not place order.');
    return;
  }

  window.location.href = `/orders.html?justPlaced=${data.id}`;
});

loadCart();
