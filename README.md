# trendishop

E-commerce platform for Bangladesh — storefront, customer accounts, and a full admin/operations
dashboard. This monorepo holds both halves of the product:

| Folder | What it is | Stack |
|---|---|---|
| [`TrendiShop_Client/`](TrendiShop_Client) | Storefront + admin dashboard | Next.js 16 (App Router), React 19, TypeScript, Redux Toolkit / RTK Query, Tailwind CSS v4 |
| [`TrendiShop_Server/`](TrendiShop_Server) | REST API | Express 4, TypeScript, Mongoose 8 (MongoDB Atlas), JWT auth, Zod validation |

Payments: bKash, SSLCommerz, Cash on Delivery. Courier: **Steadfast** (booking, status sync, returns).
Currency: BDT (৳); purchases are tracked in RMB (¥) and BDT.

> **Note:** folders, package names and internal strings still carry the `TrendiShop` name from the
> codebase this was cloned from. Renaming is a separate, deliberate pass — see *Rebranding* below.

## Getting started

Requirements: Node.js 20+ and a MongoDB Atlas database.

```bash
# 1. Install both apps (each keeps its own node_modules and lockfile)
npm run install:all

# 2. Environment
cp TrendiShop_Server/.env.example TrendiShop_Server/.env          # fill in DATABASE_URL, JWT secrets, …
cp TrendiShop_Client/.env.example TrendiShop_Client/.env.local    # NEXT_PUBLIC_API_URL etc.

# 3. Run the API (http://localhost:5000) and the web app (http://localhost:3000) together
npm run dev
```

| Script | Does |
|---|---|
| `npm run dev` | API + web together, output labelled `[api]` / `[web]` |
| `npm run dev:api` / `npm run dev:web` | Just one of them |
| `npm run build` | Builds the API, then the web app |
| `npm run typecheck` | `tsc --noEmit` in both apps |
| `npm run lint:web` | ESLint on the web app |

Creating the first admin: set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (or `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`) in `TrendiShop_Server/.env`, then run
`npx ts-node --transpile-only src/scripts/setup-admin.ts` (or `setup-superadmin.ts`) from `TrendiShop_Server/`.

## Rebranding checklist

Not done yet — when the new brand name is decided, these are the places that carry the old one:

- Folder names `TrendiShop_Client` / `TrendiShop_Server`, and `name` in all three `package.json` files
- `metadataBase` and SEO metadata in `TrendiShop_Client/src/app/layout.tsx`
- Image `remotePatterns` hostnames in `TrendiShop_Client/next.config.ts`
- Guest-email placeholder domain `@guest.trendishop.com` (auth, order, user, fraud services)
- Default Terms/Privacy copy in `TrendiShop_Server/src/app/modules/siteContent/siteContent.service.ts`
- `EMAIL_FROM` default in `TrendiShop_Server/src/app/config/index.ts`
- Order number prefix `SK-` in the order service

## Conventions

- **Single vendor.** The inherited multi-vendor system was removed on purpose — no shops, sellers, commission or seller payouts. `order.packages[]` now means shipments (one per order); the courier integration depends on it.
- **Brand colour** is `--color-primary` in `TrendiShop_Client/src/app/globals.css`. Use `var(--color-primary)` / `rgba(var(--color-primary-rgb), .12)`, never a hard-coded hex. Status colours stay semantic (green = active/paid, amber = warning, red = error).
- **Admin pages** are built from the shared kit in `TrendiShop_Client/src/components/admin/ui.tsx`.
- **New API module:** copy `TrendiShop_Server/src/app/modules/coupon/` (model, validation, service, controller, routes) and mount it in `src/app.ts`.
- **Secrets never go in code.** Keep keys, database URLs and passwords in `.env` only — `.env` is gitignored, only `.env.example` is committed.
