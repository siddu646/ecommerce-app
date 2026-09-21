// public/js/nav.js
// Shared header logic: shows login state and cart item count on every page.

async function initNav() {
  try {
    const meRes = await fetch('/api/auth/me');
    const { user } = await meRes.json();

    const authSlot = document.getElementById('nav-auth');
    if (authSlot) {
      if (user) {
        authSlot.innerHTML = `
          <a href="/orders.html">My Orders</a>
          <span>Hi, ${escapeHtml(user.username)}</span>
          <button id="logout-btn" class="btn-danger-text">Log out</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          window.location.href = '/index.html';
        });
      } else {
        authSlot.innerHTML = `
          <a href="/login.html">Log in</a>
          <a href="/register.html">Register</a>
        `;
      }
    }

    const cartRes = await fetch('/api/cart');
    const cart = await cartRes.json();
    const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const cartCountEl = document.getElementById('nav-cart-count');
    if (cartCountEl) cartCountEl.textContent = count;
  } catch (err) {
    console.error('Nav init failed', err);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', initNav);
