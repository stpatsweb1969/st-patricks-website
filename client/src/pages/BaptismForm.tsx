/**
 * Baptism Registration Form — Thin composition importing from baptism-form/.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Phone, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { ParentInfoCard, GodparentsCard, SchedulingCard } from "./baptism-form/BaptismFormCards";

export default function BaptismForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    childFirstName: "", childLastName: "", childDob: "", childGender: "",
    fatherName: "", motherName: "", parentEmail: "", parentPhone: "",
    address: "", godparentName1: "", godparentName2: "", preferredDate: "", notes: "",
  });

  const submitMutation = trpc.baptism.submit.useMutation({ onSuccess: () => setSubmitted(true) });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); submitMutation.mutate(form); };
  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-[oklch(0.98_0.005_160)]">
        <div className="container max-w-2xl py-20">
          <Card className="text-center border-green-200">
            <CardContent className="py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-green-700" /></div>
              <h2 className="font-serif text-3xl text-green-900 mb-4">Registration Received</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">Thank you for registering your child for Baptism at St. Patrick in Armonk. The parish office will contact you within 3-5 business days to discuss preparation class dates and schedule the ceremony.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                <p className="text-sm text-amber-800"><strong>Next step:</strong> Parents must attend a Baptism preparation class before the ceremony. The office will provide available dates.</p>
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
      <div className="bg-green-900 text-white py-8 sm:py-12">
        <div className="container max-w-3xl">
          <Link href="/" className="text-green-300/70 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors"><ArrowLeft className="w-3.5 h-3.5" /> Home</Link>
          <p className="text-green-300/80 font-bold tracking-[0.2em] uppercase text-xs mb-2">Sacrament</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-2.5">Baptism Registration</h1>
          <p className="text-green-200/80 text-sm max-w-xl">Complete this form to register your child for Baptism at St. Patrick in Armonk. The parish office will contact you to schedule preparation and the ceremony.</p>
        </div>
      </div>

      <div className="container max-w-3xl py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Child Information */}
          <Card>
            <CardHeader><CardTitle className="text-green-900">Child's Information</CardTitle><CardDescription>Details about the child to be baptized</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="childFirstName">First Name *</Label><Input id="childFirstName" required value={form.childFirstName} onChange={(e) => updateField("childFirstName", e.target.value)} placeholder="Child's first name" /></div>
                <div className="space-y-2"><Label htmlFor="childLastName">Last Name *</Label><Input id="childLastName" required value={form.childLastName} onChange={(e) => updateField("childLastName", e.target.value)} placeholder="Child's last name" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="childDob">Date of Birth *</Label><Input id="childDob" type="date" required value={form.childDob} onChange={(e) => updateField("childDob", e.target.value)} /></div>
                <div className="space-y-2">
                  <Label htmlFor="childGender">Gender *</Label>
                  <Select onValueChange={(v) => updateField("childGender", v)} value={form.childGender}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <ParentInfoCard form={form} updateField={updateField} />
          <GodparentsCard form={form} updateField={updateField} />
          <SchedulingCard form={form} updateField={updateField} />

          {/* Requirements */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <h3 className="font-semibold text-green-900 mb-2">Requirements Reminder</h3>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>Parents must be registered parishioners of St. Patrick in Armonk</li>
              <li>Parents must attend a Baptism preparation class (held monthly)</li>
              <li>At least one godparent must be a confirmed, practicing Catholic</li>
              <li>A copy of the child's birth certificate will be required</li>
            </ul>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500"><Phone className="w-4 h-4" /><span>Questions? Call (914) 273-9724</span></div>
            <Button type="submit" size="lg" className="bg-green-800 hover:bg-green-900 text-white px-8" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Submitting..." : "Submit Registration"}
            </Button>
          </div>

          {submitMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-800">There was an error submitting your registration. Please try again or call the parish office.</p></div>
          )}
        </form>
      </div>
    </div>
  );
}
