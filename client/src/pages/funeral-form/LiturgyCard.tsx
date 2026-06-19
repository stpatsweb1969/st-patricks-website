/**
 * Liturgy Preferences and Participants cards for the Funeral Form.
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LiturgyCardProps {
  form: Record<string, any>;
  updateField: (field: string, value: any) => void;
}

export function LiturgyPreferencesCard({ form, updateField }: LiturgyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-900">Liturgy Preferences</CardTitle>
        <CardDescription>These are optional. The parish can provide suggested readings and hymns if you prefer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstReading">First Reading Preference</Label>
          <Input id="firstReading" value={form.firstReading} onChange={(e) => updateField("firstReading", e.target.value)}
            placeholder="e.g., Wisdom 3:1-9 or 'The souls of the just are in the hand of God'" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondReading">Second Reading Preference</Label>
          <Input id="secondReading" value={form.secondReading} onChange={(e) => updateField("secondReading", e.target.value)}
            placeholder="e.g., Romans 8:31-39" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gospel">Gospel Preference</Label>
          <Input id="gospel" value={form.gospel} onChange={(e) => updateField("gospel", e.target.value)}
            placeholder="e.g., John 14:1-6 'In my Father's house there are many rooms'" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hymns">Hymn Preferences</Label>
          <Textarea id="hymns" value={form.hymns} onChange={(e) => updateField("hymns", e.target.value)}
            placeholder="List any preferred hymns (e.g., Amazing Grace, Be Not Afraid, On Eagle's Wings)" rows={3} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ParticipantsCard({ form, updateField }: LiturgyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-900">Participants</CardTitle>
        <CardDescription>People involved in the service</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="eulogist">Eulogist (person giving eulogy)</Label>
          <Input id="eulogist" value={form.eulogist} onChange={(e) => updateField("eulogist", e.target.value)} placeholder="Full name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pallbearers">Pallbearers</Label>
          <Textarea id="pallbearers" value={form.pallbearers} onChange={(e) => updateField("pallbearers", e.target.value)}
            placeholder="List pallbearer names (typically 6), one per line" rows={4} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialRequests">Special Requests or Notes</Label>
          <Textarea id="specialRequests" value={form.specialRequests} onChange={(e) => updateField("specialRequests", e.target.value)}
            placeholder="Any special requests, cultural traditions, or additional information..." rows={4} />
        </div>
      </CardContent>
    </Card>
  );
}
