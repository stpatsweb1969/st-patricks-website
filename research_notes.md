# Research Notes - Phase 2 Features

## CCD Calendar
- Google Calendar source: reled@stpatrickinarmonk.org (Religious Education Schedule)
- Timezone: America/New_York
- Currently empty for summer (June 2026) - normal, CCD runs Sept-May
- Embed URL: https://calendar.google.com/calendar/embed?src=reled%40stpatrickinarmonk.org&ctz=America%2FNew_York
- Can embed directly via iframe OR use Google Calendar API for richer integration

## CYO Basketball
- Google Calendar embed URL provided but generic (newembed)
- Need to build a custom sports calendar/schedule system
- Features needed: game schedules, team rosters, scores, locations

## Flocknote
- Flocknote is a church communication platform (email + text messaging)
- St. Patrick's Flocknote: https://stpatarmonk.flocknote.com/home
- It's their existing parishioner communication tool
- Features: email/text messaging, groups, polls, member management
- We should integrate a prominent "Join Flocknote" CTA on the site
- No public API available - best approach is linking to their Flocknote page

## Integration Approach
1. CCD Calendar: Embed Google Calendar + build admin-managed event system
2. CYO Basketball: Custom sports management module with schedules, teams, scores
3. Flocknote: Prominent sign-up links throughout the site
4. CCD Registration: Online form with database storage
5. Volunteer Sign-ups: Event-based volunteer management
