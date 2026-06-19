/**
 * Mass Times Page — Composition of schedule, holy day alerts, and info sections.
 * SEO description is generated from the shared schedule engine (single source of truth).
 */

import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { useReveal } from "@/hooks/useReveal";
import PageHeader from "@/components/PageHeader";
import { HolyDayAlert } from "./mass-times/HolyDayAlert";
import { WeeklySchedule } from "./mass-times/WeeklySchedule";
import { AtAGlance } from "./mass-times/AtAGlance";
import { WhatToExpect } from "./mass-times/WhatToExpect";
import { useParishSchedule, generateSEODescription } from "@/hooks/useParishSchedule";
import { DEFAULT_PARISH_SCHEDULE } from "../../../shared/scheduleEngine";
import { Link } from "wouter";
import { Heart } from "lucide-react";

export default function MassTimes() {
  const revealRef = useReveal();
  const { schedule } = useParishSchedule();

  // Use live schedule from DB if available, otherwise fall back to default
  const seoDescription = generateSEODescription(schedule ?? DEFAULT_PARISH_SCHEDULE);

  return (
    <PageLayout>
      <SEO
        title="Mass Times & Confession"
        path="/mass-times"
        description={seoDescription}
      />
      <PageHeader
        eyebrow="Worship With Us"
        title="Mass Times & Confession"
        description="Join us in worship and prayer. All are welcome at St. Patrick's."
      />

      <div ref={revealRef} className="container py-6 sm:py-10 space-y-8">
        <HolyDayAlert />
        <WeeklySchedule />

        {/* Mass Intention CTA */}
        <div className="reveal flex items-center gap-4 p-4 rounded-xl border border-primary/20 bg-primary/[0.03]">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif font-semibold text-sm">Request a Mass Intention</p>
            <p className="text-xs text-muted-foreground">Have a Mass offered for a loved one, living or deceased.</p>
          </div>
          <Link href="/mass-intention" className="shrink-0 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Request
          </Link>
        </div>

        <AtAGlance />
        <WhatToExpect />
      </div>
    </PageLayout>
  );
}
