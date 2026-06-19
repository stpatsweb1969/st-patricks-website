/**
 * Marriage Inquiry Form — Thin composition importing from marriage-form/.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { PersonInfoCard } from "./marriage-form/PersonInfoCard";
import { WeddingDetailsCard } from "./marriage-form/WeddingDetailsCard";

export default function MarriageForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    brideFirstName: "", brideLastName: "", brideEmail: "", bridePhone: "",
    brideReligion: "", brideParish: "",
    groomFirstName: "", groomLastName: "", groomEmail: "", groomPhone: "",
    groomReligion: "", groomParish: "",
    preferredDate: "", alternateDate: "", isParishioner: false,
    previousMarriage: false, previousMarriageDetails: "",
    guestCount: "", notes: "",
  });

  const submitMutation = trpc.marriage.submit.useMutation({ onSuccess: () => setSubmitted(true) });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); submitMutation.mutate(form); };
  const updateField = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-[oklch(0.98_0.005_160)]">
        <div className="container max-w-2xl py-20">
          <Card className="text-center border-green-200">
            <CardContent className="py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-700" />
              </div>
              <h2 className="font-serif text-3xl text-green-900 mb-4">Inquiry Received</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Congratulations on your engagement! The parish office has received your marriage inquiry
                and will contact you within one week to schedule an initial meeting with the priest.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Couples should begin the marriage preparation process
                  at least 6 months before the desired wedding date.
                </p>
              </div>
              <Link href="/"><Button variant="outline" className="border-green-700 text-green-700 hover:bg-green-50"><ArrowLeft className="w-4 h-4 mr-2" />Home</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.005_160)]">
      {/* Header */}
      <div className="bg-green-900 text-white py-8 sm:py-12">
        <div className="container max-w-3xl">
          <Link href="/" className="text-green-300/70 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-800 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-green-200" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl">Marriage Inquiry</h1>
          </div>
          <p className="text-green-200 max-w-xl">
            Begin the process of celebrating your marriage at St. Patrick in Armonk.
            Please submit this inquiry at least 6 months before your desired wedding date.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container max-w-3xl py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <PersonInfoCard title="Bride's Information" prefix="bride" form={form} updateField={updateField} emailRequired phoneRequired />
          <PersonInfoCard title="Groom's Information" prefix="groom" form={form} updateField={updateField} />
          <WeddingDetailsCard form={form} updateField={updateField} />

          {/* Requirements */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <h3 className="font-semibold text-green-900 mb-2">Marriage Preparation Requirements</h3>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>Couples must begin preparation at least 6 months before the wedding</li>
              <li>Pre-Cana or equivalent marriage preparation program is required</li>
              <li>Both parties must be free to marry in the Catholic Church</li>
              <li>Non-parishioner weddings are subject to availability and additional fees</li>
            </ul>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <Link href="/" className="text-green-700 hover:text-green-900 text-sm">← Home</Link>
            <Button type="submit" size="lg" className="bg-green-800 hover:bg-green-900 text-white px-8" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Submitting..." : "Submit Inquiry"}
            </Button>
          </div>

          {submitMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">There was an error submitting your inquiry. Please try again or call the parish office.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
