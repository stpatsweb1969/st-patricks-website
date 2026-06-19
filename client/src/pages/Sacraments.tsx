import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trpc } from "@/lib/trpc";
import { Droplets, Cross, Heart, Church, FileText, Download, ExternalLink, Sparkles, Compass } from "lucide-react";
import { SacramentPrepWizard } from "@/components/SacramentPrepWizard";
import { useReveal } from "@/hooks/useReveal";
import PageHeader from "@/components/PageHeader";

function DocumentList({ category }: { category: string }) {
  const { data: docs, isLoading } = trpc.documents.byCategory.useQuery({ category });

  if (isLoading) return <div className="text-sm text-muted-foreground py-2">Loading documents...</div>;
  if (!docs || docs.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        Reference Documents
      </h4>
      <p className="text-xs text-muted-foreground mb-2 italic">These PDFs are available for reference. We recommend using the digital forms above for faster processing.</p>
      <div className="space-y-2">
        {docs.map((doc) => (
          <a
            key={doc.id}
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
          >
            <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{doc.title}</p>
              {doc.description && <p className="text-xs text-muted-foreground line-clamp-2">{doc.description}</p>}
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}

const sacraments = [
  {
    id: "baptism",
    icon: Droplets,
    title: "Baptism",
    subtitle: "The gateway to life in the Spirit",
    accent: "border-l-[oklch(0.54_0.12_160)]",
    badge: null,
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Baptism is the first sacrament of initiation into the Catholic Church. Through Baptism, we are freed from sin and reborn as children of God. At St. Patrick in Armonk, Baptisms are celebrated on select Sundays after the late Sunday Mass.
        </p>
        <h4 className="font-semibold text-foreground mb-2">Requirements</h4>
        <ul className="space-y-1.5 text-sm text-muted-foreground mb-4 ml-4">
          <li className="flex gap-2"><span className="text-primary">•</span>Parents must be registered parishioners of St. Patrick in Armonk</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Parents must attend a Baptism preparation class (held monthly)</li>
          <li className="flex gap-2"><span className="text-primary">•</span>At least one godparent must be a confirmed, practicing Catholic</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Complete the Baptismal Registration Form</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Provide a copy of the child's birth certificate</li>
        </ul>
        <h4 className="font-semibold text-foreground mb-2">How to Schedule</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Contact the parish office at <a href="tel:9142739724" className="text-primary hover:underline">(914) 273-9724</a> to schedule your child's Baptism. Please call at least two months in advance.
        </p>
        <h4 className="font-semibold text-foreground mb-2">Adult Baptism</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Adults seeking Baptism are welcomed through our <a href="/faith-formation" className="text-primary hover:underline">RCIA program</a> (Rite of Christian Initiation of Adults). RCIA prepares unbaptized adults to receive Baptism, Confirmation, and First Eucharist at the Easter Vigil. Contact the parish office or see our Faith Formation page for details.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="/baptism-form"><Button size="sm" className="gap-2"><FileText className="w-3.5 h-3.5" /> Register for Baptism</Button></a>
          <a href="/sponsor-form"><Button size="sm" variant="outline" className="gap-2"><FileText className="w-3.5 h-3.5" /> Sponsor Certificate</Button></a>
        </div>
        <DocumentList category="baptism" />
      </>
    ),
  },
  {
    id: "first-communion",
    icon: Sparkles,
    title: "First Communion",
    subtitle: "Receiving the Body and Blood of Christ",
    accent: "border-l-[oklch(0.6_0.18_60)]",
    badge: "2nd Grade",
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-4">
          First Holy Communion is one of the most joyful milestones in a child's faith journey. At St. Patrick in Armonk, children typically receive their First Communion in the spring of 2nd grade, after completing sacramental preparation through our CCD program.
        </p>
        <h4 className="font-semibold text-foreground mb-2">Preparation Requirements</h4>
        <ul className="space-y-1.5 text-sm text-muted-foreground mb-4 ml-4">
          <li className="flex gap-2"><span className="text-primary">&bull;</span>Child must be enrolled in 2nd grade CCD (Religious Education)</li>
          <li className="flex gap-2"><span className="text-primary">&bull;</span>Child must have received the Sacrament of Baptism</li>
          <li className="flex gap-2"><span className="text-primary">&bull;</span>Child will receive First Reconciliation before First Communion</li>
          <li className="flex gap-2"><span className="text-primary">&bull;</span>Parent participation in preparation meetings is required</li>
          <li className="flex gap-2"><span className="text-primary">&bull;</span>Regular attendance at Sunday Mass throughout the preparation year</li>
        </ul>
        <h4 className="font-semibold text-foreground mb-2">Timeline</h4>
        <ul className="space-y-2 text-sm text-muted-foreground mb-4 ml-4">
          <li><span className="text-primary">&bull;</span> <strong>Sep:</strong> CCD classes begin (register by Aug)</li>
          <li><span className="text-primary">&bull;</span> <strong>Jan–Feb:</strong> First Reconciliation</li>
          <li><span className="text-primary">&bull;</span> <strong>Apr–May:</strong> First Communion Mass</li>
        </ul>
        <h4 className="font-semibold text-foreground mb-2">How to Sign Up</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Register your child for 2nd grade CCD through our online registration form. First Communion preparation is included as part of the 2nd grade curriculum. For questions, contact the Religious Education Office at <a href="mailto:reled@stpatrickinarmonk.org" className="text-primary hover:underline">reled@stpatrickinarmonk.org</a> or <a href="tel:9145311759" className="text-primary hover:underline">(914) 531-1759</a>.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="/ccd-registration"><Button size="sm" className="gap-2"><FileText className="w-3.5 h-3.5" /> Register for 2nd Grade CCD</Button></a>
          <a href="/calendar?filter=ccd"><Button size="sm" variant="outline" className="gap-2"><Sparkles className="w-3.5 h-3.5" /> View CCD Calendar</Button></a>
        </div>
        <DocumentList category="first-communion" />
      </>
    ),
  },
  {
    id: "confirmation",
    icon: Cross,
    title: "Confirmation",
    subtitle: "Sealed with the gift of the Holy Spirit",
    accent: "border-l-[oklch(0.75_0.15_85)]",
    badge: "8th Grade",
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Confirmation completes the grace of Baptism and strengthens us to be witnesses of Christ. At St. Patrick in Armonk, Confirmation preparation is part of our 8th-grade CCD program, though older teens and adults may also prepare.
        </p>
        <h4 className="font-semibold text-foreground mb-2">Preparation Program</h4>
        <ul className="space-y-1.5 text-sm text-muted-foreground mb-4 ml-4">
          <li className="flex gap-2"><span className="text-primary">•</span>Two-year preparation through CCD (7th and 8th grade)</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Community service hours requirement</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Selection of a Confirmation name (a saint's name)</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Selection of a sponsor who is a confirmed, practicing Catholic</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Retreat experience and interview with a priest or deacon</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Confirmation is typically celebrated in the spring. Check the <a href="/calendar?filter=ccd" className="text-primary hover:underline">CCD Calendar</a> for the latest schedule.
        </p>
        <h4 className="font-semibold text-foreground mb-2">Adult Confirmation</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Adults who were baptized Catholic but never confirmed may prepare for Confirmation through our <a href="/faith-formation" className="text-primary hover:underline">RCIA program</a> or through individual preparation with a priest. Contact the parish office at <a href="tel:9142739724" className="text-primary hover:underline">(914) 273-9724</a> to discuss your situation — we will find the right path for you.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="/sponsor-form"><Button size="sm" className="gap-2"><FileText className="w-3.5 h-3.5" /> Sponsor Certificate Form</Button></a>
        </div>
        <DocumentList category="confirmation" />
      </>
    ),
  },
  {
    id: "marriage",
    icon: Heart,
    title: "Marriage",
    subtitle: "A covenant of love and fidelity",
    accent: "border-l-[oklch(0.55_0.15_25)]",
    badge: "6 Months Advance",
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Sacrament of Marriage is a covenant between a man and a woman, blessed by God. St. Patrick in Armonk is a beautiful setting for your wedding celebration.
        </p>
        <h4 className="font-semibold text-foreground mb-2">For Parishioners</h4>
        <ul className="space-y-1.5 text-sm text-muted-foreground mb-4 ml-4">
          <li className="flex gap-2"><span className="text-primary">•</span>Contact the parish office at least six months before your desired date</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Meet with the priest or deacon for marriage preparation</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Complete the Pre-Cana or Engaged Encounter program</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Provide baptismal certificates (issued within the last six months)</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Obtain a civil marriage license</li>
        </ul>
        <h4 className="font-semibold text-foreground mb-2">For Non-Parishioners</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Non-parishioners may request to be married at St. Patrick in Armonk. Additional guidelines and fees apply. Please contact the parish office for details.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="/marriage-form"><Button size="sm" className="gap-2"><Heart className="w-3.5 h-3.5" /> Marriage Inquiry Form</Button></a>
        </div>
        <DocumentList category="marriage" />
      </>
    ),
  },
  {
    id: "funeral",
    icon: Church,
    title: "Funerals",
    subtitle: "Commending our loved ones to God",
    accent: "border-l-[oklch(0.5_0.12_250)]",
    badge: null,
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Church's funeral liturgy offers worship, praise, and thanksgiving to God for the gift of life. At St. Patrick in Armonk, we walk with families through their time of grief with compassion and prayer.
        </p>
        <h4 className="font-semibold text-foreground mb-2">Funeral Arrangements</h4>
        <ul className="space-y-1.5 text-sm text-muted-foreground mb-4 ml-4">
          <li className="flex gap-2"><span className="text-primary">•</span>Contact the parish office as soon as possible after a death</li>
          <li className="flex gap-2"><span className="text-primary">•</span>The priest will meet with the family to plan the liturgy</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Options include a Funeral Mass, memorial Mass, or graveside service</li>
          <li className="flex gap-2"><span className="text-primary">•</span>Music ministry is available for the liturgy</li>
          <li className="flex gap-2"><span className="text-primary">•</span>The parish bereavement ministry can assist with receptions</li>
        </ul>
        <h4 className="font-semibold text-foreground mb-2">Pre-Planning</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          We encourage parishioners to pre-plan their funeral liturgy. The Funeral Preparation Form allows you to select readings, hymns, and other preferences in advance.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="/funeral-form"><Button size="sm" className="gap-2"><Church className="w-3.5 h-3.5" /> Funeral Pre-Planning Form</Button></a>
        </div>
        <DocumentList category="funeral" />
      </>
    ),
  },
];

