// public/js/main.js — homepage product listing logic

const grid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');

let debounceTimer;

async function loadCategories() {
  const res = await fetch('/api/products/categories');
  const categories = await res.json();
  for (const cat of categories) {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  }
}

async function loadProducts() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
  if (categorySelect.value) params.set('category', categorySelect.value);

  const res = await fetch(`/api/products?${params.toString()}`);
  const products = await res.json();
  renderProducts(products);
}

function renderProducts(products) {
  if (products.length === 0) {
    grid.innerHTML = `<div class="empty-state">No products match your search.</div>`;
    return;
  }

  grid.innerHTML = products
    .map(
      (p) => `
    <a class="product-card" href="/product.html?id=${p.id}">
      <img class="thumb" src="${p.image_url}" alt="${escapeHtml(p.name)}">
      <div class="body">
        <span class="category">${escapeHtml(p.category)}</span>
        <h3>${escapeHtml(p.name)}</h3>
        <span class="stock-note">${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>
        <span class="price">$${p.price.toFixed(2)}</span>
      </div>
    </a>
  `
    )
    .join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadProducts, 250);
});
categorySelect.addEventListener('change', loadProducts);

loadCategories();
loadProducts();
