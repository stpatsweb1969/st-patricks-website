import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { MapPin, Clock, Heart, Users, ArrowRight, Church, BookOpen, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { useParishSchedule } from "@/hooks/useParishSchedule";
import { DEFAULT_PARISH_SCHEDULE } from "../../../shared/scheduleEngine";

function MassScheduleCards() {
  const { schedule } = useParishSchedule();
  const s = schedule ?? DEFAULT_PARISH_SCHEDULE;

  const satVigil = s.services.find(svc => svc.dayOfWeek === 6 && svc.type === "mass");
  const sunMasses = s.services.filter(svc => svc.dayOfWeek === 0 && svc.type === "mass");
  const weekdayMass = s.services.find(svc => svc.dayOfWeek >= 2 && svc.dayOfWeek <= 5 && svc.type === "mass");

  const sunMainTimes = sunMasses.filter(m => !m.seasonal).map(m => m.time.replace(" AM", "").replace(" PM", "")).join(" & ");
  const sunSeasonal = sunMasses.find(m => m.seasonal);

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
      <div className="bg-background rounded-lg p-3 sm:p-4 shadow-sm">
        <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">Sat Vigil</p>
        <p className="font-serif text-base sm:text-xl font-bold text-primary">{satVigil?.time || "5:30 PM"}</p>
      </div>
      <div className="bg-background rounded-lg p-3 sm:p-4 shadow-sm">
        <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">Sunday</p>
        <p className="font-serif text-base sm:text-xl font-bold text-primary">{sunMainTimes}</p>
        {sunSeasonal && (
          <p className="text-xs text-muted-foreground">{sunSeasonal.time.replace(" AM", "").replace(" PM", "")} ({sunSeasonal.seasonal?.note})</p>
        )}
      </div>
      <div className="bg-background rounded-lg p-3 sm:p-4 shadow-sm">
        <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">Tue–Fri</p>
        <p className="font-serif text-base sm:text-xl font-bold text-primary">{weekdayMass?.time || "8:30 AM"}</p>
      </div>
    </div>
  );
}

export default function NewHere() {
  return (
    <PageLayout>
      <SEO
        title="New Here? Welcome!"
        path="/new-here"
        description="Welcome to St. Patrick Church, Armonk! Everything you need to know as a new visitor — Mass times, parking, what to expect, and how to register."
      />
      {/* Page Header — refined */}
      <PageHeader
        eyebrow="Welcome"
        title="Plan Your Visit"
        description="Everything you need to know for your first time at St. Patrick's."
      />


      {/* What to Expect */}
      <section className="container max-w-3xl py-6 sm:py-10">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-4 text-center">
          What to Expect at Mass
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Card className="border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl">
            <CardContent className="p-3.5">
              <div className="flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-0.5">About an Hour</h3>
                  <p className="text-muted-foreground text-sm leading-snug">
                    Readings, homily, prayers, and the Eucharist.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl">
            <CardContent className="p-3.5">
              <div className="flex items-start gap-2.5">
                <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-0.5">Come As You Are</h3>
                  <p className="text-muted-foreground text-sm leading-snug">
                    No dress code. Wear whatever you're comfortable in.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl">
            <CardContent className="p-3.5">
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-0.5">Follow Along</h3>
                  <p className="text-muted-foreground text-sm leading-snug">
                    Missalettes in each pew. Just follow along — no pressure.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl">
            <CardContent className="p-3.5">
              <div className="flex items-start gap-2.5">
                <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-0.5">All Welcome</h3>
                  <p className="text-muted-foreground text-sm leading-snug">
                    Not Catholic? Come forward for a blessing. No judgment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mass Schedule */}
      <section className="bg-muted/30 py-6 sm:py-10">
        <div className="container max-w-3xl">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-4 text-center">
            Mass Schedule
          </h2>
          <MassScheduleCards />
          <div className="text-center mt-3">
            <Link href="/mass-times">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 press-scale text-sm">
                Full schedule & details <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Getting Here — compact */}
      <section className="container max-w-3xl py-6 sm:py-8">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-4 text-center">
          Getting Here
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-base">29 Cox Avenue</p>
                <p className="text-muted-foreground text-sm">Armonk, NY 10504</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Car className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-base">Parking</p>
                <p className="text-muted-foreground text-sm">
                  Free parking in the church lot off Cox Avenue. Street parking also available.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Church className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-base">Accessibility</p>
                <p className="text-muted-foreground text-sm">
                  Wheelchair accessible with ramp entry and accessible seating.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3004.5!2d-73.7143!3d41.1267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2a5c4e5f6a7b8%3A0x9c8d7e6f5a4b3c2d!2s29+Cox+Ave%2C+Armonk%2C+NY+10504!5e0!3m2!1sen!2sus!4v1700000000000"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="St. Patrick in Armonk - 29 Cox Ave, Armonk, NY 10504"
            />
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="bg-primary/[0.04] py-6 sm:py-10">
        <div className="container max-w-3xl text-center">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">
            Ready to Join Our Parish Family?
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
            Register to connect with ministries and stay informed about parish life.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/parish-registration">
              <Button size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 press-scale">
                Register as a Parishioner
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="default" variant="outline" className="font-semibold px-6 press-scale">
                Contact the Office
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
