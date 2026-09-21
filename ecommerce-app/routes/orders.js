// routes/orders.js
const express = require('express');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders  (checkout) - requires login
router.post('/', requireAuth, (req, res) => {
  const { shippingName, shippingAddress } = req.body;
  if (!shippingName || !shippingAddress) {
    return res.status(400).json({ error: 'Shipping name and address are required.' });
  }

  const cart = req.session.cart || {};
  const ids = Object.keys(cart).map(Number);
  if (ids.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }

  const placeholders = ids.map(() => '?').join(',');
  const products = db
    .prepare(`SELECT * FROM products WHERE id IN (${placeholders})`)
    .all(...ids);

  // Validate stock before committing
  for (const p of products) {
    const qty = cart[p.id];
    if (qty > p.stock) {
      return res.status(400).json({ error: `"${p.name}" only has ${p.stock} left in stock.` });
    }
  }

  const total = Math.round(
    products.reduce((sum, p) => sum + p.price * cart[p.id], 0) * 100
  ) / 100;

  const placeOrder = db.transaction(() => {
    const orderResult = db
      .prepare(
        `INSERT INTO orders (user_id, total, status, shipping_name, shipping_address)
         VALUES (?, ?, 'placed', ?, ?)`
      )
      .run(req.session.userId, total, shippingName, shippingAddress);

    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, name, price, quantity)
       VALUES (?, ?, ?, ?, ?)`
    );
    const decrementStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const p of products) {
      const qty = cart[p.id];
      insertItem.run(orderId, p.id, p.name, p.price, qty);
      decrementStock.run(qty, p.id);
    }

    return orderId;
  });

  const orderId = placeOrder();
  req.session.cart = {}; // clear cart after successful order

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

  res.status(201).json({ ...order, items });
});

// GET /api/orders - order history for the logged-in user
router.get('/', requireAuth, (req, res) => {
  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.session.userId);

  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  const withItems = orders.map((o) => ({ ...o, items: itemsStmt.all(o.id) }));

  res.json(withItems);
});

// GET /api/orders/:id - a single order (must belong to the logged-in user)
router.get('/:id', requireAuth, (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.session.userId);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ ...order, items });
});

module.exports = router;
