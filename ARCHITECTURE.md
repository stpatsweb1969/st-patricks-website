# St. Patrick in Armonk — Architecture Guide

> Use this document as context when reviewing any file in this repository. It provides the full picture of how the system fits together.

## Overview

A modern parish website for St. Patrick Church in Armonk, NY (29 Cox Avenue, Armonk, NY 10504). Built as a full-stack web application with React frontend, Express/tRPC backend, and MySQL database. Deployed on Manus hosting platform.

**Live domain:** `stpatsarmonk-24g7ux9f.manus.space`
**GitHub:** `astersports/st-patricks-armonk`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Routing | Wouter (lightweight client-side router) |
| State/Data | tRPC 11 (end-to-end type-safe API) |
| Backend | Express 4, tRPC procedures |
| Database | MySQL/TiDB via Drizzle ORM |
| Auth | Manus OAuth (owner-only admin) |
| Storage | S3 via Manus storage proxy (`/manus-storage/`) |
| Calendar | ICS feed parsing (Google Calendar .ics feeds) |
| Weather | Open-Meteo API (free, no key needed) |

## Directory Structure (Post-Refactor)

```
├── client/src/
│   ├── pages/
│   │   ├── Home.tsx              # Thin composition (95 lines) — imports from home/
│   │   ├── home/                 # Homepage section components
│   │   │   ├── HeroSection.tsx       (215 lines) — Hero image, weather widget, CTA buttons
│   │   │   ├── NowAtStPatrick.tsx    (40 lines) — Thin composition importing sub-sections
│   │   │   ├── now-sections/
│   │   │   │   ├── ThisSundayPreview.tsx  (68 lines) — Sunday Mass readings preview
│   │   │   │   ├── ComingUpFiltered.tsx  (173 lines) — Filtered events list with weather
│   │   │   │   └── LatestNewsEditorial.tsx (133 lines) — Featured + secondary news
│   │   │   ├── CatholicResources.tsx (197 lines) — Resource links section
│   │   │   ├── DailyReadings.tsx     (164 lines) — USCCB readings display
│   │   │   ├── JourneyCardsSection.tsx (103 lines) — 4 journey navigation cards
│   │   │   ├── SaintOfDayCard.tsx    (104 lines) — Saint of the day
│   │   │   ├── PhotoGallerySection.tsx (92 lines) — Photo gallery preview
│   │   │   ├── ThisWeeksBulletin.tsx (90 lines) — Latest bulletin card
│   │   │   ├── NewsletterSection.tsx (69 lines) — Email subscribe CTA
│   │   │   └── RainAlertBanner.tsx   (23 lines) — Rain warning banner
│   │   ├── Admin.tsx             # Thin composition (119 lines) — imports from admin/
│   │   ├── AdminRouter.tsx       # Admin route definitions
│   │   ├── admin/                # Admin manager components
│   │   │   ├── DashboardHome.tsx     (318 lines) — Admin overview stats
│   │   │   ├── GalleryManager.tsx    (402 lines) — Photo gallery CRUD
│   │   │   ├── SacramentsManager.tsx (255 lines) — Sacrament form submissions
│   │   │   ├── KeyDatesManager.tsx   (229 lines) — Important dates management
│   │   │   ├── CcdManager.tsx        (213 lines) — CCD registrations
│   │   │   ├── CyoManager.tsx        (202 lines) — CYO management
│   │   │   ├── DocumentsManager.tsx  (171 lines) — Document uploads
│   │   │   ├── BulletinManager.tsx   (160 lines) — Bulletin PDF uploads
│   │   │   ├── NewsManager.tsx       (143 lines) — News post CRUD
│   │   │   ├── VolunteerManager.tsx  (118 lines) — Volunteer signups
│   │   │   ├── EventManager.tsx      (104 lines) — Event management
│   │   │   ├── SettingsManager.tsx   (104 lines) — Site settings
│   │   │   ├── UserManager.tsx       (123 lines) — User management
│   │   │   ├── SubscriberList.tsx    (78 lines) — Email subscribers
│   │   │   ├── CcdPermissionsManager.tsx (74 lines) — CCD permissions
│   │   │   ├── ParishRegistrationsManager.tsx (65 lines) — Parish registrations
│   │   │   └── index.ts             — Barrel exports
│   │   ├── AllCalendars.tsx      (257 lines) — Thin composition importing from calendars/
│   │   ├── calendars/
│   │   │   ├── calendarData.ts       (79 lines) — Types, constants, utilities
│   │   │   ├── FilterNav.tsx         (86 lines) — Sticky source filter tabs
│   │   │   └── EventCard.tsx         (113 lines) — Individual event row
│   │   ├── MassTimes.tsx         (32 lines) — Thin composition importing from mass-times/
│   │   ├── mass-times/
│   │   │   ├── scheduleData.ts       (237 lines) — Types, schedule constants, utilities
│   │   │   ├── WeeklySchedule.tsx    (171 lines) — Interactive day tabs + service cards
│   │   │   ├── AtAGlance.tsx         (51 lines) — Quick reference grid
│   │   │   ├── WhatToExpect.tsx      (73 lines) — First-time visitor info
│   │   │   └── HolyDayAlert.tsx      (38 lines) — Holy day announcement
│   │   ├── Bulletins.tsx         (136 lines) — Thin composition importing from bulletins/
│   │   ├── bulletins/
│   │   │   ├── BulletinSubscribeCTA.tsx (85 lines) — Email subscribe form
│   │   │   └── BulletinArchive.tsx   (190 lines) — Filterable paginated archive
│   │   ├── Sacraments.tsx        (~500 lines) — Sacrament info + forms
│   │   ├── FaithFormation.tsx    (~400 lines) — CCD, Teen Life, RCIA
│   │   ├── Staff.tsx             (~400 lines) — Staff directory
│   │   └── Giving.tsx            (~200 lines) — Online giving
│   ├── components/               # Reusable UI components
│   │   ├── navigation/              — Split navigation module
│   │   │   ├── menuData.ts           (142 lines) — Menu structure and data
│   │   │   ├── DesktopNav.tsx        (70 lines) — Desktop dropdown navigation
│   │   │   ├── MobileMenu.tsx        (180 lines) — Mobile slide-out menu
│   │   │   ├── Navigation.tsx        (153 lines) — Main navigation wrapper
│   │   │   └── index.ts              — Barrel export
│   │   ├── this-week/               — Split This Week module
│   │   │   ├── scheduleConfig.ts     (62 lines) — Schedule data and utilities
│   │   │   └── ServiceCard.tsx       (99 lines) — Individual service row
│   │   ├── ThisWeekAccordion.tsx     (227 lines) — Thin composition importing from this-week/
│   │   ├── TimelineFeed.tsx          — Timeline event list
│   │   ├── WeatherIcons.tsx          — SVG weather icons (day + night)
│   │   ├── Footer.tsx                — Site footer
│   │   ├── MobileBottomNav.tsx       — Bottom tab bar
│   │   └── ui/                       — shadcn/ui primitives
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities (trpc client, liturgical season)
│   └── App.tsx                   # Route definitions
├── server/
│   ├── _core/                    # Framework plumbing (DO NOT EDIT)
│   ├── routers/                  # Split tRPC procedures by domain
│   │   ├── index.ts                  (58 lines) — Merges all routers into appRouter
│   │   ├── _helpers.ts               (49 lines) — Shared auth helpers (protectedProcedure, adminProcedure)
│   │   ├── admin.ts                  (109 lines) — Admin stats, users, settings, important dates
│   │   ├── content.ts                (92 lines) — Catholic resources, readings, saint, prayer wall
│   │   ├── ccd.ts                    (99 lines) — CCD registration management
│   │   ├── cyo.ts                    (92 lines) — CYO practice management
│   │   ├── volunteer.ts              (80 lines) — Volunteer signups
│   │   ├── news.ts                   (76 lines) — News post CRUD
│   │   ├── bulletins.ts              (76 lines) — Bulletin management
│   │   ├── calendar.ts               (73 lines) — ICS calendar feeds
│   │   ├── gallery.ts                (69 lines) — Photo gallery
│   │   ├── events.ts                 (57 lines) — Event management
│   │   ├── forms.ts                  (329 lines) — All sacrament/registration forms
│   │   ├── subscriptions.ts          (46 lines) — Email subscriptions
│   │   ├── weather.ts                (30 lines) — Weather endpoints
│   │   └── auth.ts                   (22 lines) — Auth/logout
│   ├── db/                       # Split database query helpers by domain
│   │   ├── index.ts                  — Barrel re-exports all query functions
│   │   ├── news.ts, bulletins.ts, events.ts, etc. (~20-120 lines each)
│   ├── weather/                  # Split weather module
│   │   ├── index.ts                  — Barrel re-exports
│   │   ├── types.ts                  (70 lines) — Shared types and interfaces
│   │   ├── helpers.ts                (75 lines) — Caching, geocoding, utilities
│   │   ├── current.ts                (96 lines) — Current conditions
│   │   ├── daily.ts                  (83 lines) — 7-day daily forecast
│   │   └── forecast.ts              (257 lines) — Hourly forecast + event weather
│   ├── notifications.ts          (~50 lines) — CCD reminder notifications
│   ├── icsParser.ts              (136 lines) — Google Calendar ICS parser
│   ├── dailyReadings.ts          (~100 lines) — USCCB daily readings
│   ├── saintOfDay.ts             (~80 lines) — Saint of the day
│   └── storage.ts                — S3 storage helpers
├── drizzle/
│   ├── schema.ts                 — Database schema (all tables)
│   └── relations.ts              — Table relationships
└── shared/
    ├── types.ts                  — Shared TypeScript types
    └── const.ts                  — Shared constants
```

