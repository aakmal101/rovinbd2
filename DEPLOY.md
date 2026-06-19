# Deploying Rovin Bandana to Vercel

This app uses **Vercel Postgres** (database) and **Vercel Blob** (image uploads).
Both have free tiers. The local JSON file storage has been removed.

## One-time setup

### 1. Push the code to GitHub (recommended)
```bash
git init
git add .
git commit -m "Bandana store"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/rovin-bandana.git
git branch -M main
git push -u origin main
```

### 2. Import into Vercel
- Go to https://vercel.com/new
- Import the GitHub repo (or run `vercel` from this folder to link without GitHub).

### 3. Create the Postgres database
- In your Vercel project → **Storage** tab → **Create Database** → **Postgres** (Neon).
- Click **Connect** to attach it to this project.
- This automatically adds `POSTGRES_URL` (and related) env vars.

### 4. Create the Blob store (for image uploads)
- Same **Storage** tab → **Create** → **Blob**.
- **Connect** it to the project.
- This adds `BLOB_READ_WRITE_TOKEN`.

### 5. Add the admin env vars
Project → **Settings → Environment Variables**, add (for Production + Preview):
| Name | Value |
|------|-------|
| `ADMIN_USERNAME` | your admin login |
| `ADMIN_PASSWORD` | a strong password |
| `AUTH_SECRET` | a long random string (32+ chars) |

### 6. Deploy
- Push to `main` (or click **Deploy**). First page load auto-creates the tables and seeds sample data.

## Local development against the cloud DB
After linking the project once:
```bash
vercel link          # link this folder to the Vercel project
vercel env pull .env.local   # pulls POSTGRES_URL + BLOB_READ_WRITE_TOKEN
npm run dev
```
Add `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET` to `.env.local` too.

## Notes
- The hero image at `/public/hero-banner.jpg` ships with the repo. New uploads go to Blob storage and return full `https://...blob.vercel-storage.com/...` URLs.
- Tables + seed data are created automatically on first DB access (`ensureSchema` in `src/lib/db.ts`).
- To reset the store, drop the tables in the Vercel Postgres dashboard; they'll be recreated and reseeded on next load.
