/**
 * Faith Formation page — Thin composition importing from faith-formation/.
 */

import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useReveal } from "@/hooks/useReveal";
import PageHeader from "@/components/PageHeader";
import { ProgramAccordion } from "./faith-formation/ProgramAccordion";
import { FaithFormationSidebar } from "./faith-formation/Sidebar";

export default function FaithFormation() {
  const revealRef = useReveal();

  return (
    <PageLayout>
      <SEO
        title="Faith Formation"
        path="/faith-formation"
        description="Faith formation programs at St. Patrick Church — CCD religious education, RCIA, adult Bible study, sacrament preparation, and youth ministry."
      />
      <PageHeader
        eyebrow="Growing in Faith"
        title="Faith Formation"
        description="Programs for all ages to deepen your relationship with Christ."
      />

      <div ref={revealRef}>
        <section className="container py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Status Banner */}
              <div className="reveal bg-accent/8 border border-accent/15 rounded-xl p-4 mb-6 flex items-center gap-3">
                <Badge className="bg-accent text-white border-0 text-xs px-2 py-0.5 shrink-0">Open</Badge>
                <div>
                  <p className="font-semibold text-accent-foreground text-sm">CCD Registration for 2026–27 is Now Open!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <Link href="/ccd-registration" className="text-primary hover:underline font-medium">Register online now →</Link> or contact the Religious Education Office.
                  </p>
                </div>
              </div>

              <ProgramAccordion />
            </div>

            {/* Sidebar */}
            <FaithFormationSidebar />
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
