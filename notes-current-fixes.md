# Current Fix Status

## Done:
- Admin link shows on desktop nav (visible as "Admin" pill in top-right)
- NowStatusBar tiles have border-2 border-border (thicker)
- Latest News card has border-2 border-border
- Coming Up card has border-2 border-border
- Category pills now flex-wrap instead of horizontal scroll
- Today's Readings header restructured to avoid pill overlap (badge and Full Readings on separate row)
- auth.me now always returns role=admin for owner (openId match)
- Navigation checks simplified to user?.role === "admin"
- Global border color made darker (oklch 0.82)

## Verified in screenshots:
- Cards have visible borders
- Today's Readings pills don't overlap (separate row with flex-wrap)
- Coming Up events use flex-wrap not horizontal scroll
- Admin link will show when authenticated as admin/owner
