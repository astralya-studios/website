# Content guide — `content/signs/`

Each zodiac sign is **one JSON file**. To change anything about a character —
name, copy, price, images, availability — edit its file. No code changes needed.

## File: `<sign>.json` (e.g. `aries.json`)

| Field | What it does |
|---|---|
| `id` | URL slug (`/aries`). Do not change after launch. |
| `name` | Display name ("Aries"). |
| `symbol` | Zodiac glyph (♈). |
| `dates` | Date range ("March 21 – April 19"). |
| `element` | Fire / Earth / Air / Water. |
| `order` | 1–12, zodiac order. |
| `characterName` | The plush character's name, or `null` if undecided. |
| `tagline` | One short emotional line. |
| `personality` | 1–2 sentences. Keep it short. |
| `traits` | 3 key traits. |
| `description` | Product description, a few sentences max. |
| `price` | Number, in `currency`. |
| `currency` | ISO code, e.g. `"USD"`. |
| `status` | `"waitlist"` \| `"preorder"` \| `"available"`. Change freely — the page, buttons, and checkout adapt automatically. |
| `inventory` | Number or `null`. When `available` and inventory hits 0, the page flips to waitlist automatically. |
| `size` | e.g. `"12\" plush"`. |
| `materials` | Free text, or `"TBD"`. |
| `images.hero` | Path under `/images/signs/…`, or `null` for the placeholder medallion. |
| `images.gallery` | Array of paths (may be empty). |
| `accent` | Hex color used for the sign's glow/accents. |
| `copyStatus` | `"placeholder"` until real copy is approved. |
| `seo.title` / `seo.description` | Per-page SEO. |

## Images

Put final art in `public/images/signs/` and reference it from the JSON.
Placeholder medallions render automatically for any `null` image — delete
nothing; just point the JSON at the new files when art is ready.