## How to Review This Code

The codebase is organized into small, focused files (most under 200 lines). When reviewing:

**Pick any file from `server/routers/`** — each is a self-contained domain with clear inputs/outputs. Check:
- Input validation (Zod schemas)
- Auth guards (publicProcedure vs protectedProcedure vs adminProcedure)
- Error handling
- SQL injection prevention (Drizzle ORM handles this)

**Pick any file from `client/src/pages/home/`** — each is a standalone section component. Check:
- Data fetching patterns (tRPC hooks)
- Loading/error states
- Mobile responsiveness
- Accessibility

**Pick any file from `client/src/pages/admin/`** — each is a CRUD manager. Check:
- Permission checks
- Form validation
- Optimistic updates vs invalidation
- Error feedback to user

**Pick any file from `server/weather/`** — each handles one concern (types, caching, current, daily, forecast). Check:
- API error handling and fallback behavior
- Cache TTL logic (15-min for current, 30-min for daily)
- Timezone handling (America/New_York)
- Data transformation from raw API response

**Pick any file from `server/db/`** — each is a domain-specific query module. Check:
- Query efficiency and proper Drizzle ORM usage
- Error handling
- Return types matching what routers expect

**Pick any file from `client/src/components/navigation/`** — split navigation module. Check:
- Menu data structure and route correctness
- Mobile vs desktop rendering
- Accessibility (keyboard nav, ARIA)

