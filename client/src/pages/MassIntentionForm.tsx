/**
 * Mass Intention Request Form — public page for parishioners to request a Mass intention.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, CheckCircle2, Cross } from "lucide-react";
import { useParishSchedule } from "@/hooks/useParishSchedule";
import { DEFAULT_PARISH_SCHEDULE } from "../../../shared/scheduleEngine";

export default function MassIntentionForm() {
  const { schedule } = useParishSchedule();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    intentionFor: "",
    intentionType: "deceased" as "living" | "deceased" | "thanksgiving" | "special",
    preferredDate: "",
    preferredMass: "",
    notes: "",
  });

  const submitMutation = trpc.massIntentions.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  // Get Mass times for the preferred Mass dropdown
  const massTimes: string[] = [];
  const src = schedule || DEFAULT_PARISH_SCHEDULE;
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const seen = new Set<string>();
  for (const s of src.services) {
    const key = `${s.dayOfWeek}-${s.time}`;
    if (s.type === "mass" && !seen.has(key)) {
      seen.add(key);
      massTimes.push(`${dayNames[s.dayOfWeek]} ${s.time} — ${s.name}`);
    }
  }

  if (submitted) {
    return (
      <div className="container max-w-lg py-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Intention Received</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your Mass intention request. The parish office will review it and
          schedule it for an upcoming Mass. You'll receive a confirmation email once scheduled.
        </p>
        <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ requesterName: "", requesterEmail: "", requesterPhone: "", intentionFor: "", intentionType: "deceased", preferredDate: "", preferredMass: "", notes: "" }); }}>
          Submit Another Intention
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Request a Mass Intention</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Have a Mass offered for a loved one — living or deceased — or for a special intention.
          The suggested offering is $15 per intention.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intention Details</CardTitle>
          <CardDescription>All fields marked with * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              submitMutation.mutate({
                ...form,
                requesterPhone: form.requesterPhone || undefined,
                preferredDate: form.preferredDate || undefined,
                preferredMass: form.preferredMass || undefined,
                notes: form.notes || undefined,
              });
            }}
          >
            {/* Requester Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="requesterName">Your Name *</Label>
                <Input
                  id="requesterName"
                  required
                  value={form.requesterName}
                  onChange={(e) => setForm(f => ({ ...f, requesterName: e.target.value }))}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="requesterEmail">Your Email *</Label>
                <Input
                  id="requesterEmail"
                  type="email"
                  required
                  value={form.requesterEmail}
                  onChange={(e) => setForm(f => ({ ...f, requesterEmail: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="requesterPhone">Phone (optional)</Label>
              <Input
                id="requesterPhone"
                value={form.requesterPhone}
                onChange={(e) => setForm(f => ({ ...f, requesterPhone: e.target.value }))}
                placeholder="(914) 555-1234"
              />
            </div>

            {/* Intention */}
            <div className="space-y-1.5">
              <Label htmlFor="intentionFor">Mass Offered For *</Label>
              <Input
                id="intentionFor"
                required
                value={form.intentionFor}
                onChange={(e) => setForm(f => ({ ...f, intentionFor: e.target.value }))}
                placeholder="Name(s) of person(s)"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="intentionType">Intention Type *</Label>
              <Select value={form.intentionType} onValueChange={(v) => setForm(f => ({ ...f, intentionType: v as typeof form.intentionType }))}>
                <SelectTrigger id="intentionType" aria-label="Intention Type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deceased">For the Deceased</SelectItem>
                  <SelectItem value="living">For the Living</SelectItem>
                  <SelectItem value="thanksgiving">Thanksgiving</SelectItem>
                  <SelectItem value="special">Special Intention</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="preferredDate">Preferred Date (optional)</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => setForm(f => ({ ...f, preferredDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="preferredMass">Preferred Mass (optional)</Label>
                <Select value={form.preferredMass} onValueChange={(v) => setForm(f => ({ ...f, preferredMass: v }))}>
                  <SelectTrigger id="preferredMass" aria-label="Preferred Mass">
                    <SelectValue placeholder="No preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-preference">No preference</SelectItem>
                    {massTimes.map((mt) => (
                      <SelectItem key={mt} value={mt}>{mt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any special requests or additional details..."
                rows={3}
              />
            </div>

            {submitMutation.error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive">Something went wrong</p>
                <p className="text-xs text-destructive/80 mt-1">
                  {submitMutation.error.message || "We couldn't submit your intention. Please try again or call the parish office at (914) 273-9325."}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Mass Intention"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              The parish office will confirm your intention and scheduled Mass date via email.
              Offerings can be made at the rectory or placed in the collection basket.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
