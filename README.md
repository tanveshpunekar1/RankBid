# 🇮🇳 RankBid — India's Public Pay-To-Rank Leaderboard

**RankBid** is a high-visibility, transparent "pay-to-rank" featured placement directory and advertising platform tailored for Indian startups, SaaS products, D2C brands, creators, local businesses, and apps priced in **Indian Rupees (INR)**.

Inspired by the mechanics of *outbid.lol*, RankBid adapts the formula for Bharat:
- Native **INR pricing** with Indian numbering format (`₹1,00,000` / `₹10,00,000`).
- Seamless **Razorpay UPI & Cards** payment gateway integration.
- **Pay-The-Difference re-bidding**: Users only pay `(new_bid - previous_bid)` to raise their rank.
- Strictly framed as **"Paid Placement / Featured Advertising"** in compliance with **ASCI (Advertising Standards Council of India)** sponsored content norms (with persistent badges, footer disclosures, and dedicated `/legal/disclosures` page).
- **Self-hosted analytics**: Outbound referral click tracking and revenue dashboard at `/admin/stats`.

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** 18+ (tested on Node 20 / 22 / 24)
- **NPM** or **PNPM** / **Yarn**

### 2. Installation
```bash
# Clone or navigate to the directory
cd rank-one

# Install dependencies
npm install
```

### 3. Database Setup (Zero-Config SQLite for Local Dev / PostgreSQL for Prod)
By default, the `.env` file is configured with SQLite (`file:./dev.db`) for immediate zero-dependency local testing.

```bash
# Generate Prisma Client & push the schema
npx prisma generate
npx prisma db push

# Seed the database with 17 curated Indian startups & brands (Zerodha, Zepto, Postman, CRED, etc.)
npx tsx prisma/seed.ts
```

### 4. Run the Dev Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🔑 Environment Variables Configuration (`.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Prisma DB connection string (SQLite locally, PostgreSQL for Neon/Supabase) | `file:./dev.db` or `postgresql://...` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (Test or Live) | `rzp_test_...` *(Mock simulator activates if left dummy)* |
| `RAZORPAY_KEY_SECRET`| Razorpay Key Secret | `your_secret` |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook HMAC secret | `your_webhook_secret` |
| `SMS_PROVIDER` | SMS Provider engine (`mock`, `msg91`, or `twilio`) | `mock` *(Logs OTP to console and UI for fast local testing)* |
| `MSG91_AUTH_KEY` | (Optional) MSG91 API key for production Indian OTPs | `""` |
| `MSG91_TEMPLATE_ID` | (Optional) MSG91 DLT approved SMS template ID | `""` |
| `ADMIN_PIN` | Password PIN for `/admin` management console | `8888` |
| `ADMIN_SECRET_TOKEN`| Cookie encryption session secret | `rankbid_admin_session_key_2026` |
| `NEXT_PUBLIC_APP_URL` | App Base URL | `http://localhost:3000` |

---

## 📐 Bidding & Ranking Rules (Implemented Exactly)

1. **New Listings**: Whole rupee amounts, ₹100 minimum, ₹10,00,000 maximum, ₹1 increments.
2. **Claiming Rank #1**: Pay at least ₹100 more than the current top standing bid.
3. **Any Bid Gets Ranked**: Bids lower than #1 are immediately placed in their deterministic rank according to the amount paid.
4. **Tie-Breaking Rule**: Earlier paid bid keeps the higher rank (stable sort by `amount_paise DESC, created_at ASC`).
5. **Pay The Difference on Re-Bidding**:
   - Re-bidding the same URL/handle only charges `(New Desired Bid - Previous Paid Bid)`.
   - Computed securely **server-side from DB state**, never trusted from the client.
   - New bid must be at least ₹1 higher than the listing's current standing bid.
6. **URL Normalization**:
   - Strips tracking tags (`utm_*`, `fbclid`, `gclid`, `ref`, etc.).
   - Resolves link shorteners server-side with timeout protection.
   - Canonical keys for App Store (`apps.apple.com/app/id...`), Google Play (`play.google.com/store/apps/details?id=...`), GitHub (`github.com/owner/repo`), and Social Handles (`@handle` → `x.com/handle`, `instagram.com/handle`).
7. **Disallowed Listings**: Direct WhatsApp/Telegram/Discord/Signal chat invite links, gambling/betting sites, and adult/NSFW content are blocked at submission with explanatory error messages.
8. **Cryptographic Payment Verification**: Ranks are updated **ONLY** after HMAC SHA-256 Razorpay signature or webhook confirmation is verified on the server.

---

