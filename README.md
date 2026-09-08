# Cars911 — UAE car service aggregator

Content-rich marketplace MVP built from the brief in `docs/`: car owners describe a job once,
verified garages quote, owners compare and book. Includes the full public site, quote/booking/lead
flows, garage profiles with moderated reviews, and a password-protected admin.

## Stack

- **Astro 7** (server output, Node adapter) + **Svelte 5** islands for interactive forms
- **Tailwind CSS 4** with a brand token system from the Cars911 colour specification:
  a fully dark site on background black with the metallic gold range, set in Archivo Variable
  (heavy condensed uppercase for display, normal width for text)
- **PostgreSQL 17** (Docker) + **Drizzle ORM**, validated with **Zod** via Astro Actions
- Guides/blog/policies as Markdown content collections

## Run it

```sh
cp .env.example .env      # adjust ADMIN_PASSWORD etc.
pnpm install
pnpm db:up                # Postgres 17 in Docker on port 5433
pnpm db:push              # create schema
pnpm db:seed              # services, locations, garages, packages, reviews
pnpm dev                  # http://localhost:4321
```

## Deploying

The app is a Node server (Astro `output: 'server'` with the standalone Node adapter), so it
needs a Node host and a Postgres database — not static hosting.

```sh
docker build -t cars911 \
  --build-arg PUBLIC_WHATSAPP_NUMBER=971xxxxxxxxx \
  --build-arg PUBLIC_PHONE_NUMBER=+971xxxxxxxxx .
docker run -p 4321:4321 -e DATABASE_URL=... -e ADMIN_PASSWORD=... cars911
```

Two classes of environment variable, and the difference matters:

| | When it is read | Set it |
|---|---|---|
| `DATABASE_URL`, `ADMIN_PASSWORD` | runtime | on the host |
| `PUBLIC_WHATSAPP_NUMBER`, `PUBLIC_PHONE_NUMBER` | build time (Vite inlines them) | as build args |

Set `PUBLIC_*` at build time or every WhatsApp link and phone number falls back to the
placeholder defaults in `src/lib/site.ts`.

After the first deploy, point `db:push` and `db:seed` at the remote database once.

Without Docker: `pnpm build && pnpm start`.

## Map

| Area | Where |
|---|---|
| DB schema / seed | `src/db/` |
| Form actions (quote, booking, leads, reviews) | `src/actions/index.ts` |
| Shared queries, site constants, admin auth | `src/lib/` |
| Layout + components | `src/layouts/`, `src/components/` |
| Multi-step quote island | `src/islands/QuoteForm.svelte` |
| Pages | `src/pages/` (admin under `/admin`, guarded by `src/middleware.ts`) |
| Editorial content | `src/content/` (guides, blog, policies) |

## Not wired yet (deliberately)

Analytics/GTM + consent, Sentry, WhatsApp Business API & OTP (links are plain `wa.me` for now),
transactional email, sitemap endpoint. Policy pages are placeholder text pending legal review.
