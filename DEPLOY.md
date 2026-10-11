# Deploying the Astralya site

## Local development

```bash
cd site
npm install
npm run dev        # http://localhost:3000
```

Out of the box the site runs in **dev payments mode**: the full
cart → checkout → order-confirmation flow works with a clearly-labeled
simulated payment. No keys needed, no real money moves.

## Content updates

Edit `content/signs/<sign>.json` (see `content/README.md`), then rebuild.
To change a sign's availability, flip its `status` field between
`waitlist`, `preorder`, and `available` — pages, buttons, and checkout
adapt automatically.

## Stripe (test mode)

1. Create a Stripe account and get **test** keys.
2. Copy `.env.example` to `.env.local` and set:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
3. Forward webhooks while developing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Set the printed `whsec_...` as `STRIPE_WEBHOOK_SECRET`.
4. Restart `npm run dev`. The checkout now redirects to real Stripe
   Checkout (test mode) and the webhook marks orders paid.

The UI shows a "test mode" banner whenever payments aren't live, so
there's never ambiguity about whether money is real.

## Going live checklist

- [ ] `STRIPE_SECRET_KEY=sk_live_...` set in the hosting environment
- [ ] `STRIPE_WEBHOOK_SECRET` set from the **live** webhook endpoint
      (`https://astralyastudios.com/api/webhooks/stripe`, event:
      `checkout.session.completed`)
- [ ] `NEXT_PUBLIC_SITE_URL=https://astralyastudios.com`
- [ ] Replace placeholder shipping/returns copy (flagged in the UI)
- [ ] Set real prices, inventory, and per-sign `status` values
- [ ] Replace placeholder character art in `public/images/signs/` and point
      each sign's `images.hero` at it
- [ ] Swap the file-based order/waitlist stores (`lib/orders.ts`,
      `lib/waitlist.ts`) for a real database if order volume warrants it
- [ ] Add analytics snippet to `app/layout.tsx` (events already wired via
      `lib/analytics.ts`)

## Hosting

Any Node host works (`npm run build` → `npm start`). On Vercel, set the
environment variables in the project settings and deploy.

> Note: `data/` (orders, waitlist signups, inventory overrides) is written
> to the local filesystem. On serverless/ephemeral hosts, point the stores
> at persistent storage (see `lib/orders.ts` / `lib/waitlist.ts`).
