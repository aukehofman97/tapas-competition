# Tapas Competition

Mobile-first scoring app for a Spanish tapas competition. 11 participants each register one tapa, then vote on each other's tapas across 5 categories. Live leaderboard updates in real-time across all phones.

## Stack

- React 18 + Vite 5
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Framer Motion — screen transitions, slide-up modals
- Supabase — Postgres database + Realtime subscriptions
- canvas-confetti — fires when the leaderboard #1 changes

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Copy the example env file and fill in your project credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in your Supabase dashboard → Project Settings → API.

### 3. Apply the database schema

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

This creates the `participants` and `votes` tables with RLS policies and Realtime enabled.

### 4. Run locally

```bash
npm run dev
```

Open `http://localhost:5173` on each phone (must be on the same network, or deploy to a public URL).

## Deploy

```bash
npm run build
```

The `dist/` folder can be hosted on any static host (Netlify, Vercel, GitHub Pages, etc.).

## How it works

1. Each participant selects their name from the fixed list of 11 and enters their tapa name — this registers them.
2. The app persists the selected name in `localStorage` so refresh doesn't require re-selecting.
3. From the **Vote** tab, users can rate any tapa except their own across 5 categories (0–10). Votes can be edited at any time.
4. The **Home** tab shows a live leaderboard ranked by average overall score. The #1 tapa gets a crown and confetti fires when the leader changes.
5. Tapping any tapa opens a detail view with per-category averages, voter breakdown, and any earned badges.
6. The **Results** tab allows exporting all scores as JSON and resetting the competition.

## Scoring

- **Overall Experience** = mean of the 5 category scores for a single vote
- **Tapa total score** = mean of all voters' overall experience scores
- **Most Original** badge = highest average originality score across all tapas
- **Best Presentation** badge = highest average presentation score across all tapas
