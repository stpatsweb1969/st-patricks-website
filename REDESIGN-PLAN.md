# St. Patrick in Armonk — Full Site Redesign Plan

## Critical Bug: Horizontal Overflow (Page Draggable Left/Right)

**Root Cause:** The scrolling announcement marquee in the Navigation component uses `whitespace-nowrap` with duplicated content that extends beyond the viewport. While the parent has `overflow-hidden`, on some mobile browsers the combination of `position: sticky` on the header and the marquee animation can leak horizontal scroll to the body.

**Fix:** Add `overflow-x: hidden` to the `html` and `body` elements in `index.css`, and ensure the PageLayout wrapper also clips overflow.

---

## Page-by-Page Redesign

### 1. HOMEPAGE (/)

**Current Problems:**
- Cards are too tall with excessive whitespace
- Journey cards scroll horizontally on mobile (should be vertical)
- The page can be dragged left/right (overflow bug)
- Too much vertical space between sections

**Redesign:**
- Fix overflow at the CSS root level
- Journey cards: vertical stack on mobile (already fixed in latest checkpoint)
- All sections use tight padding (p-3 max)
- Keep: Hero, Latest News, Coming Up (with countdown), Journey Cards, Pastor Welcome, Daily Readings, Bulletin preview, Photo Gallery, Catholic Resources, Newsletter CTA, Footer

---

### 2. BULLETIN PAGE (/bulletins)

**Current Problems:**
- Latest bulletin shows as an embedded iframe/Google Docs viewer — doesn't work well on mobile
- "Past Bulletins" section uses horizontal scroll cards — user wants vertical list
- Clicking a past bulletin opens a PDF in a new tab — user wants inline page-by-page reader

**Redesign:**
- **Latest Bulletin:** Replace the iframe with the existing `BulletinBookReader` component (already built!) which renders page-by-page with swipe navigation, zoom, and fullscreen
- **Past Bulletins:** Change from horizontal card scroll to a **vertical list** with compact rows (date | title | download button), similar to the Sacraments page accordion style
- When clicking a past bulletin, open it in the same `BulletinBookReader` inline on the page (not a new tab)
- Keep the subscribe CTA but make it more compact

---

### 3. MINISTRIES PAGE (/ministries) → Split into 3 Clear Sections

**Current Problems:**
- "Ministries & Devotions" combines three unrelated concepts:
  - **Devotions** = prayer schedule (when/where to pray)
  - **Parish Ministries** = volunteer roles (lectors, ushers, etc.)
  - **Charitable Outreach** = charity programs (Project Embrace, FIAT, etc.)
- The page title "Ministries & Devotions" is confusing

**Redesign — Option A (Single page, clearer sections):**
- Rename page to "Serve & Pray"
- **Section 1: Devotions** — Schedule-focused. Each devotion is a compact row: icon | name | description | day/time. This is "where to go and what to do" for prayer.
- **Section 2: Parish Ministries** — Volunteer-focused. Each ministry is a compact row with a "Learn More" or "Sign Up" action that links to /volunteer.
- **Section 3: Charitable Outreach** — Charity-focused. Each program is a compact row with contact email link.

**Redesign — Option B (Separate pages):**
- `/devotions` — Prayer schedule only
- `/ministries` — Volunteer roles only (links to /volunteer for signup)
- Keep outreach on the ministries page or move to a separate `/outreach`

**Recommendation:** Option A (single page, 3 clearly separated sections with distinct visual treatments). The page is already close to this — just needs clearer visual separation and the title/subtitle to communicate purpose.

---

### 4. DAILY READINGS (homepage section)

**Current Problems:**
- The readings section is very long on mobile — shows full text of First Reading, Psalm, and Gospel
- Takes up too much vertical space

**Redesign:**
- Show only the reading titles/references as compact rows (e.g., "First Reading: 1 Kings 21:1-16")
- Add "Read Full" expandable accordion or link to USCCB
- Keep the dark-green premium background treatment
- Saint of the Day: collapse to 2-3 lines with "Read more" link

---

### 5. MASS TIMES PAGE (/mass-times)

**Status:** Already redesigned with compact inline rows. Looks good.

**Minor tweaks:**
- Ensure no horizontal overflow from any element

---

### 6. FAITH FORMATION PAGE (/faith-formation)

**Status:** Already has good compact accordion style.

**Minor tweaks:**
- Add email links to any contact names that don't have them yet

---

### 7. SACRAMENTS PAGE (/sacraments)

**Status:** This is the GOLD STANDARD — user explicitly said this page has the right card height. Use this as the template for all other pages.

---

### 8. GIVING PAGE (/giving)

**Current Problems:**
- Cards are too tall with large QR code images
- Excessive padding

**Redesign:**
- Compact the WeShare and Venmo cards to single-row items with smaller QR codes
- Make the QR codes expandable on tap (show small thumbnail, tap to enlarge)
- Reduce overall section padding

---

### 9. CALENDAR PAGE (/calendar)

**Status:** Already uses list view (user's stated preference). Good structure.

**Minor tweaks:**
- Ensure the filter bar doesn't cause horizontal overflow on mobile

---

### 10. NEWS PAGE (/news)

**Status:** Already uses vertical card stack. Acceptable.

**Minor tweaks:**
- Compact card padding to match site-wide density

---

### 11. CONTACT PAGE (/contact)

**Status:** Standard two-column layout. Acceptable.

---

## Navigation Architecture (No Changes Needed Now)

Current nav structure is reasonable:
- About (Our Parish, New Here, Staff, Registration)
- Mass & Prayer (Mass Times, Sacraments)
- Faith Formation (Overview, CCD Calendar, Registration, Permissions, Teen Life)
- Parish Life (News, Calendar, Gallery, Bulletins, CYO, Ministries, Volunteer, Forms)
- Giving
- Contact

**Future consideration:** Rename "Ministries & Devotions" to "Serve & Pray" in the nav.

---

## Implementation Priority Order

1. **Fix horizontal overflow bug** (CSS-level fix, affects entire site)
2. **Redesign Bulletin page** (replace iframe with BulletinBookReader, vertical archive list)
3. **Compact homepage sections** (Daily Readings collapse, tighter spacing)
4. **Redesign Ministries page** (clearer section separation)
5. **Compact Giving page** (smaller QR codes, tighter cards)
6. **Polish remaining pages** (News, Contact, etc.)

---

## Design Principles (Applied Site-Wide)

| Principle | Implementation |
|-----------|---------------|
| Card height | Max 60px for single-row items, 80px for two-line items |
| Padding | p-3 for cards, py-4 for sections (never p-6 or p-8) |
| Icons | 16px (w-4 h-4) for inline, 20px for section headers |
| Typography | text-sm for body, text-xs for metadata, text-lg for section titles |
| Spacing | gap-1.5 between list items, mb-4 between sections |
| Interactivity | Every card tappable, email links on all contacts, expandable content |
| Mobile-first | Vertical stacks, no horizontal scroll (except photo gallery) |
| Overflow | `overflow-x: hidden` on html/body, no elements wider than viewport |
