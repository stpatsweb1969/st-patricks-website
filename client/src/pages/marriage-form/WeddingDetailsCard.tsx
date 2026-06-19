/**
 * Wedding Details card — dates, guest count, checkboxes, notes.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface WeddingDetailsCardProps {
  form: Record<string, any>;
  updateField: (field: string, value: any) => void;
}

const GUEST_COUNT_OPTIONS = [
  { value: "under-50", label: "Under 50" },
  { value: "50-100", label: "50 - 100" },
  { value: "100-150", label: "100 - 150" },
  { value: "150-200", label: "150 - 200" },
  { value: "200+", label: "200+" },
];

export function WeddingDetailsCard({ form, updateField }: WeddingDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-900">Wedding Details</CardTitle>
        <CardDescription>Scheduling and logistics information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preferredDate">Preferred Wedding Date</Label>
            <Input id="preferredDate" type="date" value={form.preferredDate} onChange={(e) => updateField("preferredDate", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alternateDate">Alternate Date</Label>
            <Input id="alternateDate" type="date" value={form.alternateDate} onChange={(e) => updateField("alternateDate", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="guestCount">Estimated Guest Count</Label>
          <Select onValueChange={(v) => updateField("guestCount", v)} value={form.guestCount}>
            <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
            <SelectContent>
              {GUEST_COUNT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox id="isParishioner" checked={form.isParishioner} onCheckedChange={(v) => updateField("isParishioner", !!v)} />
          <Label htmlFor="isParishioner" className="text-sm leading-relaxed cursor-pointer">
            At least one of us is a registered parishioner of St. Patrick in Armonk
          </Label>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox id="previousMarriage" checked={form.previousMarriage} onCheckedChange={(v) => updateField("previousMarriage", !!v)} />
          <Label htmlFor="previousMarriage" className="text-sm leading-relaxed cursor-pointer">
            Either the bride or groom has been previously married
          </Label>
        </div>
        {form.previousMarriage && (
          <div className="space-y-2 pl-7">
            <Label htmlFor="previousMarriageDetails">Please provide details</Label>
            <Textarea
              id="previousMarriageDetails"
              value={form.previousMarriageDetails}
              onChange={(e) => updateField("previousMarriageDetails", e.target.value)}
              placeholder="Was an annulment obtained? Please provide relevant details."
              rows={3}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes or Questions</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Any special requests, questions, or circumstances..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
