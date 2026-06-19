# Design Overhaul Notes

## Key Problems (from user screenshots)
1. Mass Times cards: way too tall, centered text with excessive padding (py-8+)
2. "What to Expect" cards: tall blocks with icon + title + paragraph, too much whitespace
3. Ministry cards (Get Involved): huge cards with icon, title, big gap, then description
4. Outreach cards: tall blocks with contact names that aren't clickable
5. Faith Formation: contact names not email-linked

## Target Design (Sacraments page = gold standard)
- Single-row items: icon (36px) | title + subtitle | chevron/badge on right
- Compact padding: p-3 to p-4 max
- Border-left accent color for category
- Inline layout: flex items-center gap-3
- Max card height: ~60-70px on mobile

## Design Principles (Aster Sports-inspired)
- Information density: show more in less space
- Interactive: every card is tappable, expandable, or links somewhere
- Trendy: subtle shadows, rounded corners, color accents, micro-animations
- Contact names = mailto: links (green text, underline on hover)
- No dead space: if there's padding, it serves a purpose

## Card Template (apply everywhere)
```
<Card className="border-0 shadow-sm border-l-3 border-l-{color}">
  <CardContent className="p-3 flex items-center gap-3">
    <icon className="w-5 h-5 text-{color}" />
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
    </div>
    <right-element /> {/* badge, chevron, time, link */}
  </CardContent>
</Card>
```
