# Deploying Rovin Bandana to Vercel

This app uses **Vercel Postgres** (database) and commits uploaded images
straight to this **GitHub repo** (`public/uploads/`), which Vercel auto-deploys
on push. The local JSON file storage has been removed.

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

### 4. Connect the Git repo (for image uploads to auto-deploy)
- Project → **Settings → Git** → connect this same GitHub repo, if not already connected.
- Without this, the upload route can still commit files to GitHub, but nothing will redeploy to publish them.

### 5. Add the admin + GitHub env vars
Project → **Settings → Environment Variables**, add (for Production + Preview):
| Name | Value |
|------|-------|
| `ADMIN_USERNAME` | your admin login |
| `ADMIN_PASSWORD` | a strong password |
| `AUTH_SECRET` | a long random string (32+ chars) |
| `GITHUB_TOKEN` | a GitHub Personal Access Token with "Contents: Read and write" on this repo |
| `GITHUB_REPO` | `owner/repo`, e.g. `fardiiin99/rovinbd` |
| `GITHUB_BRANCH` | `main` |

### 6. Deploy
- Push to `main` (or click **Deploy**). First page load auto-creates the tables and seeds sample data.

## Local development against the cloud DB
After linking the project once:
```bash
vercel link          # link this folder to the Vercel project
vercel env pull .env.local   # pulls POSTGRES_URL + GITHUB_TOKEN etc.
npm run dev
```
Add `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET` to `.env.local` too.

## Notes
- The hero image at `/public/hero-banner.jpg` ships with the repo. New admin uploads are committed to `public/uploads/` in this GitHub repo via the API and return a `/uploads/...` path; the change goes live once Vercel's Git-triggered deploy finishes (~1-2 min).
- Tables + seed data are created automatically on first DB access (`ensureSchema` in `src/lib/db.ts`).
- To reset the store, drop the tables in the Vercel Postgres dashboard; they'll be recreated and reseeded on next load.
