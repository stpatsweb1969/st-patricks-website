/**
 * WorshipToday — /worship/today page.
 * Consolidates Daily Readings, Saint of the Day, and Catholic Resources
 * (previously scattered across the homepage).
 */
import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import { DailyReadings } from "./home/DailyReadings";
import { SaintOfDayCard } from "./home/SaintOfDayCard";
import { CatholicResources } from "./home/CatholicResources";

export default function WorshipToday() {
  return (
    <PageLayout>
      <SEO
        title="Today's Readings & Saint"
        path="/worship/today"
        description="Daily Mass readings, the Saint of the Day, and Catholic resources from USCCB, Vatican News, and FORMED — all in one place."
      />
      <PageHeader
        eyebrow="Worship"
        title="Today's Readings & Saint"
        description="Prepare for Mass with today's Scripture readings, reflect on the Saint of the Day, and explore Catholic resources."
      />

      {/* Daily Readings — Dark Premium Section */}
      <section className="section-dark-green py-8 sm:py-10 -mx-4 px-4 sm:-mx-0 sm:px-0">
        <div className="container">
          <DailyReadings />
        </div>
      </section>

      {/* Saint of the Day */}
      <section className="container py-8 sm:py-10">
        <SaintOfDayCard />
      </section>

      {/* Catholic Resources — Live Feeds by Source */}
      <section className="section-cream py-8 sm:py-10 -mx-4 px-4 sm:-mx-0 sm:px-0">
        <div className="container">
          <CatholicResources />
        </div>
      </section>
    </PageLayout>
  );
}
