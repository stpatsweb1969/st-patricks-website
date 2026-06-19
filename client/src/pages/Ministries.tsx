import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Cross, BookOpen, Music, Users, HandHeart, Mail, Clock, MapPin, Calendar, ExternalLink } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import PageHeader from "@/components/PageHeader";

const devotions = [
  { title: "First Fridays", desc: "Exposition of the Blessed Sacrament", time: "9 AM – 7 PM", day: "1st Friday", icon: Cross, color: "emerald" },
  { title: "Thursday Rosary", desc: "Rosary in the Chapel", time: "7:30 PM", day: "Every Thursday", icon: BookOpen, color: "emerald" },
  { title: "Stations of the Cross", desc: "Fridays during Lent", time: "7:30 PM", day: "Lenten Fridays", icon: Cross, color: "purple" },
  { title: "Saturday Stations", desc: "Outside Stations of the Cross", time: "7:30 AM", day: "Every Saturday", icon: Heart, color: "emerald" },
];

const ministries = [
  { title: "Lectors", desc: "Proclaim the Word of God at Mass", icon: BookOpen, contact: "Parish Office", email: "parishoffice@stpatricksarmonk.org" },
  { title: "Eucharistic Ministers", desc: "Assist in distribution of Holy Communion", icon: HandHeart, contact: "Parish Office", email: "parishoffice@stpatricksarmonk.org" },
  { title: "Music Ministry", desc: "Enhance liturgical celebrations through song", icon: Music, contact: "Parish Office", email: "parishoffice@stpatricksarmonk.org" },
  { title: "Altar Servers", desc: "Assist the priest during Mass", icon: Cross, contact: "Parish Office", email: "parishoffice@stpatricksarmonk.org" },
  { title: "Ushers & Greeters", desc: "Welcome parishioners and visitors", icon: Users, contact: "Parish Office", email: "parishoffice@stpatricksarmonk.org" },
];

const outreachPrograms = [
  { title: "Project Embrace", desc: "Collects and distributes clothing and necessities to families in need. Drop-off bins in the vestibule.", contact: "Lori Schiliro", email: "parishoffice@stpatricksarmonk.org" },
  { title: "FIAT (Faith In Action)", desc: "Hands-on service: meal prep for shelters, home repairs, community clean-ups.", contact: "Parish Office", email: "parishoffice@stpatricksarmonk.org" },
  { title: "Share & Care", desc: "Meals, transportation, and support for parishioners facing illness or loss.", contact: "Parish Office", email: "parishoffice@stpatricksarmonk.org" },
  { title: "Stay Connected to the Vine", desc: "Reaching out to homebound parishioners through visits, calls, and cards.", contact: "Parish Office", email: "parishoffice@stpatricksarmonk.org" },
];

export default function Ministries() {
  const revealRef = useReveal();

  return (
    <PageLayout>
      <SEO
        title="Ministries & Devotions"
        path="/ministries"
        description="Parish ministries and devotions at St. Patrick Church — liturgical ministers, prayer groups, community outreach, and service opportunities."
      />
      {/* Page Header — refined */}
      <PageHeader
        eyebrow="Serve & Pray"
        title="Ministries & Devotions"
        description="Three ways to deepen your faith: through prayer, service at the altar, and outreach to those in need."
      />

      <div ref={revealRef} className="container py-6 sm:py-10 space-y-8">

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: DEVOTIONS — Prayer Schedule
            Visual: Dark green background, schedule-like layout with time badges
        ═══════════════════════════════════════════════════════════════ */}
        <section className="reveal rounded-xl overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 p-4 sm:p-6 shadow-lg">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center">
              <Cross className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-emerald-50">Devotions</h2>
              <p className="text-sm text-emerald-300/70">Prayer schedule & spiritual practices</p>
            </div>
          </div>

          <div className="space-y-2">
            {devotions.map((d) => (
              <div key={d.title} className="flex items-center gap-3 bg-emerald-800/30 border border-emerald-700/30 rounded-lg p-3 hover:bg-emerald-800/50 transition-colors">
                <div className="shrink-0 flex flex-col items-center w-16">
                  <span className="text-xs uppercase tracking-wider text-emerald-400/80 font-medium">{d.day.split(" ")[0]}</span>
                  <span className="text-xs text-emerald-200 font-semibold">{d.day.split(" ").slice(1).join(" ") || d.day}</span>
                </div>
                <div className="w-px h-8 bg-emerald-600/40" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-emerald-50">{d.title}</h3>
                  <p className="text-xs text-emerald-300/70 truncate">{d.desc}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-emerald-300">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-medium whitespace-nowrap">{d.time}</span>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://youtu.be/6faWBZxdE0M"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-medium mt-3 hover:text-emerald-200 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Watch Stations of the Cross video
          </a>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: PARISH MINISTRIES — Volunteer Roles
            Visual: Clean white cards with accent icons, email links
        ═══════════════════════════════════════════════════════════════ */}
        <section className="reveal">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">Parish Ministries</h2>
              <p className="text-sm text-muted-foreground">Use your gifts to serve God and our community</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ministries.map((m) => (
              <Card key={m.title} className="reveal border shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <m.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{m.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{m.desc}</p>
                  </div>
                  <a
                    href={`mailto:${m.email}`}
                    className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                    title={`Email ${m.contact}`}
                  >
                    <Mail className="w-3 h-3 text-primary" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-2 ml-1">
            Interested?{" "}
            <a href="mailto:parishoffice@stpatricksarmonk.org" className="text-primary font-medium hover:underline">
              Email the Parish Office
            </a>{" "}
            or call{" "}
            <a href="tel:9142739724" className="text-primary font-medium hover:underline">(914) 273-9724</a>
          </p>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3: CHARITABLE OUTREACH — Service Programs
            Visual: Warm amber/gold accent, left border, expanded descriptions
        ═══════════════════════════════════════════════════════════════ */}
        <section className="reveal rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 p-4 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Heart className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">Charitable Outreach</h2>
              <p className="text-sm text-muted-foreground">Putting our faith into action through service</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {outreachPrograms.map((p) => (
              <div key={p.title} className="bg-white dark:bg-card border-l-3 border-l-amber-400 rounded-lg p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">{p.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.desc}</p>
                  </div>
                  <a
                    href={`mailto:${p.email}`}
                    className="shrink-0 inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-medium hover:underline whitespace-nowrap mt-0.5"
                  >
                    <Mail className="w-3 h-3" />
                    {p.contact}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Card className="reveal bg-primary/[0.04] border border-primary/15 rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-foreground">
              Ready to serve? Contact us at{" "}
              <a href="mailto:parishoffice@stpatricksarmonk.org" className="font-semibold text-primary hover:underline">parishoffice@stpatricksarmonk.org</a>
              {" "}or{" "}
              <a href="tel:9142739724" className="font-semibold text-primary hover:underline">(914) 273-9724</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
