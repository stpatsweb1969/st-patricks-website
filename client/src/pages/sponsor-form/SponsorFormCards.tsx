/**
 * Sponsor Form sub-cards — Sacrament details and Eligibility confirmation.
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface CardProps {
  form: Record<string, any>;
  updateField: (field: string, value: any) => void;
}

export function SacramentDetailsCard({ form, updateField }: CardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-900">Sacrament Details</CardTitle>
        <CardDescription>Information about the candidate and ceremony</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sacramentType">Sacrament Type *</Label>
            <Select onValueChange={(v) => updateField("sacramentType", v)} value={form.sacramentType}>
              <SelectTrigger><SelectValue placeholder="Select sacrament" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="baptism">Baptism (Godparent)</SelectItem>
                <SelectItem value="confirmation">Confirmation (Sponsor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ceremonyDate">Ceremony Date (if known)</Label>
            <Input id="ceremonyDate" type="date" value={form.ceremonyDate} onChange={(e) => updateField("ceremonyDate", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="candidateName">Candidate's Full Name *</Label>
          <Input id="candidateName" required value={form.candidateName} onChange={(e) => updateField("candidateName", e.target.value)} placeholder="Name of the person being baptized/confirmed" />
        </div>
      </CardContent>
    </Card>
  );
}

export function EligibilityCard({ form, updateField }: CardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-900">Eligibility Confirmation</CardTitle>
        <CardDescription>To serve as a sponsor/godparent, you must meet the following requirements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox id="isBaptized" checked={form.isBaptized} onCheckedChange={(v) => updateField("isBaptized", !!v)} />
          <Label htmlFor="isBaptized" className="text-sm leading-relaxed cursor-pointer">I have been baptized in the Catholic Church</Label>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox id="isConfirmed" checked={form.isConfirmed} onCheckedChange={(v) => updateField("isConfirmed", !!v)} />
          <Label htmlFor="isConfirmed" className="text-sm leading-relaxed cursor-pointer">I have received the Sacrament of Confirmation</Label>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox id="isActiveCatholic" checked={form.isActiveCatholic} onCheckedChange={(v) => updateField("isActiveCatholic", !!v)} />
          <Label htmlFor="isActiveCatholic" className="text-sm leading-relaxed cursor-pointer">I am a practicing Catholic who regularly attends Mass and is in good standing with the Church</Label>
        </div>
        <div className="space-y-2 pt-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea id="notes" value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Any additional information..." rows={3} />
        </div>
      </CardContent>
    </Card>
  );
}