**For `drizzle/schema.ts`:** Check table relationships, index usage, and data types.

## Data Flow

```
User → React Page → trpc.feature.useQuery() → tRPC Procedure → db.ts helper → MySQL
                                                     ↓
                                              External APIs:
                                              - Open-Meteo (weather)
                                              - Google Calendar ICS feeds
                                              - USCCB readings
```

## Authentication & Roles

- **Public**: All parish content pages (Mass times, calendar, news, forms, etc.)
- **Protected (owner-only)**: Admin dashboard (`/admin/*`) — only the site owner (checked via `OWNER_OPEN_ID`) can access
- Auth uses Manus OAuth with session cookies
- `protectedProcedure` in tRPC checks auth; admin routes additionally check `ctx.user.role === 'admin'`

## External Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| Open-Meteo | Weather data (current, hourly, daily) | No API key needed, uses lat/lon for Armonk |
| Google Calendar ICS | Parish, CCD, CYO event feeds | Public .ics URLs |
| USCCB | Daily Mass readings | Web scraping |
| Manus Storage (S3) | File uploads (bulletins, photos, documents) | Built-in, no config |
| Manus Notifications | Owner alerts on form submissions | Built-in |

## Calendar ICS Feeds

- **Parish Events:** `stpatrickinarmonk.org_...@group.calendar.google.com`
- **CCD (Religious Ed):** `reled@stpatrickinarmonk.org`
- **CYO Basketball:** `stpatrickinarmonk.org_5snqr5qqph11et22r6sk81k67g@group.calendar.google.com`

## Weather System

The weather system has three layers:
1. **Current conditions** (`getCurrentWeather`) — Real-time temp, wind, humidity via Open-Meteo `current` endpoint. 15-min server cache.
2. **Hourly forecast** (`getWeatherForEvent`) — Used for per-event weather badges in This Week accordion.
3. **Daily forecast** (`getDailyForecast`) — 7-day high/low, precipitation probability, sunrise/sunset. 30-min cache.

Frontend refreshes every 30 minutes. Weather widget in hero shows current conditions with tap-to-expand popover (feels-like, humidity, wind, sunrise/sunset). Night-mode icons activate based on `is_day` flag.

## Design System

- **Colors:** Forest green (#1B5E20, #2E7D32), gold (#C8A951), cream backgrounds
- **Fonts:** Fraunces (headings), Inter (body), Playfair Display (accents)
- **Theme:** Light mode with green/gold parish branding
- **Mobile:** Bottom tab bar, hamburger menu, responsive everything
- **Animations:** Scroll reveal, staggered entrances, button press feedback

## Common Patterns

- All API calls use tRPC procedures (never raw fetch)
- Database queries go through `server/db/` domain helpers (barrel-exported via `server/db/index.ts`)
- Forms use React Hook Form + Zod validation
- Loading states use skeleton components
- Errors show toast notifications via Sonner
- File uploads go to S3 via `storagePut()`
- Admin checks use `OWNER_OPEN_ID` comparison
