// db/seed.js
// Populates the products table with sample data.
// Run with: npm run seed

const db = require('./database');

const products = [
  {
    name: 'Wireless Headphones',
    description: 'Over-ear wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 79.99,
    image_url: 'https://picsum.photos/seed/headphones/500/500',
    category: 'Electronics',
    stock: 25
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Compact 75% mechanical keyboard with hot-swappable switches and RGB backlighting.',
    price: 109.0,
    image_url: 'https://picsum.photos/seed/keyboard/500/500',
    category: 'Electronics',
    stock: 15
  },
  {
    name: 'Ceramic Coffee Mug',
    description: 'Hand-glazed 12oz ceramic mug, microwave and dishwasher safe.',
    price: 14.5,
    image_url: 'https://picsum.photos/seed/mug/500/500',
    category: 'Home',
    stock: 60
  },
  {
    name: 'Canvas Backpack',
    description: 'Durable water-resistant canvas backpack with padded 15" laptop sleeve.',
    price: 49.99,
    image_url: 'https://picsum.photos/seed/backpack/500/500',
    category: 'Accessories',
    stock: 30
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Double-walled insulated bottle, keeps drinks cold for 24 hours.',
    price: 22.0,
    image_url: 'https://picsum.photos/seed/bottle/500/500',
    category: 'Accessories',
    stock: 45
  },
  {
    name: 'Desk Lamp',
    description: 'Adjustable LED desk lamp with 5 brightness levels and USB charging port.',
    price: 34.99,
    image_url: 'https://picsum.photos/seed/lamp/500/500',
    category: 'Home',
    stock: 20
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight breathable running shoes with cushioned sole.',
    price: 64.99,
    image_url: 'https://picsum.photos/seed/shoes/500/500',
    category: 'Apparel',
    stock: 40
  },
  {
    name: 'Yoga Mat',
    description: 'Non-slip 6mm thick yoga mat with carrying strap.',
    price: 27.5,
    image_url: 'https://picsum.photos/seed/yogamat/500/500',
    category: 'Fitness',
    stock: 35
  }
];

const insert = db.prepare(`
  INSERT INTO products (name, description, price, image_url, category, stock)
  VALUES (@name, @description, @price, @image_url, @category, @stock)
`);

const existingCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;

if (existingCount === 0) {
  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });
  insertMany(products);
  console.log(`Seeded ${products.length} products.`);
} else {
  console.log(`Products table already has ${existingCount} rows — skipping seed.`);
}
