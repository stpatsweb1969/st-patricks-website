/**
 * Sponsor Certificate Form — Thin composition importing from sponsor-form/.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { SacramentDetailsCard, EligibilityCard } from "./sponsor-form/SponsorFormCards";

export default function SponsorForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    sponsorFirstName: "", sponsorLastName: "", sponsorEmail: "", sponsorPhone: "",
    sponsorAddress: "", sponsorParish: "", sponsorParishCity: "",
    sacramentType: "" as "baptism" | "confirmation" | "",
    candidateName: "", ceremonyDate: "",
    isBaptized: false, isConfirmed: false, isActiveCatholic: false, notes: "",
  });

  const submitMutation = trpc.sponsor.submit.useMutation({ onSuccess: () => setSubmitted(true) });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!form.sacramentType) return; submitMutation.mutate({ ...form, sacramentType: form.sacramentType as "baptism" | "confirmation" }); };
  const updateField = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-[oklch(0.98_0.005_160)]">
        <div className="container max-w-2xl py-20">
          <Card className="text-center border-green-200">
            <CardContent className="py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-green-700" /></div>
              <h2 className="font-serif text-3xl text-green-900 mb-4">Certificate Request Submitted</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">Your sponsor certificate request has been received. The parish office will review your eligibility and contact you if additional information is needed.</p>
              <Link href="/"><Button variant="outline" className="border-green-700 text-green-700 hover:bg-green-50"><ArrowLeft className="w-4 h-4 mr-2" />Home</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.005_160)]">
      <div className="bg-green-900 text-white py-8 sm:py-12">
        <div className="container max-w-3xl">
          <Link href="/" className="text-green-300/70 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors"><ArrowLeft className="w-3.5 h-3.5" /> Home</Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-800 rounded-full flex items-center justify-center"><Shield className="w-6 h-6 text-green-200" /></div>
            <h1 className="font-serif text-3xl md:text-4xl">Sponsor Certificate</h1>
          </div>
          <p className="text-green-200 max-w-xl">Complete this form to request a sponsor certificate for a Baptism or Confirmation. This certifies your eligibility to serve as a godparent or sponsor.</p>
        </div>
      </div>

      <div className="container max-w-3xl py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sponsor Information */}
          <Card>
            <CardHeader><CardTitle className="text-green-900">Your Information (Sponsor)</CardTitle><CardDescription>Personal details of the person serving as sponsor/godparent</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="sponsorFirstName">First Name *</Label><Input id="sponsorFirstName" required value={form.sponsorFirstName} onChange={(e) => updateField("sponsorFirstName", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="sponsorLastName">Last Name *</Label><Input id="sponsorLastName" required value={form.sponsorLastName} onChange={(e) => updateField("sponsorLastName", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="sponsorEmail">Email *</Label><Input id="sponsorEmail" type="email" required value={form.sponsorEmail} onChange={(e) => updateField("sponsorEmail", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="sponsorPhone">Phone *</Label><Input id="sponsorPhone" type="tel" required value={form.sponsorPhone} onChange={(e) => updateField("sponsorPhone", e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="sponsorAddress">Home Address *</Label><Input id="sponsorAddress" required value={form.sponsorAddress} onChange={(e) => updateField("sponsorAddress", e.target.value)} placeholder="Street address, city, state, zip" /></div>
            </CardContent>
          </Card>

          {/* Parish Information */}
          <Card>
            <CardHeader><CardTitle className="text-green-900">Your Parish</CardTitle><CardDescription>The parish where you are a registered, active member</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="sponsorParish">Parish Name *</Label><Input id="sponsorParish" required value={form.sponsorParish} onChange={(e) => updateField("sponsorParish", e.target.value)} placeholder="e.g., St. Patrick's Church" /></div>
                <div className="space-y-2"><Label htmlFor="sponsorParishCity">Parish City/State *</Label><Input id="sponsorParishCity" required value={form.sponsorParishCity} onChange={(e) => updateField("sponsorParishCity", e.target.value)} placeholder="e.g., Armonk, NY" /></div>
              </div>
            </CardContent>
          </Card>

          <SacramentDetailsCard form={form} updateField={updateField} />
          <EligibilityCard form={form} updateField={updateField} />

          {/* Submit */}
          <div className="flex items-center justify-between">
            <Link href="/" className="text-green-700 hover:text-green-900 text-sm">← Home</Link>
            <Button type="submit" size="lg" className="bg-green-800 hover:bg-green-900 text-white px-8" disabled={submitMutation.isPending || !form.sacramentType}>
              {submitMutation.isPending ? "Submitting..." : "Submit Certificate Request"}
            </Button>
          </div>

          {submitMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-800">There was an error submitting your request. Please try again or call the parish office.</p></div>
          )}
        </form>
      </div>
    </div>
  );
}
