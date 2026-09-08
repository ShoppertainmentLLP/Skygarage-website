# Cars911 — UAE car service aggregator

Car owners describe a job once, verified garages reply with written quotes, owners compare and
book. Full public site, quote/booking/lead flows, garage profiles with moderated reviews, and a
password-protected admin.

## Stack

- **Astro 7** (server output, Node adapter) + **Svelte 5** islands for interactive forms
- **Tailwind CSS 4** with a brand token system from the Cars911 colour specification:
  a fully dark site on background black with the metallic gold range, set in Archivo Variable
  (heavy condensed uppercase for display, normal width for text)
- **PostgreSQL 17** + **Drizzle ORM**, validated with **Zod** via Astro Actions
- Long-form page copy in Markdown content collections, joined to database rows by slug

Node ≥ 22.12 and pnpm.

## Run it locally

```sh
cp .env.example .env      # set ADMIN_PASSWORD; the defaults work for local Postgres
pnpm install
pnpm db:up                # Postgres 17 in Docker on port 5433
pnpm db:push              # create schema
pnpm db:seed              # services, locations, brands, garages, packages, reviews
pnpm dev                  # http://localhost:4321
```

`pnpm db:seed` is destructive: it clears and rewrites the catalogue tables. It leaves customer
data (quote requests, bookings, leads) alone.

If pages return 500 with `ECONNREFUSED 127.0.0.1:5433`, Docker has dropped out rather than
anything being wrong with the code — `pnpm db:up` again.

## Editing content

There is no CMS. Content lives in three places, and which one depends on what you are changing:

| What | Where | Takes effect |
|---|---|---|
| Services, brands, locations, garages, packages | `src/db/seed.ts` | after `pnpm db:seed` |
| Page copy for those rows | `src/content/{services,brands,locations}/<slug>.md` | on save |
| Blog and policies | `src/content/{articles,policies}/` | on save |
| Everything else | the `.astro` page itself | on save |

A copy file's name must match the database `slug` — `src/content/services/car-wash.md` belongs to
the service with slug `car-wash`. A row with no copy file still renders; it just renders short.

Run `pnpm check:content` after editing frontmatter. An unquoted value containing `": "` is read
by YAML as a nested mapping, and in development that surfaces only as `astro dev` exiting during
startup, which is a confusing way to find a missing pair of quotes.

## Deploying to Railway

The app is a Node server, not a static site, so it needs a Node host and a Postgres database.
`Dockerfile` and `railway.json` are in the repo and tested.

### 1. Create the project and the database

Create a project, then add a PostgreSQL database to it — in the dashboard, **New → Database →
PostgreSQL**, or with `railway login` and `railway add` from the CLI.

Railway's Postgres exposes two connection strings, and using the wrong one is the most common
first-deploy problem:

- `DATABASE_URL` — `postgres.railway.internal`, resolvable **only from inside Railway**. This is
  what the app uses.
- `DATABASE_PUBLIC_URL` — routed through Railway's public proxy. This is what you use when
  running `drizzle-kit` from your own machine.

### 2. Deploy the service

Connect this GitHub repository to a new service in the dashboard, or push the working directory
with `railway up`. Deploying from GitHub is the better default: every push to `main` rebuilds,
and rollbacks are a click.

`railway.json` selects the Dockerfile builder, sets the health check to `/health/` and retries a
failed deploy three times. The health check deliberately does not touch the database, because it
runs before the first migration and would otherwise roll back the very first deploy.

### 3. Set the variables

Two classes, and the difference is not cosmetic:

| Variable | Read | Consequence of getting it wrong |
|---|---|---|
| `DATABASE_URL` | runtime, from `process.env` | app cannot reach Postgres |
| `ADMIN_PASSWORD` | runtime, from `process.env` | `/admin` inaccessible |
| `PUBLIC_WHATSAPP_NUMBER` | **build time**, inlined by Vite | every WhatsApp link points at the placeholder number |
| `PUBLIC_PHONE_NUMBER` | **build time**, inlined by Vite | every phone link points at the placeholder number |

In the Railway dashboard, set `DATABASE_URL` as a reference to the Postgres service's own
`DATABASE_URL` so it stays correct if the database is recreated.

The `PUBLIC_*` pair must be present **when the image is built**. They are declared as `ARG` in the
Dockerfile; set them as service variables before triggering a build, and then verify — see step 6.
Never reference `DATABASE_URL` or `ADMIN_PASSWORD` through `import.meta.env`: Vite would replace
them with the build machine's values and ship them in the bundle, where they would also shadow
whatever the host sets.

Do not set `PORT`. Railway injects it and the server reads it; a hardcoded value will fail the
health check.

### 4. Migrate and seed, once

Copy `DATABASE_PUBLIC_URL` from the Postgres service's **Variables** tab and run the migration
from your own machine:

