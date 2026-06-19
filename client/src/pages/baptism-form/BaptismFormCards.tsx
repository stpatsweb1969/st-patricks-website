/**
 * Baptism Form sub-cards — Parent info, Godparents, Scheduling.
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";

interface CardProps {
  form: Record<string, any>;
  updateField: (field: string, value: string) => void;
}

export function ParentInfoCard({ form, updateField }: CardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-900">Parent / Guardian Information</CardTitle>
        <CardDescription>Contact information for the parents or guardians</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="fatherName">Father's Full Name</Label><Input id="fatherName" value={form.fatherName} onChange={(e) => updateField("fatherName", e.target.value)} placeholder="Father's full name" /></div>
          <div className="space-y-2"><Label htmlFor="motherName">Mother's Full Name</Label><Input id="motherName" value={form.motherName} onChange={(e) => updateField("motherName", e.target.value)} placeholder="Mother's full name (maiden name)" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="parentEmail">Email Address *</Label><Input id="parentEmail" type="email" required value={form.parentEmail} onChange={(e) => updateField("parentEmail", e.target.value)} placeholder="your@email.com" /></div>
          <div className="space-y-2"><Label htmlFor="parentPhone">Phone Number *</Label><Input id="parentPhone" type="tel" required value={form.parentPhone} onChange={(e) => updateField("parentPhone", e.target.value)} placeholder="(914) 555-0123" /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="address">Home Address *</Label><Input id="address" required value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Street address, city, state, zip" /></div>
      </CardContent>
    </Card>
  );
}

export function GodparentsCard({ form, updateField }: CardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-900">Godparents</CardTitle>
        <CardDescription>At least one godparent must be a confirmed, practicing Catholic. A sponsor certificate is required from their home parish.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="godparentName1">Godparent 1</Label><Input id="godparentName1" value={form.godparentName1} onChange={(e) => updateField("godparentName1", e.target.value)} placeholder="Full name" /></div>
          <div className="space-y-2"><Label htmlFor="godparentName2">Godparent 2</Label><Input id="godparentName2" value={form.godparentName2} onChange={(e) => updateField("godparentName2", e.target.value)} placeholder="Full name" /></div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">Each godparent will need to submit a <Link href="/sponsor-form" className="underline font-medium">Sponsor Certificate</Link> from their home parish.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SchedulingCard({ form, updateField }: CardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-900">Scheduling Preferences</CardTitle>
        <CardDescription>Baptisms are typically celebrated on select Sundays after the late Sunday Mass</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="preferredDate">Preferred Date (if any)</Label>
          <Input id="preferredDate" type="date" value={form.preferredDate} onChange={(e) => updateField("preferredDate", e.target.value)} />
          <p className="text-xs text-gray-500">The office will confirm available dates with you.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea id="notes" value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Any special requests or questions..." rows={3} />
        </div>
      </CardContent>
    </Card>
  );
}
