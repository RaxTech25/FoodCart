# Food & Grocery Marketplace (Phase 1)

Stack: Next.js 14, Prisma, PostgreSQL (Neon), Tailwind

## Prerequisites
- Node.js 18+ (recommended: 20+)
- npm 9+
- A PostgreSQL database (Neon recommended)

## Local Setup (PostgreSQL)
1) Create a Neon project (https://neon.tech)
- Create a database and a role
- Copy the connection string (ensure `sslmode=require`)

2) Add environment variables
- Create `.env` from `.env.example` and set:
```
DATABASE_URL="postgres://USER:PASSWORD@HOST/DBNAME?sslmode=require"
```

3) Install dependencies
```bash
npm install
```

4) Generate Prisma client
```bash
npx prisma generate
```

5) Initialize the database (creates migrations folder)
```bash
npx prisma migrate dev --name init
```

6) Seed Admin and Staff users
```bash
npx ts-node --transpile-only prisma/seed.ts
```

7) Start the dev server
```bash
npm run dev
```

Open http://localhost:3000

## Production Deploy (Vercel + Neon)
1) Push this repo to GitHub
2) Create a project on Vercel and import the repo
3) In Vercel Project Settings → Environment Variables:
- Add `DATABASE_URL` with your Neon connection string (with `sslmode=require`)
4) Build & deploy
- `package.json` runs `prisma generate` and `prisma migrate deploy` automatically during build

Optional: Run seed in production
- Vercel doesn't run arbitrary seed scripts. You can temporarily add a route to trigger seeding or run `prisma` and `ts-node` in a one-off CI step. Ask me if you'd like a secure seed endpoint.

## Logins (first login requires OTP)
- Admin: `admin` / `Admin@123`
- Staff: `staff` / `Staff@123`

## Key Pages
- Login: `/(auth)/login`
- Register Vendor: `/register/vendor`
- Register Partner: `/register/partner`
- Register Customer: `/register/customer`
- Admin Dashboard: `/admin`
- Staff Dashboard: `/staff`

## Notes
- OTP codes are generated and stored in DB; delivery is stubbed (Phase 2 will add SMS/Email integration).
- Vendor/Partner logins are gated until approved (Partner also needs kitReceived = true).
- Document uploads, product catalog, ordering flow, partner assignment, payments, and charts will be implemented in later phases.

## Troubleshooting
- If migrations fail locally, reset:
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```
- Ensure `DATABASE_URL` uses `sslmode=require` on Neon.
- If OTP verification fails, ensure you entered the same username used during login when submitting OTP.