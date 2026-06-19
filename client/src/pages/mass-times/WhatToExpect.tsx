/**
 * What to Expect — Compact info cards for first-time visitors.
 */

import { Clock, Church, Calendar, Cross, ChevronRight } from "lucide-react";

export function WhatToExpect() {
  const items = [
    { icon: Clock, title: "Mass Lasts About an Hour", desc: "Readings, homily, prayers, and the Eucharist" },
    { icon: Church, title: "Come As You Are", desc: "No dress code — business casual is common" },
    { icon: Calendar, title: "Follow Along Easily", desc: "Missalettes in each pew with all readings and responses" },
    { icon: Cross, title: "Everyone Is Welcome", desc: "Not Catholic? Come forward for a blessing" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
          <Church className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="font-serif text-xl font-bold">What to Expect</h2>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.title} className="reveal flex items-center gap-3.5 p-3.5 rounded-xl bg-card border border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="w-9 h-9 rounded-lg bg-primary/6 flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-primary/80" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
