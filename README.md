# Food & Grocery Marketplace (Phase 1)

Stack: Next.js 14, Prisma, SQLite, Tailwind

## Prerequisites
- Node.js 18+ (recommended: 20+)
- npm 9+
- SQLite (bundled; no external setup needed)

## Setup & Run

1) Install dependencies
```bash
npm install
```

2) Generate Prisma client
```bash
npx prisma generate
```

3) Initialize the database
```bash
npx prisma migrate dev --name init
```

4) Seed Admin and Staff users
```bash
npx ts-node --transpile-only prisma/seed.ts
```

5) Start the dev server
```bash
npm run dev
```

Open http://localhost:3000

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
- If `prisma migrate` fails, delete the dev DB and reset:
```bash
rm prisma/dev.db
npx prisma migrate reset
npx prisma migrate dev --name init
```
- If TypeScript type errors appear, ensure Node 18+ and run:
```bash
npm run dev
```
- If OTP verification fails, ensure you entered the username used during login when submitting OTP.