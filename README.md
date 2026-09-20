# College Meal Plan Calculator

A small multi-user app: anyone types a username (e.g. `simon.reeder`), no password,
and their meal-plan budget is saved server-side in Vercel Blob storage so it follows
them across devices. It's also a PWA, so it can be added to a phone's home screen.

## Live deployment

- **App:** https://mealplan-calc.vercel.app
- **Repo:** https://github.com/joshreeder/mealplan-calc
- **Vercel project:** `mealplan-calc` (team `josh-reeders-projects`)

The Vercel project is connected to this GitHub repo, so **pushing to `main`
deploys automatically**. To deploy by hand instead:

```bash
vercel --prod
```

Blob storage is already set up: the store `mealplan-calc-blob` is linked to the
project, which supplies the `BLOB_READ_WRITE_TOKEN` env var that `api/budget.js`
needs. The store is public-access because the read path fetches blob URLs without
auth.

## Layout

- `public/` — the entire front end, one self-contained `index.html`, served as static files.
- `api/budget.js` — serverless function. `GET /api/budget?user=<name>` reads a profile,
  `POST /api/budget` writes one. Each user is one JSON file at `users/<username>.json`.

## Adding a custom domain

In the Vercel dashboard go to **Settings → Domains** and add the hostname. Vercel
shows a DNS record to add, usually a CNAME to `cname.vercel-dns.com`.

If DNS lives in Cloudflare, add the **CNAME** record and set it to **DNS only**
(grey cloud, not the orange proxied cloud), so Vercel can terminate SSL and issue
the certificate cleanly. Verification and certificate issuance take a few minutes
to a couple of hours.

## Using it

- Open the site, type a username (letters, numbers, dots and dashes only, since it's
  just an identifier rather than a real login), then tap Continue.
- "switch user" at the top lets someone else use the same device or browser.
- On iPhone: Share → Add to Home Screen. On Android: browser menu → Add to Home Screen.

## Notes and limits

- **There is no authentication.** Anyone who knows or guesses a username can read or
  overwrite that person's budget, and the blob store is public-access, so saved
  profiles are readable by URL. Fine for non-sensitive data, but worth knowing.
- Storage is Vercel Blob, one JSON document per user, rather than a database. If the
  app ever needs real structured data (say a separate coffee or groceries budget),
  Vercel's Storage tab offers a one-click Neon Postgres integration and
  `api/budget.js` can be adapted to it.
- The in-app "Heads up" note about quarter rollover and the $250 cap is specific to
  Seattle U. Update it if this is used for a different school.
