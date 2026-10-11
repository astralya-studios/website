# Decisions Needed — Astralya 2.0 Website (v1)

This site is built so **nothing creative is locked in**. Every item below is
currently a clearly-marked placeholder. Reply with decisions (e.g.
`"Change this."`) and they can be swapped without structural changes.

## Character identity (all 12 signs)
1. **Character names** — every sign currently shows only its zodiac name.
   Set `characterName` in `content/signs/<sign>.json`.
2. **Final character artwork** — placeholder SVG medallions are rendered now.
   Drop final art into `public/images/signs/<sign>-hero.png` (and gallery
   images) and set `images.hero` / `images.gallery` in the sign's JSON.
   No code changes needed.
3. **Copy** — taglines, personalities, traits, descriptions are all
   placeholder (`"copyStatus": "placeholder"`). Replace text in the JSON files.

## Product / business
4. **Price** — placeholder `$48.00 USD` on all 12 signs.
5. **Launch states** — currently `available` (Aries, demo), `preorder`
   (Taurus, demo), `waitlist` (all others). Tell us the real launch order and
   we will flip the `status` field per sign.
6. **Inventory counts** — placeholder numbers; set real counts or `null`.
7. **Plush specs** — size (`12" plush` placeholder), materials (`TBD`).
8. **Shipping** — regions, rates, and timelines (placeholder copy on product
   pages and checkout).

## Brand
9. **Wordmark / logo** — text wordmark placeholder in the header.
10. **Brand fonts/colors** — current theme is a starting point, easy to change
    in `app/globals.css`.

## Integrations (all have safe dev-mode fallbacks now)
11. **Payment provider** — Stripe integration points are built and run in a
    clearly-labeled test mode. Provide Stripe keys to go live (never in chat —
    use the secure vault flow).
12. **Order storage** — file-based store now; swap `lib/orders.ts` for a real
    database when ready.
13. **Waitlist emails** — captured to a file store now; connect an email
    provider later.
14. **Analytics** — hooks are in place; add your analytics ID.
15. **Domain & hosting** — deploy notes in `DEPLOY.md`.

## Source of truth note
The `astralya-studios/Astralya` GitHub repository was **not accessible**
(private / 404 via public API) at build time, so no ASTRALYA_2.0 materials
could be inspected. Everything above is intentionally placeholder until those
materials are available — share access and we will replace placeholders with
real canon.
