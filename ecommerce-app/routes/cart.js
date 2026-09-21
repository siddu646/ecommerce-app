// routes/cart.js
// Cart is stored server-side in the session as { productId: quantity }.
// This lets guests add to cart too; login is required at checkout.

const express = require('express');
const db = require('../db/database');

const router = express.Router();

function getCart(req) {
  if (!req.session.cart) req.session.cart = {};
  return req.session.cart;
}

function buildCartResponse(cart) {
  const ids = Object.keys(cart).map(Number);
  if (ids.length === 0) return { items: [], total: 0 };

  const placeholders = ids.map(() => '?').join(',');
  const products = db
    .prepare(`SELECT * FROM products WHERE id IN (${placeholders})`)
    .all(...ids);

  const items = products.map((p) => {
    const quantity = cart[p.id];
    return {
      productId: p.id,
      name: p.name,
      price: p.price,
      image_url: p.image_url,
      stock: p.stock,
      quantity,
      lineTotal: Math.round(p.price * quantity * 100) / 100
    };
  });

  const total = Math.round(items.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;
  return { items, total };
}

// GET /api/cart
router.get('/', (req, res) => {
  res.json(buildCartResponse(getCart(req)));
});

// POST /api/cart  { productId, quantity }
router.post('/', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const cart = getCart(req);
  const newQty = (cart[productId] || 0) + Number(quantity);

  if (newQty > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} in stock.` });
  }
  if (newQty <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = newQty;
  }

  res.json(buildCartResponse(cart));
});

// PUT /api/cart/:productId  { quantity }
router.put('/:productId', (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const cart = getCart(req);
  if (quantity <= 0) {
    delete cart[productId];
  } else if (quantity > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} in stock.` });
  } else {
    cart[productId] = Number(quantity);
  }

  res.json(buildCartResponse(cart));
});

// DELETE /api/cart/:productId
router.delete('/:productId', (req, res) => {
  const cart = getCart(req);
  delete cart[req.params.productId];
  res.json(buildCartResponse(cart));
});

// DELETE /api/cart
router.delete('/', (req, res) => {
  req.session.cart = {};
  res.json({ items: [], total: 0 });
});

module.exports = router;
