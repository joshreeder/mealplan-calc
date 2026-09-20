# SU Meals — deploy guide

This is a small multi-user app: anyone types a username (e.g. `simon.reeder`), no
password, and their meal-plan budget is saved server-side under Vercel Blob storage
so it follows them across devices. It's also a PWA, so it can be added to a phone's
home screen.

## 1. Deploy to Vercel

From this folder:

```bash
npm i -g vercel   # if you don't already have it
cd su-meals
vercel            # first run: link/create the project, follow the prompts
vercel --prod     # deploy to production
```

Name the project whatever you like (e.g. `su-meals`) when prompted — it'll get a
`*.vercel.app` URL immediately.

## 2. Add Blob storage

In the Vercel dashboard → your project → **Storage** tab → **Create Database** →
**Blob**. Create it and connect it to this project. Vercel will automatically add
a `BLOB_READ_WRITE_TOKEN` environment variable to the project — that's all the
`api/budget.js` function needs. Redeploy once (`vercel --prod`) after connecting it
so the function picks up the new env var.

## 3. Point sumeals.simonapollo.com at it

In the Vercel dashboard → your project → **Settings → Domains** → add
`sumeals.simonapollo.com`. Vercel will show you a DNS record to add (usually a
CNAME to `cname.vercel-dns.com`).

Then, in Cloudflare (where simonapollo.com's DNS lives):
- Add a **CNAME** record: name `sumeals`, target `cname.vercel-dns.com`
- Set it to **DNS only** (grey cloud, not the orange "proxied" cloud) — Vercel
  needs to terminate SSL itself for the certificate to issue cleanly.

It can take a few minutes to a couple hours to verify and get an SSL certificate.

## 4. Using it

- Open the site, type a username (letters/numbers/dots/dashes only — it's just an
  identifier, not a real login), tap Continue.
- Everyone's data is stored separately by username, keyed as `users/<username>.json`
  in Blob storage.
- "switch user" at the top lets someone else use the same device/browser.
- On an iPhone: Share → Add to Home Screen. On Android: browser menu → Add to Home
  Screen / Install app.

## Notes / limits

- There's no real authentication — anyone who knows or guesses a username can view
  or overwrite that person's budget. Fine for this since nothing sensitive is stored,
  but worth knowing.
- I used Vercel Blob (simple JSON-per-user files) rather than a Postgres/Neon database,
  since it needs no extra sign-up and is a perfect fit for one small JSON doc per user.
  If you'd rather have a real database (e.g. to later add a coffee or groceries budget
  as separate structured tables), Vercel's Storage tab also offers a one-click Neon
  Postgres integration — say the word and I'll adapt `api/budget.js` to use it instead.
