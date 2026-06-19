/**
 * CCD Permission & Release Form — Thin composition importing from ccd-permissions/.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle, Users, Shield } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import PageLayout from "@/components/PageLayout";
import { INITIAL_FORM_STATE, GRADE_OPTIONS, validateForm } from "./ccd-permissions/formDefaults";
import { TransportSection } from "./ccd-permissions/TransportSection";
import { MedicalSection } from "./ccd-permissions/MedicalSection";

export default function CcdPermissions() {
  const containerRef = useReveal();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM_STATE);

  const submitMutation = trpc.ccdPermissions.submit.useMutation({
    onSuccess: () => { setSubmitted(true); toast.success("Permission form submitted successfully!"); },
    onError: (err: any) => { toast.error(err.message || "Failed to submit form"); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm(form);
    if (error) { toast.error(error); return; }
    submitMutation.mutate(form);
  };

  if (submitted) {
    return (
      <PageLayout>
        <div className="container py-12 sm:py-16 max-w-2xl mx-auto text-center">
          <div className="bg-primary/5 rounded-2xl p-8 sm:p-12">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">Form Submitted Successfully</h2>
            <p className="text-muted-foreground mb-6">
              Thank you! Your CCD Permission & Release form has been received. The Religious Education office will review it and contact you if any additional information is needed.
            </p>
            <Button onClick={() => { setSubmitted(false); setForm({ ...form, childFirstName: "", childLastName: "", childGrade: "" }); }}>
              Submit Another Form
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div ref={containerRef}>
        {/* Header */}
        <section className="relative py-8 sm:py-12 md:py-16 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <div className="container">
            <Badge variant="outline" className="mb-3 text-xs">2026–2027 School Year</Badge>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-3">
              CCD Permission & Release Form
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              Complete this digital form for each child enrolled in Religious Education. Covers transportation, dismissal, medical, and photo release authorizations.
            </p>
          </div>
        </section>

        <section className="container py-6 sm:py-10 max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

            {/* Child Information */}
            <Card className="reveal border-l-4 border-l-primary">
              <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Users className="w-5 h-5 text-primary" /> Child Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label htmlFor="childFirstName">First Name *</Label><Input id="childFirstName" value={form.childFirstName} onChange={(e) => setForm({ ...form, childFirstName: e.target.value })} required /></div>
                  <div><Label htmlFor="childLastName">Last Name *</Label><Input id="childLastName" value={form.childLastName} onChange={(e) => setForm({ ...form, childLastName: e.target.value })} required /></div>
                </div>
                <div>
                  <Label htmlFor="childGrade">Grade (Fall 2026) *</Label>
                  <Select value={form.childGrade} onValueChange={(v) => setForm({ ...form, childGrade: v })}>
                    <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                    <SelectContent>
                      {GRADE_OPTIONS.map(g => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label htmlFor="parentName">Parent/Guardian Name *</Label><Input id="parentName" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} required /></div>
                  <div><Label htmlFor="parentEmail">Email *</Label><Input id="parentEmail" type="email" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} required /></div>
                </div>
                <div><Label htmlFor="parentPhone">Phone *</Label><Input id="parentPhone" type="tel" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} required /></div>
              </CardContent>
            </Card>

            <TransportSection form={form} setForm={setForm} />

            {/* Authorized Pickup */}
            <Card className="reveal border-l-4 border-l-green-600">
              <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Shield className="w-5 h-5 text-green-600" /> Authorized Pickup Persons
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Only listed persons may pick up your child. At least one is required.</p>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-foreground">Person 1 (Required)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input placeholder="Full Name *" value={form.authorizedPickup1Name} onChange={(e) => setForm({ ...form, authorizedPickup1Name: e.target.value })} required />
                    <Input placeholder="Phone *" type="tel" value={form.authorizedPickup1Phone} onChange={(e) => setForm({ ...form, authorizedPickup1Phone: e.target.value })} required />
                    <Input placeholder="Relationship *" value={form.authorizedPickup1Relation} onChange={(e) => setForm({ ...form, authorizedPickup1Relation: e.target.value })} required />
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Person 2 (Optional)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input placeholder="Full Name" value={form.authorizedPickup2Name} onChange={(e) => setForm({ ...form, authorizedPickup2Name: e.target.value })} />
                    <Input placeholder="Phone" type="tel" value={form.authorizedPickup2Phone} onChange={(e) => setForm({ ...form, authorizedPickup2Phone: e.target.value })} />
                    <Input placeholder="Relationship" value={form.authorizedPickup2Relation} onChange={(e) => setForm({ ...form, authorizedPickup2Relation: e.target.value })} />
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Person 3 (Optional)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input placeholder="Full Name" value={form.authorizedPickup3Name} onChange={(e) => setForm({ ...form, authorizedPickup3Name: e.target.value })} />
                    <Input placeholder="Phone" type="tel" value={form.authorizedPickup3Phone} onChange={(e) => setForm({ ...form, authorizedPickup3Phone: e.target.value })} />
                    <Input placeholder="Relationship" value={form.authorizedPickup3Relation} onChange={(e) => setForm({ ...form, authorizedPickup3Relation: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <MedicalSection form={form} setForm={setForm} />

            {/* Submit */}
            <div className="reveal pt-2">
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "Submitting..." : "Submit Permission Form"}
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                By submitting this form, you confirm that all information provided is accurate. The parish office will be notified of your submission.
              </p>
            </div>
          </form>
        </section>
      </div>
    </PageLayout>
  );
}
