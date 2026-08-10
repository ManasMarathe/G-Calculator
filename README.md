# G-Tracker 🌿

The circle's shared jar, ledger and sesh log. Everyone who buys feeds the
treasury (grams + what it cost), every sesh burns from it, and the app keeps
score of who owes whom — every gram accounted for.

## How it works

- **Treasury 💰** — log every buy: who, grams, ₹. The jar's weighted-average
  cost per gram comes from this.
- **Sesh 💨** — the start weight is locked to the current jar (last sesh's end
  + buys since), you only enter the end weight and who was in rotation. Cost is
  split equally, at the ₹/g rate frozen at sesh time.
- **Settle 🤝** — buys earn credit, sesh shares are debits, the weed still in
  the jar counts as everyone's. Minimal set of transfers to get square.
- **Stats 📊** — top buyer, heaviest lungs, jar runway, cost trends.

## Setup

1. Create a free [Supabase](https://supabase.com) project (region: Mumbai
   `ap-south-1`) and run `supabase/schema.sql` in the SQL editor.
2. `cp .env.example .env.local` and fill in the Supabase URL, service-role key
   (Settings → API) and your circle's PIN.
3. `npm install && npm run dev`

## Deploy (Vercel)

Import the repo on [vercel.com](https://vercel.com), add the three env vars
from `.env.example`, deploy. Share the URL + PIN with the circle only.

> Supabase free tier pauses after ~7 days of inactivity — if the app 500s
> after a dormant stretch, wake the project in the Supabase dashboard.
