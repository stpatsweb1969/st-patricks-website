# Calendar Consolidation Recommendation

## Current Setup

St. Patrick's currently maintains three separate Google Calendars:

1. **Parish Calendar** — general parish events, liturgical dates, office closures
2. **CCD Calendar** — religious education class schedule, retreats, sacrament prep
3. **CYO Calendar** — basketball practices, games, tournaments, sports events

These are pulled into the website and displayed together with source-based filter tabs (All, Parish, CCD, CYO). Additionally, a curated "Key Dates" list of 48 milestone events is maintained separately in the website's database.

## Recommendation: Consolidate to One Google Calendar with Color-Coded Labels

Instead of three separate calendars, consider migrating to a **single Google Calendar** with event categories managed through color-coded labels (also called "event colors" in Google Calendar):

| Current Calendar | Proposed Label Color | Label Name |
|---|---|---|
| Parish Calendar | Tomato (red) | Parish |
| CCD Calendar | Sage (green) | CCD |
| CYO Calendar | Tangerine (orange) | CYO |
| — | Grape (purple) | Sacraments |
| — | Blueberry (blue) | Teen Life |
| — | Banana (yellow) | Social |

## Benefits

1. **Single source of truth** — no more checking which calendar an event belongs to or accidentally adding it to the wrong one.

2. **Easier delegation** — share one calendar with staff and volunteers rather than managing permissions across three.

3. **Matches the website** — the website already displays all events together with filter tabs. A single calendar with labels maps directly to this UX.

4. **Key Dates integration** — milestone events (currently maintained separately) could simply be added to the same calendar with a special "Key Dates" label/color, eliminating the need for a separate database table.

5. **Mobile-friendly** — parishioners who subscribe to the calendar on their phones only need one subscription URL instead of three.

## Migration Steps

1. Export each existing calendar as .ics files (Google Calendar → Settings → Export)
2. Create a new "St. Patrick's Armonk" calendar (or designate the Parish calendar as the primary)
3. Import the CCD and CYO .ics files into the primary calendar
4. Apply color labels to the imported events (batch-select by keyword)
5. Update the Google Calendar IDs in the website settings
6. Share the single calendar link with staff

## Timeline

This migration can be done in under an hour and requires no changes to the website code — the filter system already works with a single calendar that has labeled events. The website can be updated to read event colors instead of source calendars with a simple code change.

## No Action Required Now

This is a recommendation for discussion. The website works perfectly with the current three-calendar setup. This consolidation would simplify ongoing calendar management but is not urgent.
