# Fieldstone — Simple E-commerce Store

A basic e-commerce site: product listings, product detail pages, a shopping
cart, user registration/login, and order processing, backed by a SQLite
database.

- **Frontend:** plain HTML, CSS, and JavaScript (no framework, no build step)
- **Backend:** Node.js + Express.js
- **Database:** SQLite (via `better-sqlite3`), a single file on disk — no
  separate database server to install

## Features

- Product listing page with search and category filter
- Product details page
- Shopping cart (add, update quantity, remove) — works for guests, stored in
  the session
- User registration and login (passwords hashed with bcrypt, session-based
  auth)
- Checkout / order processing — creates an order, decrements stock, clears
  the cart
- Order history page for the logged-in user

## Project structure

```
ecommerce-app/
├── server.js              # Express app entry point
├── db/
│   ├── database.js        # SQLite connection + schema
│   ├── seed.js             # Sample product data
│   └── store.db            # created automatically on first run
├── middleware/
│   └── auth.js             # requireAuth guard for protected routes
├── routes/
│   ├── auth.js              # register / login / logout / me
│   ├── products.js          # product listing + details
│   ├── cart.js               # session-based cart
│   └── orders.js             # checkout + order history
└── public/                  # static frontend
    ├── index.html            # product listing
    ├── product.html           # product details
    ├── cart.html               # cart + checkout
    ├── login.html
    ├── register.html
    ├── orders.html              # order history
    ├── css/style.css
    └── js/  (main.js, product.js, cart.js, orders.js, nav.js)
```

## Getting started

Requires Node.js 18+ (tested on Node 22).

```bash
cd ecommerce-app
npm install       # installs express, express-session, bcryptjs, better-sqlite3
npm run seed      # creates db/store.db and loads sample products
npm start         # starts the server
```

Then open **http://localhost:3000** in your browser.

To use a different port: `PORT=4000 npm start`.

## How it works

- **Database:** `db/database.js` opens (and creates, if missing)
  `db/store.db`, a SQLite file, and defines four tables: `users`,
  `products`, `orders`, and `order_items`. `npm run seed` inserts 8 sample
  products the first time it's run; it's safe to re-run (it skips seeding if
  products already exist).
- **Auth:** `POST /api/auth/register` and `POST /api/auth/login` create a
  server-side session (`express-session`) after hashing/checking the
  password with bcrypt. `middleware/auth.js` protects the checkout and order
  routes.
- **Cart:** stored in the session as `{ productId: quantity }`, so it works
  for guests too. It's resolved against the live `products` table on every
  request so prices/stock are always current.
- **Checkout:** `POST /api/orders` (requires login) validates stock, creates
  an `orders` row plus one `order_items` row per line item inside a single
  DB transaction, decrements product stock, and clears the cart.

## Deploying it (Railway)

The app is ready to deploy as-is. Recommended host: **Railway** — free to
start (30-day/$5 trial credit, no card required), deploys straight from
GitHub, and its persistent volumes keep the SQLite file safe across
restarts. (Render's free tier works too, but its free instances have an
*ephemeral* filesystem — your SQLite database gets wiped on every restart or
redeploy unless you pay for a disk. Railway's volumes are available on the
free trial.)

1. **Push this project to a GitHub repo** (`git init`, commit, push).
2. **Create a Railway project** at railway.app → "New Project" → "Deploy from
   GitHub repo" → pick the repo. Railway auto-detects Node.js and runs
   `npm install` + `npm start`.
3. **Add a volume** so the database survives redeploys: in the service's
   Settings → Volumes → "Add Volume", mount path `/app/data`.
4. **Set environment variables** (service Settings → Variables):
   - `DB_PATH` = `/app/data/store.db` (puts the database on the volume)
   - `SESSION_SECRET` = a long random string (don't use the dev default)
   - `NODE_ENV` = `production`
5. **Seed the database once**: open the service's shell/console in the
   Railway dashboard (or run `railway run npm run seed` from the CLI) so the
   sample products get inserted into the volume-backed database.
6. **Generate a domain**: Settings → Networking → "Generate Domain". Your
   store is now live at that URL.

From then on, pushing to your GitHub branch auto-redeploys, and the
`/app/data` volume keeps users, products, and orders intact.

## Extending it

- Swap `better-sqlite3` for Postgres/MySQL by replacing `db/database.js`
  with your driver of choice — the rest of the app only calls
  `db.prepare(...).get/all/run(...)`, so you'd adapt that thin layer.
  (A Django version would use the same schema via Django's ORM/models
  instead, with `django.contrib.auth` for the user/login system.)
- Add product images upload, pagination, admin screens, or payment
  processing (e.g. Stripe) as next steps — the checkout route is a natural
  place to insert a payment charge before creating the order.
