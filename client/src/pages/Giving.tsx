import PageLayout from "@/components/PageLayout";
import { useParishInfo } from "@/hooks/useParishSchedule";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink, QrCode, CreditCard, Gift, Repeat, DollarSign } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";

const SUGGESTED_AMOUNTS = [10, 25, 50, 100, 250, 500];
const FUND_OPTIONS = [
  { label: "Weekly Offertory", value: "offertory" },
  { label: "Building & Maintenance", value: "maintenance" },
  { label: "Faith Formation", value: "faith-formation" },
  { label: "Outreach & Charity", value: "outreach" },
];

export default function Giving() {
  const revealRef = useReveal();
  const { info } = useParishInfo();
  const parishPhone = info?.phone || "(914) 273-9724";
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [givingType, setGivingType] = useState<"one-time" | "recurring">("one-time");

  // Build WeShare URL with pre-selected amount
  const weshareUrl = "http://stpatrickinarmonk.churchgiving.com/";

  return (
    <PageLayout>
      <SEO
        title="Give — Support Our Parish"
        path="/giving"
        description="Support St. Patrick Church through online giving. Set up one-time or recurring donations via WeShare or Venmo. Your generosity sustains our parish community."
      />
      <PageHeader
        eyebrow="Stewardship"
        title="Give"
        description="Every gift — no matter the size — sustains our parish family and its mission in the community."
      />

      <div ref={revealRef}>
        <section className="container py-6 sm:py-10">
          {/* Quick Give — Hero Card */}
          <Card className="reveal border border-primary/20 shadow-md rounded-xl overflow-hidden mb-6 sm:mb-8">
            <CardContent className="p-5 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold">Quick Give</h2>
                  <p className="text-xs text-muted-foreground">Choose an amount and give in seconds</p>
                </div>
              </div>

              {/* One-time / Recurring toggle */}
              <div className="flex gap-1 p-1 bg-muted rounded-lg mb-5 w-fit">
                <button
                  onClick={() => setGivingType("one-time")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    givingType === "one-time"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  One-time
                </button>
                <button
                  onClick={() => setGivingType("recurring")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    givingType === "recurring"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  Recurring
                </button>
              </div>

              {/* Suggested amounts */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
                {SUGGESTED_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`relative py-3 px-2 rounded-lg border text-center font-semibold transition-all press-scale ${
                      selectedAmount === amount
                        ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30 hover:bg-primary/[0.02] text-foreground"
                    }`}
                  >
                    <span className="text-lg">${amount}</span>
                    {amount === 50 && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1 max-w-[200px]">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="number"
                    placeholder="Other"
                    min="1"
                    className="w-full pl-8 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSelectedAmount(val > 0 ? val : null);
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {givingType === "recurring" ? "per week" : ""}
                </span>
              </div>

              {/* Fund selection */}
              <div className="mb-5">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Designate to</label>
                <div className="flex flex-wrap gap-2">
                  {FUND_OPTIONS.map((fund) => (
                    <span
                      key={fund.value}
                      className="px-3 py-1 rounded-full text-xs border border-border bg-muted/50 text-muted-foreground"
                    >
                      {fund.label}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Select a fund on the WeShare page after clicking below</p>
              </div>

              {/* CTA */}
              <a href={weshareUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full sm:w-auto gap-2 press-scale text-base py-5 px-8" size="lg">
                  <CreditCard className="w-4 h-4" />
                  {selectedAmount
                    ? `Give $${selectedAmount}${givingType === "recurring" ? "/week" : ""} via WeShare`
                    : "Give via WeShare"
                  }
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Button>
              </a>
              <p className="text-xs text-muted-foreground mt-2">
                Secure payment processed by WeShare (LPi). Tax-deductible receipt sent automatically.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Venmo — quick alternative */}
            <Card className="reveal border border-border/50 border-t-3 border-t-accent shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <QrCode className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold">Venmo</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Scan the QR code with your phone camera or Venmo app to send your donation directly.
                </p>
                <div className="bg-secondary/50 rounded-lg p-4 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-lg shadow-sm border">
                    <img
                      src="/manus-storage/venmo-qr_0815b899.png"
                      alt="Venmo QR Code for St. Patrick in Armonk"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2.5 text-center">
                    Scan with your phone camera or Venmo app
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Other Ways to Give */}
            <Card className="reveal border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Gift className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold">Other Ways</h2>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">●</span>
                    <span><strong className="text-foreground">Envelopes</strong> — Contact the parish office at{" "}
                      <a href={`tel:${parishPhone.replace(/[^\d+]/g, "")}`} className="font-semibold text-primary hover:underline">{parishPhone}</a>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">●</span>
                    <span><strong className="text-foreground">Stock / Securities</strong> — Tax-advantaged giving; contact the office for transfer instructions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">●</span>
                    <span><strong className="text-foreground">Estate / Planned Giving</strong> — Include St. Patrick's in your will or trust</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">●</span>
                    <span><strong className="text-foreground">Amazon Smile</strong> — Select St. Patrick's as your charity when shopping</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Cardinals Appeal */}
          <Card className="reveal mt-5 sm:mt-8 border border-border/50 border-t-3 border-t-[#c41e3a] shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex flex-col items-center sm:items-start flex-1">
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#c41e3a] mb-2">2026 Cardinal's Appeal</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-center sm:text-left">
                    The Cardinal's Appeal funds the educational, charitable, and pastoral outreach of our Archdiocese, making Christ known to the world.
                  </p>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <div className="bg-white p-2.5 rounded-lg shadow-sm border">
                    <img
                      src="/manus-storage/cardinals_appeal_qr_1b687357.png"
                      alt="2026 Cardinal's Appeal QR Code"
                      className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Scan to donate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageLayout>
  );
}