## 🛡️ ASCI Regulatory Compliance (India-Specific)

To ensure strict alignment with the **Advertising Standards Council of India (ASCI)** and digital media advertising norms:
- Every row and card carries a persistent **"Paid Placement"** badge.
- Sticky footer disclosure: *"Rank reflects amount paid for placement. This is a paid advertising product, not a game of chance or wagering platform."*
- Dedicated **`/legal/disclosures`** page explicitly detailing that ranking represents commercial advertising consideration.

---

## 🚀 Production Deployment Checklist

Before going live with real payments:

1. **PostgreSQL Database**:
   - Create a free Postgres database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
   - In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"` (or copy from `prisma/schema.postgresql.prisma`).
   - Set `DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"` in Vercel environment variables.
   - Run `npx prisma migrate deploy` or `npx prisma db push`.

2. **Razorpay Live Account**:
   - Activate your Razorpay Business account with your GST / PAN details.
   - Switch Razorpay to **Live Mode** and copy your `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` into Vercel.
   - Add your webhook endpoint in Razorpay Dashboard: `https://yourdomain.com/api/bids/webhook` with `order.paid` and `payment.captured` events.

3. **SMS OTP Provider (MSG91 / Twilio)**:
   - For India, [MSG91](https://msg91.com) is recommended for low-cost OTPs and DLT compliance.
   - Set `SMS_PROVIDER="msg91"`, `MSG91_AUTH_KEY="..."`, and `MSG91_TEMPLATE_ID="..."`.

4. **Custom Domain & Vercel**:
   - Push your code to GitHub and connect the repository to [Vercel](https://vercel.com).
   - Add your custom domain (e.g. `rankbid.in`).

---

## 📂 Project Architecture

```
rank-one/
├── prisma/
│   ├── schema.prisma              # SQLite (dev) / PostgreSQL (prod) schema
│   ├── schema.postgresql.prisma   # Ready-to-deploy Postgres schema
│   └── seed.ts                    # 17 Indian listings seed script
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with Navbar & ASCI Footer
│   │   ├── page.tsx               # Leaderboard homepage
│   │   ├── category/[slug]/       # Filtered category page
│   │   ├── submit/                # Submit / Re-bid flow with live check
│   │   ├── about/                 # About RankBid
│   │   ├── rules/                 # Plain-English bidding rules
│   │   ├── legal/disclosures/     # ASCI compliance page
│   │   ├── admin/                 # Admin console (PIN: 8888)
│   │   │   ├── page.tsx           # Listings moderation & category overrides
│   │   │   └── stats/page.tsx     # Self-hosted analytics & revenue
│   │   └── api/
│   │       ├── listings/          # Leaderboard & search
│   │       ├── listings/check/    # Instant URL check & re-bid difference
│   │       ├── listings/[id]/click/ # Click tracking & redirect
│   │       ├── bids/create-order/ # Razorpay order creation
│   │       ├── bids/verify/       # Signature verification & DB rank update
│   │       ├── bids/webhook/      # Razorpay webhook
│   │       ├── auth/send-otp/     # Phone OTP sender (Mock / MSG91)
│   │       ├── auth/verify-otp/   # OTP code verification
│   │       ├── classify/          # AI & keyword category classifier
│   │       └── admin/             # Admin login, listings, & stats
│   ├── components/
│   │   ├── Navbar.tsx             # Responsive header
│   │   ├── Footer.tsx             # ASCI regulatory footer
│   │   ├── TickerBar.tsx          # Stock-ticker live banner
│   │   ├── RankBadge.tsx          # Gold #1, Silver #2, Bronze #3 badges
│   │   ├── CategoryPills.tsx      # Sector filter pills
│   │   ├── LeaderboardTable.tsx   # Dense leaderboard table
│   │   ├── SubmitForm.tsx         # Live re-bid form & projected rank
│   │   ├── OtpModal.tsx           # Phone verification dialog
│   │   └── RazorpayPaymentModal.tsx # Razorpay Checkout & Dev Simulator
│   └── lib/
│       ├── prisma.ts              # Prisma client singleton
│       ├── utils.ts               # INR currency & Indian number formatting
│       ├── url-normalizer.ts      # URL sanitizer & shortener resolver
│       ├── moderation.ts          # Disallowed link filter
│       ├── categories.ts          # 15 Category definitions
│       ├── classifier.ts          # Classification engine
│       ├── razorpay.ts            # Payment order & HMAC verification
│       └── sms-provider.ts        # SMS interface (Mock, MSG91, Twilio)
├── vercel.json
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🛡️ License
MIT License. Built for Bharat's builders and ambitious brands.
