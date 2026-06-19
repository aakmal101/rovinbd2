# Rovin Bandana

E-commerce site + admin panel for a bandana business. Built with Next.js 15, React 19, Tailwind, and a JSON-file database (no native deps, no external services).

## Quick start

```bash
npm install
npm run dev
```

Open the storefront at the URL the dev server prints (e.g. http://localhost:3000 or 3001).

## Admin panel

- URL: `/admin`
- Default username: `admin`
- Default password: `admin123`

Change credentials in `.env.local`:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
AUTH_SECRET=replace-this-with-a-long-random-string
```

## What you can do

**Storefront (public)**
- Browse and view bandanas
- Add to cart (stored in browser localStorage)
- Checkout with shipping address — no online payment, customer picks Cash on Delivery or Bank Transfer
- See order confirmation with order ID

**Admin panel**
- Dashboard with revenue, order counts, recent orders
- Products: add / edit / delete, upload images, mark as featured
- Orders: view all orders, see line items, update status (pending → confirmed → shipped → delivered → cancelled)
- Customers: list with order count & total spent, drill into customer history
- Banners: hero banners for the homepage, with image, title, CTA, active toggle, order
- Site Content: site name, tagline, about page text, contact info, shipping fee + free-shipping threshold

## Data storage

All data lives in `data/db.json` — products, orders, customers, banners, site content. Uploaded images go to `public/uploads/`. Both are gitignored.

To reset to seed data, delete `data/db.json` and restart the server.

## Going to production later

When you're ready to deploy, the JSON file approach won't survive on serverless platforms. Swap `src/lib/db.ts` for a real database (Postgres, SQLite, etc.) — the rest of the app uses the `db` API and won't need changes.

## File layout

```
src/
  app/
    page.tsx                 Home
    shop/                    Product listing
    product/[slug]/          Product detail
    cart/                    Cart
    checkout/                Checkout
    order-confirmation/[id]/ Success page
    about/, contact/         Static content pages
    admin/                   Admin panel (protected by middleware)
    api/                     Server routes
  components/                Shared UI
  lib/
    db.ts                    JSON-backed data layer
    auth.ts                  JWT session helpers
    format.ts                Price + date helpers
  middleware.ts              Protects /admin
data/db.json                 Persisted store data (created on first run)
public/uploads/              Uploaded product/banner images
```
