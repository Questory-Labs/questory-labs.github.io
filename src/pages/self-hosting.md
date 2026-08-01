---
layout: ../layouts/DocsLayout.astro
title: Self-hosting Questory
description: The complete guide — prebuilt Docker images, Docker Compose profiles, environment configuration, reverse proxy setup, backups, and optional modules.
---

## License limits

Self-hosting of the community stack is allowed only under the [PolyForm Noncommercial License 1.0.0](https://github.com/Questory-Labs/Questory/blob/main/LICENSE):

- **Allowed:** personal use, hobby projects, and other noncommercial purposes (including many educational / charitable uses as defined in the license).
- **Not allowed under this license:** selling the software, charging for access/hosting of this software as a product, or other use primarily for commercial advantage or monetary compensation. Ask the copyright holder for a commercial license if you need that.
- **Attribution / notices:** if you redistribute the software (or a modified version), you must include the license terms (or the PolyForm URL) and any `Required Notice:` lines from `LICENSE`.
- This project is **source-available**, not OSI open source. Do not assume MIT/Apache-style commercial rights.

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| **Docker** 20.10+ | Required for all self-hosted deployments |
| **Docker Compose** v2 | Ships with Docker Desktop; standalone install also works |
| **Steam Web API key** | Get one at [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey) |
| **~512 MB RAM** | Minimum for the lite (SQLite) stack; full stack needs ~1 GB+ |
| **pnpm 10+** _(optional)_ | Only needed if building from source or using the `pnpm docker:*` shortcuts |
| **Node.js 20+** _(optional)_ | Only needed for local development without Docker |

---

## Architecture overview

Questory is a monorepo with two main services:

<div class="arch-diagram" role="img" aria-label="Questory architecture diagram">
  <div class="arch-tier">
    <div class="arch-box arch-box--web">
      <div class="arch-box__header">
        <span class="arch-box__icon">⬡</span>
        <span class="arch-box__name">Web</span>
        <span class="arch-box__port">:3000</span>
      </div>
      <div class="arch-box__tech">Next.js · Tailwind · TanStack Query</div>
      <div class="arch-box__desc">Dashboard, library, analytics UI</div>
    </div>
  </div>
  <div class="arch-connector">
    <div class="arch-connector__line"></div>
    <div class="arch-connector__label">API calls</div>
    <div class="arch-connector__line"></div>
  </div>
  <div class="arch-tier">
    <div class="arch-box arch-box--api">
      <div class="arch-box__header">
        <span class="arch-box__icon">⬢</span>
        <span class="arch-box__name">API</span>
        <span class="arch-box__port">:4000</span>
      </div>
      <div class="arch-box__tech">NestJS · Prisma · BullMQ</div>
      <div class="arch-box__desc">Steam sync, music, watch, read, cron</div>
      <div class="arch-box__desc">Auth: email + password, Steam OpenID (link-only)</div>
    </div>
  </div>
  <div class="arch-connector">
    <div class="arch-connector__line"></div>
    <div class="arch-connector__arrow">▼</div>
    <div class="arch-connector__line"></div>
  </div>
  <div class="arch-tier arch-tier--infra">
    <div class="arch-box arch-box--sm arch-box--db">
      <div class="arch-box__header">
        <span class="arch-box__icon">⛁</span>
        <span class="arch-box__name">Database</span>
      </div>
      <div class="arch-box__desc">SQLite or PostgreSQL</div>
    </div>
    <div class="arch-box arch-box--sm arch-box--cache">
      <div class="arch-box__header">
        <span class="arch-box__icon">◈</span>
        <span class="arch-box__name">Redis</span>
      </div>
      <div class="arch-box__desc">Cache & queues (optional)</div>
    </div>
    <div class="arch-box arch-box--sm arch-box--ext">
      <div class="arch-box__header">
        <span class="arch-box__icon">⊕</span>
        <span class="arch-box__name">External APIs</span>
      </div>
      <div class="arch-box__desc">Steam, TMDB, Trakt, AniList…</div>
    </div>
  </div>
</div>

**One database:** Steam, music, watch, and read all use the same `DATABASE_URL`. Schema lives in `packages/db`. Identity is a shared `User` row (email+password account, Steam link, music ingest token, Trakt/AniList connections).

---

## Deployment modes

| `APP_MODE` | Stack | Database | Cache/Queues | Best for |
|------------|-------|----------|--------------|----------|
| `local` | Bare Node.js | SQLite | In-memory | Development on your machine |
| `selfhosted` | Docker (SQLite) | SQLite volume | In-memory, inline sync | Home server, single user, Raspberry Pi |
| `selfhosted-full` | Docker (full) | PostgreSQL | Redis + BullMQ | Always-on self-host, multiple users |
| `production` | Docker (full + hardened) | PostgreSQL | Redis + BullMQ | Public HTTPS, multi-user instance |

> **Caching note:** The API always caches (in-memory by default). Set `REDIS_URL` to share cache and enrich locks across processes and enable BullMQ sync queues. Without Redis, game metadata freshness still applies via DB timestamps (`metadataSyncedAt` — skip Steam re-enrich for ~1 day), so concurrent syncs on a single process do not re-scan the same games.

---

## Quick start — prebuilt images

Prebuilt Docker images are published on **every build** to both registries:

### Available images

| Image | GHCR (GitHub Container Registry) | Docker Hub |
|-------|----------------------------------|------------|
| **API** | `ghcr.io/questory-labs/questorylabs-api:latest` | `santoshpanna/questorylabs-api:latest` |
| **Web** | `ghcr.io/questory-labs/questorylabs-web:latest` | `santoshpanna/questorylabs-web:latest` |
| **QEngine** _(enterprise)_ | `ghcr.io/questory-labs/questorylabs-qengine:latest` | — |

> **Tip:** GHCR images are public and don't require authentication to pull. Docker Hub images are also public under the [`santoshpanna`](https://hub.docker.com/u/santoshpanna) namespace. You can use either registry interchangeably.

### Using prebuilt images (recommended for most users)

You don't need to clone the repo or build anything. Just create a working directory, grab the compose file and env template, and start:

**1. Download the compose file and env template:**

```bash
# Create a directory for Questory
mkdir questory && cd questory

# Download docker-compose.yml
curl -LO https://raw.githubusercontent.com/Questory-Labs/Questory/main/docker-compose.yml

# Download the env template for your deployment mode
# Choose ONE of:
curl -LO https://raw.githubusercontent.com/Questory-Labs/Questory/main/.env.selfhosted.example       # SQLite lite
curl -LO https://raw.githubusercontent.com/Questory-Labs/Questory/main/.env.selfhosted-full.example   # Postgres + Redis
curl -LO https://raw.githubusercontent.com/Questory-Labs/Questory/main/.env.production.example        # Production HTTPS
```

**2. Configure your environment:**

```bash
cp .env.selfhosted.example .env    # or whichever template you chose
```

Edit `.env` and set at minimum:

```env
SESSION_SECRET=<random-string-at-least-16-chars>
STEAM_API_KEY=<your-steam-web-api-key>
```

**3. Start the stack:**

```bash
# Lite (SQLite) — uses GHCR images by default
docker compose --profile selfhosted --env-file .env up -d

# Full (Postgres + Redis)
docker compose --profile selfhosted-full --env-file .env up -d

# Production
docker compose --profile production --env-file .env up -d
```

> **Runtime env:** `NEXT_PUBLIC_API_URL` is read at **container start** from the web service environment (written into `/runtime-env.js`). Prebuilt images honor compose `environment` without a rebuild — no need to build custom images just to change URLs.

### Switching registries

To use Docker Hub instead of GHCR, set the image names in your `.env` or override in `docker-compose.override.yml`:

```yaml
# docker-compose.override.yml — example using Docker Hub images
services:
  api:
    image: santoshpanna/questorylabs-api:latest
  web:
    image: santoshpanna/questorylabs-web:latest
```

### Pinning versions

Both registries tag images by Git SHA and semantic version. To pin a specific release:

```yaml
services:
  api:
    image: ghcr.io/questory-labs/questorylabs-api:v1.2.3
  web:
    image: ghcr.io/questory-labs/questorylabs-web:v1.2.3
```

---

## Quick start — build from source

If you prefer to build images locally (e.g., for custom modifications):

**1. Clone the repository:**

```bash
git clone https://github.com/Questory-Labs/Questory.git
cd Questory
```

**2. Copy an env template and configure:**

```bash
cp .env.selfhosted.example .env    # or .env.selfhosted-full.example / .env.production.example
# Edit: SESSION_SECRET, STEAM_API_KEY, optional ALLOWED_STEAM_IDS
```

**3. Build and start:**

```bash
# If you have pnpm installed (shortcuts):
pnpm docker:selfhosted -- --build        # Lite (SQLite)
pnpm docker:selfhosted-full -- --build   # Full (Postgres + Redis)
pnpm docker:prod -- --build              # Production

# Or use Docker Compose directly:
docker compose --profile selfhosted --env-file .env up -d --build
docker compose --profile selfhosted-full --env-file .env up -d --build
docker compose --profile production --env-file .env up -d --build
```

> **`pnpm docker:up`** is an alias for `docker:selfhosted-full`.

### After starting

- **Web UI:** `http://localhost:3000` (or your `WEB_ORIGIN`)
- **API:** `http://localhost:4000` (or your public API URL)
- **Health check:** `GET /health` on the API reports mode, database provider, Redis/sync mode, allowlist status, and `music.enabled` / `watch.enabled` / `read.enabled`

---

## Enterprise stack (QEngine)

The enterprise compose file adds **QEngine** (binary-only recommendation engine) alongside the full stack:

```bash
cp .env.enterprise.example .env
# Set SESSION_SECRET, STEAM_API_KEY, CRON_SECRET, etc.
docker compose -f docker-compose.enterprise.yml --env-file .env up -d --build
```

| Variable | Value |
|----------|-------|
| `ENTERPRISE` | `true` |
| `NEXT_PUBLIC_ENTERPRISE_URL` | `http://localhost:4030` (QEngine port) |

> **License:** QEngine images are for **personal / noncommercial** use only. Commercial use requires a separate license from Questory Labs.

The QEngine image is available at `ghcr.io/questory-labs/questorylabs-qengine:latest`.

---

## Environment variable reference

### Core (required)

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_MODE` | Boot mode: `local`, `selfhosted`, `selfhosted-full`, `production` | `selfhosted` |
| `SESSION_SECRET` | Session signing secret (min 16 chars, **never** use placeholders in non-local modes) | `kj29F!xP...` |
| `STEAM_API_KEY` | [Steam Web API key](https://steamcommunity.com/dev/apikey) | `ABC123DEF456...` |

### Database

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_PROVIDER` | `sqlite` or `postgresql` | `sqlite` (selfhosted), `postgresql` (full/prod) |
| `DATABASE_URL` | Connection string | `file:/data/questorylabs.db` (SQLite) or `postgresql://questorylabs:questorylabs@postgres:5432/questorylabs` |

> **Caveat:** Prisma cannot read `provider` from env at runtime. The build step `pnpm db:schema` generates `schema.prisma` from `schema.template.prisma`. Docker images handle this automatically.

### Cache & queues

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection string (enables BullMQ + shared cache) | _(empty = in-memory)_ |
| `USE_INLINE_SYNC` | `true` for synchronous inline sync (SQLite mode), `false` for BullMQ queues | `true` (selfhosted) |

### URLs & origins

| Variable | Description | Default |
|----------|-------------|---------|
| `STEAM_REALM` | Steam OpenID realm — **must be the API origin** | `http://localhost:4000` |
| `STEAM_RETURN_URL` | Steam OpenID callback — must start with `STEAM_REALM` | `http://localhost:4000/auth/steam/callback` |
| `WEB_ORIGIN` | Browser app origin (CORS + post-login redirect) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | API URL the browser calls (set at container start via `/runtime-env.js`) | `http://localhost:4000` |
| `COOKIE_DOMAIN` | Cookie domain for cross-subdomain auth | _(empty = host-only)_ |
| `CORS_ORIGINS` | Extra CORS origins (comma-separated) | `$WEB_ORIGIN` |

### Access control

| Variable | Description | Default |
|----------|-------------|---------|
| `ALLOWED_STEAM_IDS` | Comma-separated 17-digit Steam IDs for linking allowlist | _(empty = any)_ |
| `ADMIN_EMAILS` | Comma-separated emails auto-granted `isAdmin` on register/login | _(empty)_ |
| `TRUST_PROXY` | Set `true` behind a reverse proxy for correct client IP / rate limits | _(unset)_ |
| `AUTH_BLOCKED_EMAIL_DOMAINS` | Extra disposable email domains to reject on signup | _(empty)_ |

### Feature flags

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENABLE_MUSIC` | Show Music nav (also requires API `/health` → `music.enabled`) | `false` |
| `NEXT_PUBLIC_ENABLE_WATCH` | Show Watch nav (also requires API `/health` → `watch.enabled`) | `false` |
| `NEXT_PUBLIC_ENABLE_READ` | Show Read nav (also requires API `/health` → `read.enabled`) | `false` |
| `ENTERPRISE` | Enable enterprise features | `false` |
| `NEXT_PUBLIC_ENTERPRISE_URL` | QEngine URL | _(empty)_ |

> **Important:** `NEXT_PUBLIC_*` variables are baked into the web build at image build time **except** `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_ENTERPRISE_URL`, which are injected at container start via `/runtime-env.js`. If you change other `NEXT_PUBLIC_*` flags, you must **rebuild the web image**.

### Cron

| Variable | Description | Default |
|----------|-------------|---------|
| `CRON_ENABLED` | Enable in-process cron scheduling | `true` |
| `CRON_SECRET` | Bearer token for `POST /v1/internal/cron/*` HTTP triggers | _(empty)_ |
| `CRON_DAILY_SCHEDULE` | Cron expression for daily library sync | `0 3 * * *` |
| `CRON_RECOVERY_SCHEDULE` | Cron expression for stuck-job recovery | `*/15 * * * *` |
| `CRON_WATCH_SCHEDULE` | Cron expression for watch source sync | `0 */6 * * *` |
| `CRON_CATALOG_SCHEDULE` | Cron expression for catalog refresh | `0 4 * * *` |

### Optional integrations

| Variable | Description |
|----------|-------------|
| `ITAD_API_KEY` | IsThereAnyDeal API key |
| `IGDB_CLIENT_ID` / `IGDB_CLIENT_SECRET` | IGDB (Twitch) credentials for game metadata |
| `MUSICBRAINZ_USER_AGENT` | Required by MusicBrainz rate limiting (format: `AppName/version (email)`) |
| `TRAKT_CLIENT_ID` / `TRAKT_CLIENT_SECRET` | Trakt OAuth for watch module |
| `TRAKT_REDIRECT_URI` | Trakt callback URL |
| `TMDB_API_KEY` | TMDB API key for watch metadata (attribution required in UI) |
| `ANILIST_CLIENT_ID` / `ANILIST_CLIENT_SECRET` | AniList OAuth |
| `ANILIST_REDIRECT_URI` | AniList callback URL |

---

## Auth (email + password)

Sign-up and sign-in use **email + password only**. Steam OpenID is link-only from **Connections** (requires an existing session).

- `ADMIN_EMAILS` — comma-separated emails granted `isAdmin` on register/login (also checked at request time). The first user is **not** admin unless listed here.
- Signup is always open while `count(isAdmin)=0`. After that, admins toggle signup in **Admin → Settings** (`AppConfig.signupEnabled`).
- Abuse protection: signed challenges, honeypots, min form-fill time, IP/email rate limits, login lockout, Origin checks. Prefer Redis (`REDIS_URL`) for multi-instance rate limits.
- `TRUST_PROXY=true` when behind a reverse proxy so client IP / rate limits use `X-Forwarded-For`.
- `AUTH_BLOCKED_EMAIL_DOMAINS` — extra disposable domains to reject on signup.

---

## Steam OpenID URLs

- `STEAM_REALM` and `STEAM_RETURN_URL` must use the **API** origin.
- `STEAM_REALM` must be a **prefix** of `STEAM_RETURN_URL` — this is a hard Steam OpenID requirement.
- Example: realm `https://api.example.com`, return `https://api.example.com/auth/steam/callback`.
- `WEB_ORIGIN` is the browser app origin (CORS + post-login redirect).

> **Common mistake:** Setting `STEAM_REALM` to the web origin instead of the API origin. Steam auth callbacks go to the API — always use the API URL.

---

## Steam ID allowlist

Set `ALLOWED_STEAM_IDS` to a comma-separated list of 17-digit SteamIDs (find yours via [steamid.io](https://steamid.io)):

```env
ALLOWED_STEAM_IDS=76561198000000000,76561198000000001
```

- **Non-empty:** only listed SteamIDs can be **linked** from Connections (others get `?error=not_allowed`).
- **Empty / unset:** any Steam account may be linked by a signed-in user.

Recommended for private `selfhosted` / `selfhosted-full` deployments.

---

## Optional modules

### Music analytics (optional)

Questory Music runs **inside the API** (`apps/api`). It does not collect plays itself — deploy [multi-scrobbler](https://github.com/foxxmd/multi-scrobbler) (or any ListenBrainz-compatible client) and point it at the API.

#### Enable

Music **shares the same database** as Steam (same `DATABASE_URL`). Schema is owned by `packages/db`.

1. Set `NEXT_PUBLIC_ENABLE_MUSIC=true` on the web service. **Rebuild the web image** after changing this flag.
2. Ingest tokens are **per-user** — mint them in **Settings → Profile** after login (not env vars).

```env
NEXT_PUBLIC_ENABLE_MUSIC=true
# MUSICBRAINZ_USER_AGENT=QuestoryLabs-Music/0.1 (you@example.com)
```

Session APIs live at `/v1/music/*` on the API origin (same process and port as Steam).

#### Point multi-scrobbler at Questory Music

Use multi-scrobbler's [ListenBrainz client](https://docs.multi-scrobbler.app/configuration/clients/listenbrainz/) (or the [Koito client](https://docs.multi-scrobbler.app/configuration/clients/koito/) pattern):

| Variable | Value |
|----------|-------|
| `LZ_URL` / base URL | `http://<api-host>:4000` (or `http://<api-host>:4000/apis/listenbrainz`) |
| `LZ_TOKEN` / API key | Token from Settings → Profile (music ingest key) |
| `LZ_USER` | ListenBrainz username shown on Profile (auto-created slug) |

Music accepts on the API:

- `POST /1/submit-listens` and `POST /apis/listenbrainz/1/submit-listens`
- `GET /1/validate-token`
- `GET /1/user/:user/listens` (for MS duplicate detection)
- `GET /1/user/:user/listen-count`
- `GET /1/user/:user/playing-now`

Analytics live at `/v1/music/analytics/*` (same API process).

#### Import listening history

Bulk-import past listens from **Music → Sources** (or `POST /v1/music/imports` with multipart field `file`). Formats match [Koito's importers](https://koito.io/guides/importing/):

| Source | Typical filename hint |
|--------|------------------------|
| Koito SQLite DB | `koito.db` / `*.sqlite` |
| Koito JSON export | `koito*.json` (`version: "1"`) |
| Spotify extended history | `Streaming_History_Audio*.json` |
| Maloja export | `*maloja*.json` |
| Last.fm (ghan.nl JSON) | `*recenttracks*.json` |
| ListenBrainz export zip | `*listenbrainz*.zip` |

Import runs asynchronously; poll `GET /v1/music/imports/:jobId` for progress. Duplicates are skipped via `(userId, trackId, listenedAt)`.

#### Frontend menus

The web app shows **Music** nav items only when **both** are true:

1. `NEXT_PUBLIC_ENABLE_MUSIC=true` (set at web image build time)
2. API `GET /health` reports `ok: true` and `music.enabled` is not `false`

If the flag is off or the API health check fails, the Steam UI is unchanged.

---

### Watch analytics (optional)

Questory Watch is an **API module** under `/v1/watch/*`. It ingests movie/TV history into the **same shared database** and `User` as Steam/music. Webhooks stay unversioned at `/webhooks/*` on the API.

#### Enable

```env
NEXT_PUBLIC_ENABLE_WATCH=true
TRAKT_CLIENT_ID=...
TRAKT_CLIENT_SECRET=...
TRAKT_REDIRECT_URI=http://localhost:4000/v1/watch/trakt/callback
TMDB_API_KEY=...   # TMDB API key or v4 read token
# Optional:
# ANILIST_CLIENT_ID / ANILIST_CLIENT_SECRET / ANILIST_REDIRECT_URI
# (default redirect: http://localhost:4000/v1/watch/anilist/callback)
```

Watch session APIs live at `/v1/watch/*` on the API origin; webhooks at `/webhooks/*` (same process and port as Steam).

**Plex / Jellyfin:** mint a `watch_webhook` ApiKey in **Settings → Watch** (or Profile). Send it as header `x-watch-webhook-secret` — there is no global `WATCH_WEBHOOK_SECRET` env.

**Multi-user / non-local:** serve API + web under a common site (or `COOKIE_DOMAIN`) so the browser sends `questorylabs_session` to the API.

#### Sources

| Source | How |
|--------|-----|
| **Trakt** | OAuth at `/v1/watch/trakt/authorize` → history + ratings + watchlist sync |
| **TMDB** | Metadata enrichment (genres, posters, runtime). Attribution required in UI. |
| **Letterboxd** | Official export zip or CSV (`POST /v1/watch/imports/letterboxd`, optional `include=diary,ratings,watched,watchlist`) — no scraping |
| **AniList** | OAuth + list sync (day/unknown precision) |
| **MyAnimeList** | OAuth + PKCE at `/v1/watch/mal/authorize` → anime + manga import |
| **Shikimori** | OAuth at `/v1/watch/shikimori/authorize` → anime + manga import |
| **Bangumi** | OAuth at `/v1/watch/bangumi/authorize` → collection import |
| **Kitsu** | Email/password connect at `POST /v1/watch/kitsu/connect` → library import |
| **Plex / Jellyfin** | `POST /webhooks/plex` and `POST /webhooks/jellyfin` on the API (unversioned) |

By default the API schedules Trakt, AniList, MAL, Kitsu, Bangumi, and Shikimori sync every 6 hours (`CRON_WATCH_SCHEDULE`; disable with `CRON_ENABLED=false`).

#### Frontend menus

Watch nav appears when `NEXT_PUBLIC_ENABLE_WATCH=true` **and** API `GET /health` reports `ok: true` with `watch.enabled` not `false`.

---

### Read (manga / print) (optional)

Questory Read is an **API module** under `/v1/read/*`. It syncs manga/manhwa/novels from AniList, MyAnimeList, Kitsu, Bangumi, and Shikimori into dedicated Read tables (not Watch `Title` / `WatchEvent`).

```env
NEXT_PUBLIC_ENABLE_READ=true
# AniList / MAL / Shikimori / Bangumi OAuth — see Watch section
# Kitsu: connect in Read → Sources (email + password; tokens only stored)
```

Read nav appears when `NEXT_PUBLIC_ENABLE_READ=true` **and** API `GET /health` reports `ok: true` with `read.enabled` not `false`. Connect AniList under **Read → Sources** (or Watch → Sources — shared connection), then sync.

---

## Reverse proxy setup

Prefer a **same-origin** setup (e.g. `https://games.example.com` for the UI and `https://games.example.com/api` proxied to the API). That avoids cross-site cookie issues.

### Example: Caddy (same host, path split)

```caddy
games.example.com {
  handle /auth/* {
    reverse_proxy api:4000
  }
  handle /health {
    reverse_proxy api:4000
  }
  handle /v1/* {
    reverse_proxy api:4000
  }
  handle /1/* {
    reverse_proxy api:4000
  }
  handle /webhooks/* {
    reverse_proxy api:4000
  }
  handle /api/* {
    uri strip_prefix /api
    reverse_proxy api:4000
  }
  handle {
    reverse_proxy web:3000
  }
}
```

Browser path `/api/v1/library` becomes Nest `/v1/library` after `strip_prefix /api`. Steam auth and health stay unversioned at the API root; resource APIs live under `/v1`. ListenBrainz ingest stays at `/1/*`; watch webhooks at `/webhooks/*`.

### Example: Nginx (same host, path split)

```nginx
server {
    listen 443 ssl;
    server_name games.example.com;

    ssl_certificate     /etc/ssl/certs/games.example.com.pem;
    ssl_certificate_key /etc/ssl/private/games.example.com.key;

    # API routes
    location ~ ^/(auth|health|v1|1|webhooks)/ {
        proxy_pass http://api:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # /health (exact)
    location = /health {
        proxy_pass http://api:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Everything else → web
    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Example: Traefik (Docker labels)

```yaml
services:
  api:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`games.example.com`) && (PathPrefix(`/auth`) || PathPrefix(`/health`) || PathPrefix(`/v1`) || PathPrefix(`/1`) || PathPrefix(`/webhooks`))"
      - "traefik.http.services.api.loadbalancer.server.port=4000"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
  web:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=Host(`games.example.com`)"
      - "traefik.http.routers.web.priority=1"
      - "traefik.http.services.web.loadbalancer.server.port=3000"
      - "traefik.http.routers.web.tls.certresolver=letsencrypt"
```

### Separate subdomains (app. + api.)

If same-origin is not possible, use separate hosts and configure cross-domain cookies:

```env
WEB_ORIGIN=https://app.example.com
STEAM_REALM=https://api.example.com
STEAM_RETURN_URL=https://api.example.com/auth/steam/callback
NEXT_PUBLIC_API_URL=https://api.example.com
COOKIE_DOMAIN=.example.com   # note the leading dot
```

> **Warning:** Cross-origin setups require HTTPS everywhere. Browsers increasingly block third-party cookies — same-origin is strongly recommended.

---

## HTTPS & cookies caveats

| Scenario | What to set |
|----------|-------------|
| Local / LAN (no TLS) | Defaults are fine. Cookies use `SameSite=Lax`, no `Secure` flag. |
| Behind HTTPS reverse proxy | `TRUST_PROXY=true` so Express reads `X-Forwarded-Proto`. Cookie `Secure` auto-detects from the Origin header. |
| Separate subdomains | `COOKIE_DOMAIN=.example.com` + HTTPS on both. `COOKIE_SECURE` auto-detects but can be overridden. |
| API and web on different ports (same host) | Works by default — cookies scope to the host, not the port. |

> **Caveat:** If you set `COOKIE_DOMAIN` wrong (e.g., to a public suffix like `.com`), cookies will be rejected by the browser silently. Always use your own domain with a leading dot.

> **Caveat:** Production mode (`APP_MODE=production`) will **refuse to start** if `SESSION_SECRET` looks like a placeholder, or if `STEAM_REALM`/`WEB_ORIGIN` still contain `localhost`.

---

## Daily sync cron

Cron runs **in-process** inside the API by default (opt out with `CRON_ENABLED=false`). It schedules the same work as the internal cron HTTP routes:

- **Daily refresh** — enqueue `library-sync` + `metadata-refresh` for every logged-in user
- **Recover failed sync** — clear stuck `SyncJob` rows and catalog lock/failed state
- **Watch source sync** — Trakt/AniList/MAL/Kitsu/Bangumi/Shikimori on `CRON_WATCH_SCHEDULE`

Scheduled ticks and admin/HTTP triggers write `CronRun` rows (`triggeredBy`: `system` | `admin` | `cron`) visible under `/admin/cron`.

```env
# Default: on. Disable in-process scheduling (e.g. external-only HTTP cron):
# CRON_ENABLED=false
CRON_SECRET=a-long-random-shared-secret
```

`CRON_SECRET` is required only for `POST /v1/internal/cron/*` (Bearer / `x-cron-secret`). Admin triggers use the admin session; in-process ticks do not need the secret.

### External cron (optional)

If you disable in-process cron, you can call the HTTP routes externally:

```bash
# Daily sync
curl -X POST http://localhost:4000/v1/internal/cron/daily \
  -H "Authorization: Bearer $CRON_SECRET"

# Recovery
curl -X POST http://localhost:4000/v1/internal/cron/recover \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Backups

### Lite (SQLite)

Copy the Docker volume file (default DB path inside the container: `/data/questorylabs.db`), or back up the `sqlite_data` volume. Steam, music, watch, and read share this file.

```bash
# Copy from the running container
docker cp questory-api-1:/data/questorylabs.db ./backup-$(date +%Y%m%d).db

# Or snapshot the volume
docker run --rm -v questory_sqlite_data:/data -v $(pwd):/backup \
  alpine cp /data/questorylabs.db /backup/questorylabs-$(date +%Y%m%d).db
```

### Full / production (PostgreSQL)

Use `pg_dump` against the `postgres` service, or snapshot the `postgres_data` volume. Steam, music, watch, and read tables live in the same `questorylabs` database.

```bash
# pg_dump from the running container
docker exec questory-postgres-1 \
  pg_dump -U questorylabs questorylabs > backup-$(date +%Y%m%d).sql

# Restore
docker exec -i questory-postgres-1 \
  psql -U questorylabs questorylabs < backup-20260801.sql
```

Redis holds cache, locks, and in-flight jobs — back it up only if you care about queue state.

### Automated backup schedule

Consider a cron job on the host:

```bash
# /etc/cron.d/questory-backup (example)
0 4 * * * root docker exec questory-postgres-1 pg_dump -U questorylabs questorylabs | gzip > /backups/questory-$(date +\%Y\%m\%d).sql.gz
```

---

## Updating

### With prebuilt images

```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose --profile selfhosted-full --env-file .env up -d
```

> **Schema migrations** run automatically on container start (`prisma db push`). Always back up your database before updating.

### From source

```bash
git pull origin main
docker compose --profile selfhosted-full --env-file .env up -d --build
```

> **Caveat:** If `NEXT_PUBLIC_ENABLE_MUSIC`, `NEXT_PUBLIC_ENABLE_WATCH`, or `NEXT_PUBLIC_ENABLE_READ` changed, the **web image must be rebuilt** (these flags are baked at build time). `NEXT_PUBLIC_API_URL` is the exception — it's injected at container start.

---

## Troubleshooting

### API won't start in production mode

Production boot **fails** if:
- `SESSION_SECRET` is a placeholder like `change-me-in-production` or shorter than 16 chars
- `STEAM_REALM` or `WEB_ORIGIN` still contain `localhost`

Check logs: `docker compose logs api`

### Steam login redirects to wrong URL

Ensure:
- `STEAM_REALM` = your **API** origin (not web)
- `STEAM_RETURN_URL` starts with `STEAM_REALM`
- `WEB_ORIGIN` = your **web** origin (for post-login redirect)

### Music/Watch nav items don't appear

Both conditions must be true:
1. `NEXT_PUBLIC_ENABLE_MUSIC=true` (or `_WATCH` / `_READ`) — requires web image rebuild
2. API `GET /health` reports the module as enabled

### Cookies not working behind reverse proxy

- Set `TRUST_PROXY=true`
- Ensure the proxy forwards `X-Forwarded-For` and `X-Forwarded-Proto` headers
- For separate subdomains, set `COOKIE_DOMAIN=.yourdomain.com`
- Verify HTTPS is properly terminated

### Database connection errors

- Check `DATABASE_URL` matches your compose service name (e.g., `postgres` not `localhost` inside Docker)
- Ensure the Postgres container is healthy before the API starts (compose `depends_on` handles this)

### Rate limiting / lockout

- Rate limits use in-memory storage by default. Set `REDIS_URL` for shared limits across container restarts.
- Login lockout: 5 failed attempts → 15 minute lockout (per IP)

---

## Secrets checklist

Before going live, verify all secrets are set:

- [ ] `SESSION_SECRET` — long random string (reject weak placeholders in non-local modes)
- [ ] `STEAM_API_KEY` — [Steam Web API key](https://steamcommunity.com/dev/apikey)
- [ ] `CRON_SECRET` — required for `/v1/internal/cron/*` HTTP callers (optional if you only use in-process cron)
- [ ] Music ingest / watch webhook tokens — mint per-user ApiKeys in Settings (not env vars)
- [ ] `TRAKT_CLIENT_ID` / `TRAKT_CLIENT_SECRET` — required for Trakt OAuth (watch module)
- [ ] `TMDB_API_KEY` — required for watch metadata enrichment (keep TMDB attribution in the UI)
- [ ] Change default Postgres password in compose for any internet-facing host
- [ ] **Never commit `.env`** to version control

---

## Schema deploy note

Canonical schema: `packages/db/prisma/schema.template.prisma`. Use `pnpm db:generate` / `pnpm db:push` from the repo root. Containers run `prisma db push` on start against that shared schema.

> **Caveat:** If you're upgrading from an older version with schema changes, the auto-push may fail on breaking changes. Always check the [release notes](https://github.com/Questory-Labs/Questory/releases) and back up before updating.
