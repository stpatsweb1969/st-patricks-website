/**
 * SacramentPrepWizard — Guided multi-step flow for sacrament preparation.
 * Steps: 1) Choose sacrament → 2) Eligibility check → 3) Next steps / form link
 * 
 * Uses sacramentPolicies as the single source of truth.
 */
import { useState } from "react";
import { DEFAULT_SACRAMENT_POLICIES, type SacramentPolicy } from "@shared/sacramentPolicies";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Droplets, Cross, Heart, Church, HandHeart, Sparkles,
  ArrowRight, ArrowLeft, CheckCircle2, XCircle, Phone
} from "lucide-react";

const SACRAMENT_ICONS: Record<string, React.ReactNode> = {
  "baptism": <Droplets className="w-5 h-5" />,
  "first-communion": <Sparkles className="w-5 h-5" />,
  "confirmation": <Cross className="w-5 h-5" />,
  "marriage": <Heart className="w-5 h-5" />,
  "reconciliation": <HandHeart className="w-5 h-5" />,
  "anointing": <Church className="w-5 h-5" />,
};

const SACRAMENT_FORM_LINKS: Record<string, { label: string; href: string } | null> = {
  "baptism": { label: "Complete Baptism Registration", href: "/baptism-form" },
  "first-communion": null, // registration through CCD
  "confirmation": null, // registration through CCD
  "marriage": { label: "Submit Marriage Inquiry", href: "/marriage-form" },
  "reconciliation": null, // walk-in
  "anointing": null, // by appointment
};

type Step = "choose" | "eligibility" | "result";

export function SacramentPrepWizard() {
  const [step, setStep] = useState<Step>("choose");
  const [selectedSacrament, setSelectedSacrament] = useState<SacramentPolicy | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const handleSelect = (policy: SacramentPolicy) => {
    setSelectedSacrament(policy);
    setCheckedItems(new Set());
    setStep("eligibility");
  };

  const handleCheck = (index: number, checked: boolean) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (checked) next.add(index);
      else next.delete(index);
      return next;
    });
  };

  const allChecked = selectedSacrament 
    ? checkedItems.size === selectedSacrament.eligibility.length 
    : false;

  const reset = () => {
    setStep("choose");
    setSelectedSacrament(null);
    setCheckedItems(new Set());
  };

  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
        <span className={step === "choose" ? "text-primary font-medium" : ""}>
          1. Choose
        </span>
        <ArrowRight className="w-3 h-3" />
        <span className={step === "eligibility" ? "text-primary font-medium" : ""}>
          2. Eligibility
        </span>
        <ArrowRight className="w-3 h-3" />
        <span className={step === "result" ? "text-primary font-medium" : ""}>
          3. Next Steps
        </span>
      </div>

      {/* Step 1: Choose sacrament */}
      {step === "choose" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DEFAULT_SACRAMENT_POLICIES.map(policy => (
            <button
              key={policy.id}
              onClick={() => handleSelect(policy)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 text-center group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                {SACRAMENT_ICONS[policy.id]}
              </div>
              <span className="text-sm font-medium leading-tight">{policy.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Eligibility check */}
      {step === "eligibility" && selectedSacrament && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={reset} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {SACRAMENT_ICONS[selectedSacrament.id]}
            </div>
            <h4 className="font-semibold">{selectedSacrament.name}</h4>
          </div>

          <p className="text-sm text-muted-foreground">
            {selectedSacrament.shortDescription}
          </p>

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Confirm eligibility
            </p>
            {selectedSacrament.eligibility.map((item, i) => (
              <label
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={checkedItems.has(i)}
                  onCheckedChange={(checked) => handleCheck(i, !!checked)}
                  className="mt-0.5"
                />
                <span className="text-sm leading-snug">{item}</span>
              </label>
            ))}
          </div>

          <Button
            onClick={() => setStep("result")}
            disabled={!allChecked}
            className="w-full gap-2"
          >
            {allChecked ? (
              <>Continue <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>Check all items to continue</>
            )}
          </Button>

          {!allChecked && checkedItems.size > 0 && (
            <button
              onClick={() => setStep("result")}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              I don't meet all requirements — what are my options?
            </button>
          )}
        </div>
      )}

      {/* Step 3: Result / Next steps */}
      {step === "result" && selectedSacrament && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setStep("eligibility")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h4 className="font-semibold">{selectedSacrament.name} — Next Steps</h4>
          </div>

          {allChecked ? (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium text-sm">You meet the eligibility requirements</span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Preparation steps
                  </p>
                  <ol className="space-y-1.5">
                    {selectedSacrament.preparation.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-medium text-xs mt-0.5">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  {selectedSacrament.scheduling}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  {SACRAMENT_FORM_LINKS[selectedSacrament.id] && (
                    <a href={SACRAMENT_FORM_LINKS[selectedSacrament.id]!.href}>
                      <Button size="sm" className="gap-2 w-full sm:w-auto">
                        <ArrowRight className="w-3.5 h-3.5" />
                        {SACRAMENT_FORM_LINKS[selectedSacrament.id]!.label}
                      </Button>
                    </a>
                  )}
                  <a href={`tel:${selectedSacrament.contact.value.replace(/[^0-9]/g, "")}`}>
                    <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto">
                      <Phone className="w-3.5 h-3.5" />
                      Call {selectedSacrament.contact.label}
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium text-sm">Some requirements not met</span>
                </div>

                <p className="text-sm text-muted-foreground">
                  Don't worry — there may still be a path forward. The parish office can discuss your situation and help you find the right preparation program.
                </p>

                {selectedSacrament.notes && (
                  <p className="text-sm bg-white/60 rounded-lg p-3 border border-amber-100">
                    {selectedSacrament.notes}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <a href={`tel:${selectedSacrament.contact.value.replace(/[^0-9]/g, "")}`}>
                    <Button size="sm" className="gap-2 w-full sm:w-auto">
                      <Phone className="w-3.5 h-3.5" />
                      Call {selectedSacrament.contact.label}
                    </Button>
                  </a>
                  <a href="/contact">
                    <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto">
                      Contact Us Online
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          <button
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            ← Start over with a different sacrament
          </button>
        </div>
      )}
    </div>
  );
}
