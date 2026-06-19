/**
 * Reusable person info card for bride/groom sections.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonInfoCardProps {
  title: string;
  prefix: string;
  form: Record<string, any>;
  updateField: (field: string, value: any) => void;
  emailRequired?: boolean;
  phoneRequired?: boolean;
}

export function PersonInfoCard({ title, prefix, form, updateField, emailRequired = false, phoneRequired = false }: PersonInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}FirstName`}>First Name *</Label>
            <Input
              id={`${prefix}FirstName`}
              required
              value={form[`${prefix}FirstName`]}
              onChange={(e) => updateField(`${prefix}FirstName`, e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}LastName`}>Last Name *</Label>
            <Input
              id={`${prefix}LastName`}
              required
              value={form[`${prefix}LastName`]}
              onChange={(e) => updateField(`${prefix}LastName`, e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}Email`}>Email {emailRequired ? "*" : ""}</Label>
            <Input
              id={`${prefix}Email`}
              type="email"
              required={emailRequired}
              value={form[`${prefix}Email`]}
              onChange={(e) => updateField(`${prefix}Email`, e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}Phone`}>Phone {phoneRequired ? "*" : ""}</Label>
            <Input
              id={`${prefix}Phone`}
              type="tel"
              required={phoneRequired}
              value={form[`${prefix}Phone`]}
              onChange={(e) => updateField(`${prefix}Phone`, e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}Religion`}>Religion</Label>
            <Input
              id={`${prefix}Religion`}
              value={form[`${prefix}Religion`]}
              onChange={(e) => updateField(`${prefix}Religion`, e.target.value)}
              placeholder="e.g., Catholic"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}Parish`}>Current Parish</Label>
            <Input
              id={`${prefix}Parish`}
              value={form[`${prefix}Parish`]}
              onChange={(e) => updateField(`${prefix}Parish`, e.target.value)}
              placeholder="Parish name and city"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