export default function Sacraments() {
  const revealRef = useReveal();

  return (
    <PageLayout>
      <SEO
        title="Sacraments"
        path="/sacraments"
        description="Sacrament preparation at St. Patrick Church — Baptism, First Communion, Confirmation, Marriage, Anointing of the Sick, and Reconciliation."
      />
      {/* Page Header — refined */}
      <PageHeader
        eyebrow="Sacred Rites"
        title="Sacraments"
        description="The seven sacraments are the foundation of Catholic life."
      />


      <div ref={revealRef}>
        {/* Guided Prep Wizard */}
        <section className="py-6 sm:py-8">
          <div className="container max-w-4xl">
            <Card className="p-5 sm:p-6 border border-primary/20 bg-primary/[0.02] rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Compass className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-semibold">Start Your Sacrament Journey</h3>
                  <p className="text-xs text-muted-foreground">Check eligibility and find your next steps</p>
                </div>
              </div>
              <SacramentPrepWizard />
            </Card>
          </div>
        </section>

        <section className="py-6 sm:py-10">
          <div className="container max-w-4xl">
            {/* Accordion for Sacraments */}
            <Accordion type="single" collapsible className="space-y-2.5">
              {sacraments.map((sac) => (
                <AccordionItem
                  key={sac.id}
                  value={sac.id}
                  className={`reveal border border-border/50 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] border-l-3 ${sac.accent}`}
                >
                  <AccordionTrigger className="px-4 sm:px-5 py-3.5 sm:py-4 hover:no-underline">
                    <div className="flex items-center gap-3 sm:gap-3.5">
                      <div className="bg-primary/8 p-2 sm:p-2.5 rounded-lg shrink-0">
                        <sac.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="font-serif text-sm sm:text-lg font-semibold text-foreground">{sac.title}</span>
                          {sac.badge && (
                            <Badge className="bg-accent/10 text-accent-foreground border-0 text-xs px-1.5 py-0 shrink-0">{sac.badge}</Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">{sac.subtitle}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 sm:px-5 pb-4 sm:pb-5">
                    {sac.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Mass Intention CTA */}
            <Card className="mt-8 p-5 border border-primary/20 bg-primary/[0.02] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground">Request a Mass Intention</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Honor a loved one — living or deceased — with a Mass offered in their name.</p>
                </div>
                <Button variant="default" size="sm" className="rounded-full shrink-0" asChild>
                  <a href="/mass-intention">Request</a>
                </Button>
              </div>
            </Card>

            {/* Additional Info Cards */}
            <div className="mt-10 grid md:grid-cols-2 gap-4">
              <Card className="p-5 border border-border/50 border-l-3 border-l-[oklch(0.54_0.12_160)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-xl">
                <div className="flex items-center gap-2 mb-2.5">
                  <h3 className="font-serif text-base text-foreground">Reconciliation</h3>
                  <Badge className="bg-primary/8 text-primary border-0 text-xs px-1.5 py-0">Weekly</Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3.5">
                  The Sacrament of Reconciliation is available every Saturday afternoon before Vigil Mass, or by appointment with a priest. See Mass Times for current schedule.
                </p>
                <Button variant="outline" size="sm" className="rounded-full" asChild>
                  <a href="/mass-times">View Full Schedule</a>
                </Button>
              </Card>
              <Card className="p-5 border border-border/50 border-l-3 border-l-[oklch(0.75_0.15_85)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-xl">
                <div className="flex items-center gap-2 mb-2.5">
                  <h3 className="font-serif text-base text-foreground">Anointing of the Sick</h3>
                  <Badge className="bg-accent/10 text-accent-foreground border-0 text-xs px-1.5 py-0">By Request</Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3.5">
                  If you or a loved one is seriously ill, hospitalized, or preparing for surgery, please contact the parish office to arrange for the Sacrament of the Anointing of the Sick.
                </p>
                <Button variant="outline" size="sm" className="rounded-full" asChild>
                  <a href="/contact">Contact Parish Office</a>
                </Button>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
