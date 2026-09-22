const db = require('./database');

const products = [
  // Groceries
  {
    name: 'Organic Whole Coffee Beans',
    price: 14.99,
    description: '100% Arabica roasted whole bean coffee.',
    category: 'Groceries',
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500'
  },
  {
    name: 'Extra Virgin Olive Oil',
    price: 18.50,
    description: 'Cold-pressed premium olive oil for cooking and dressing.',
    category: 'Groceries',
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500'
  },

  // Sports
  {
    name: 'Non-Slip Yoga Mat',
    price: 24.99,
    description: 'Eco-friendly, extra-thick padded exercise mat.',
    category: 'Sports',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500'
  },
  {
    name: 'Adjustable Dumbbell Set',
    price: 49.99,
    description: 'Compact dumbbell pair suitable for home workout routines.',
    category: 'Sports',
    image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500'
  },

  // Accessories
  {
    name: 'Leather Desk Mat',
    price: 29.99,
    description: 'Premium desk pad with anti-slip backing.',
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?w=500'
  },
  {
    name: 'Minimalist Wrist Watch',
    price: 89.00,
    description: 'Classic analog watch with a genuine leather strap.',
    category: 'Accessories',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
  },

  // Electronics
  {
    name: 'Wireless Bluetooth Earbuds',
    price: 59.99,
    description: 'In-ear headphones with active noise cancellation.',
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'
  },

  // Fashion
  {
    name: 'Classic White Sneakers',
    price: 65.00,
    description: 'Comfortable casual sneakers with breathable fabric.',
    category: 'Fashion',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'
  },

  // Beauty
  {
    name: 'Hydrating Eau de Parfum',
    price: 45.00,
    description: 'Long-lasting floral fragrance spray.',
    category: 'Beauty',
    image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500'
  },

  // Home
  {
    name: 'Modern Accent Armchair',
    price: 129.99,
    description: 'Soft cushioned wooden leg armchair for modern living rooms.',
    category: 'Home',
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'
  }
];

function seed() {
  db.serialize(() => {
    // Clear old products completely
    db.run('DELETE FROM products', (err) => {
      if (err) console.error('Error clearing products:', err);
    });

    const stmt = db.prepare(
      'INSERT INTO products (name, price, description, category, image_url) VALUES (?, ?, ?, ?, ?)'
    );

    products.forEach((item) => {
      stmt.run(item.name, item.price, item.description, item.category, item.image_url);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Error seeding database:', err);
      } else {
        console.log(`Successfully seeded ${products.length} products across all categories!`);
      }
    });
  });
}

seed();