```sh
DATABASE_URL='postgresql://...proxy.rlwy.net:12345/railway' pnpm db:push
DATABASE_URL='postgresql://...proxy.rlwy.net:12345/railway' pnpm db:seed
```

Do not use `railway run pnpm db:push` for this. It injects the project's own variables, which
means the *internal* `DATABASE_URL` — and `postgres.railway.internal` does not resolve from
outside Railway, so it fails with a DNS error that looks like a broken database.

The runtime image keeps its dev dependencies and a copy of `src/db`, so the same two commands can
instead be run inside the container over `railway ssh` if you would rather not use the public
proxy at all.

### 5. Domain

Add `www.cars911.co` as a custom domain on the service, and redirect the apex to it at the DNS or
CDN layer. `site` in `astro.config.mjs` must match the final hostname exactly — it is what
canonicals, `sitemap.xml`, `robots.txt` and `llms.txt` are all built from.

`trailingSlash: 'always'` is set, and the Node adapter 301s a slash-less URL to its slashed form.
That is why the health check path is `/health/` and not `/health`.

### 6. Verify the deploy

```sh
curl -sI https://www.cars911.co/health/                    # 200, no database needed
curl -sI https://www.cars911.co/about                      # 301 to /about/
curl -s  https://www.cars911.co/robots.txt                 # correct Sitemap: host
curl -s  https://www.cars911.co/sitemap.xml                # index with five children
curl -s  https://www.cars911.co/ | grep -o 'wa.me/[0-9]*'  # your number, not 971501234567
curl -sI -H 'Accept-Encoding: gzip' https://www.cars911.co/ | grep -i content-encoding
```

The last one is worth doing. `@astrojs/node` does not compress, so if Railway's proxy does not
either, roughly 100 KB of CSS and 60 KB of HTML are going over the wire uncompressed on every
first visit. If nothing comes back from that header check, put a compressing proxy in front.

### Deploying anywhere else

Any Node host works:

```sh
docker build -t cars911 \
  --build-arg PUBLIC_WHATSAPP_NUMBER=971xxxxxxxxx \
  --build-arg PUBLIC_PHONE_NUMBER=+971xxxxxxxxx .
docker run -p 4321:4321 -e DATABASE_URL=... -e ADMIN_PASSWORD=... cars911
```

Or without Docker: `pnpm build && pnpm start`.

## URL structure

Fixed by the Action Document and the audit — lowercase, hyphenated, keyword early, trailing
slash, never more than three levels. All of it is built in `src/lib/urls.ts`; nothing constructs a
URL anywhere else.

| Page | Shape |
|---|---|
| Service | `/services/car-detailing-dubai/` (from the editable `seo_slug` column) |
| Service × location | `/services/detailing-in-al-quoz/` |
| Brand | `/brands/bmw-service-dubai/` |
| Brand × service | `/brands/bmw-service-dubai/brake-repair/` |
| Booking | `/book-a-service/` |

Pre-restructure URLs 301 to their new homes in `src/middleware.ts`. Category pages
(`/services/car-repair/`) still exist for navigation but are `noindex` and canonicalise to
`/services/`, because the spec has no category tier.

## Map

| Area | Where |
|---|---|
| DB schema / seed | `src/db/` |
| Form actions (quote, booking, leads, reviews) | `src/actions/index.ts` |
| Canonical URL builders | `src/lib/urls.ts` |
| Shared queries, site constants, admin auth | `src/lib/` |
| Name/address/phone, and everything gated on it | `src/lib/site.ts` (`NAP`) |
| Layout + components | `src/layouts/`, `src/components/` |
| Reusable page sections | `src/components/sections/` |
| Multi-step quote island | `src/islands/QuoteForm.svelte` |
| Pages | `src/pages/` (admin under `/admin`, guarded by `src/middleware.ts`) |
| Editorial content | `src/content/` |
| Sitemap, robots, llms.txt | `src/lib/sitemap.ts`, `src/pages/` |
| Font subsetting, content lint | `scripts/` |

## Waiting on the client

`NAP` in `src/lib/site.ts` is empty. The trust bar's rating line, the footer address block and the
`LocalBusiness`/`AutoRepair` schema are all built and all render only the parts that are filled
in, so nothing invented ever ships. Filling in that one object is the entire job.

If Cars911 has no premises a customer can visit, leave `street` empty permanently — an aggregator
without a shopfront should stay an `Organization` with a service area rather than claim an address
it does not have.

Also outstanding: the Google Business Profile rating and review count, certification logos for the
trust bar, and the final keyword map (the `seo_slug` column exists so that lands without a code
change).

## Not wired yet (deliberately)

Search Console, Bing and GA4 have hooks in `src/components/Analytics.astro` that stay inert until
the corresponding `PUBLIC_*` variables are set; re-measure TBT and INP after enabling GA4. Sentry,
WhatsApp Business API and OTP (links are plain `wa.me`), and transactional email are not built.
Policy pages are placeholder text pending legal review.
