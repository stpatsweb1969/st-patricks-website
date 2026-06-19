# Design Insights from Claude's Approach

## Key Takeaways to Incorporate

### 1. Light-and-Dark Rhythm (Already Partially Done)
- Dark "sanctuary" sections (hero, prayer, footer) wrapping warm-parchment utility sections
- We already have this with our section-dark-green and section-cream alternation — good

### 2. Typography System (Upgrade Opportunity)
- **Display font (Fraunces)**: Warm old-style serif for headlines — gives warmth and tradition
- **Body font (Newsreader)**: Literary serif with real italics for readable content
- **Utility font (Inter)**: Uppercase sans for nav, chips, live data
- Currently we use system fonts + one serif — could upgrade to this 3-tier system

### 3. Interactive Features We Should Add
- **Prayer Wall with candle lighting** — emotional, devotional, community-building
- **Day-tabbed Mass schedule** — much better than static list, shows "next up" highlight
- **Ministry-filtered events** — filter chips (Worship, Formation, Teens, Service, Social)
- **Give widget** — once/monthly toggle, presets, custom amount (we have WeShare/Venmo links already)

### 4. Information Architecture
- About · Worship · Formation · Parish Life · Give + persistent "Plan a Visit" CTA
- Cleaner than our current 6-item nav with deep dropdowns

### 5. Liturgical Season Awareness (Already Done)
- We already have this with our green accent — good

### 6. Key Design Patterns
- **News ribbon** — single-line ticker below hero (we have Latest News card — similar)
- **Day tabs for schedule** — Mon/Tue/Wed/Thu/Fri/Sat/Sun buttons that filter the schedule
- **Event cards with category color coding** — date badge + category chip + countdown
- **Formation cards** — icon + who (audience) + title + description + "Learn more" link
- **Compact schedule rows** — time | name | type chip (Mass/Reconciliation/Adoration)

### 7. What NOT to Copy
- The generative stained-glass SVG window — too complex, adds load time, not mobile-friendly
- The prayer wall — nice concept but requires backend work and moderation
- The give widget — we already have WeShare/Venmo which are real payment providers

### 8. What TO Incorporate
- **Day-tabbed schedule** on Mass Times page (huge UX improvement)
- **Category-filtered events** on Calendar page
- **Compact schedule rows** with type chips (Mass/Confession/Adoration)
- **Formation cards** with audience labels ("Grades K-5", "High School", etc.)
- **Tighter typography hierarchy** — eyebrow labels, display titles, body text
- **Scroll reveals** that are snappy (already done)
- **News ribbon** below hero (we have this as Latest News card)

## Priority Additions for Our Redesign

1. **Day-tabbed Mass schedule** — replace static list with interactive tabs
2. **Category chips on events** — filter by Worship/Formation/Teens/Service/Social
3. **Audience labels on Faith Formation** — "Grades K-5", "Middle School", etc.
4. **Compact schedule rows** — time pill | name | type chip
5. **Better typography** — add Fraunces for display, keep our current serif for body
