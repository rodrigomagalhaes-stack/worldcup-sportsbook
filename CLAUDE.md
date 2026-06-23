# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Dev server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

## Environment Setup

Copy `.env.example` to `.env` and fill in:
```
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Architecture

**Stack:** React 19 + Vite + Tailwind CSS v4 + Framer Motion + Supabase

### Data Flow

All state lives in [`src/hooks/useStore.js`](src/hooks/useStore.js) via `useStore()`. It loads everything from Supabase on mount and exposes CRUD functions to components. **Day promotions use optimistic updates** — changes are applied locally first, then synced; failures are rolled back.

The Supabase client and all query functions are in [`src/lib/supabase.js`](src/lib/supabase.js). Components never import `supabase` directly; they go through `useStore`.

### Match Data

The 72 World Cup group-stage matches are hardcoded in [`src/data/matches.js`](src/data/matches.js) (not fetched from Supabase). The `matches` export is an array used throughout the app to derive dates, groups, and team info. `promoTypes` and `groups` constants are also defined here.

### Views (tabs)

`App.jsx` manages a `tab` state that switches between five views:
- **day** — `DayView`: match list for a selected date + per-match events
- **calendar** — `CalendarView`: month grid with promo count badges
- **groups** — `GroupsView`: standings-style view by group
- **summary** — `SummaryView`: all events across all matches
- **general** — `GeneralPromotionsView`: promotions not tied to a specific match

The `DateBar` component (shown only in day tab) renders a scrollable date strip.

### Promotions Model

Three promotion types exist:
- **events** — attached to a specific match (`match_id`); type from `['boost','mercado','promo']`
- **general_promotions** — not tied to any match
- **day_promotions** — tied to a date; limited to **2 active per day** (enforced by a Postgres trigger `trg_day_promo_limit`). States: `active | standby | suggestion`. Managed via `PromoDrawer` (slide-in panel).

### Theming

`useTheme()` in `useStore.js` toggles `data-theme` attribute on `<html>`. CSS variables are defined in `src/index.css` under `[data-theme="dark"]`. All components use CSS vars (e.g. `var(--bg)`, `var(--green)`) via inline styles — Tailwind is used minimally.

### Database Schema

Schema and seed data are in [`supabase/schema.sql`](supabase/schema.sql). All tables have RLS enabled with public read/write policies (no auth in the app). Run the schema in the Supabase SQL Editor to bootstrap a new project. The local Supabase config is in [`supabase/config.toml`](supabase/config.toml).
