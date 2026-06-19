/**
 * Transport & Dismissal sections for CCD Permissions form.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Bus, Clock } from "lucide-react";
import type { CcdPermissionsForm } from "./formDefaults";

interface TransportSectionProps {
  form: CcdPermissionsForm;
  setForm: (f: CcdPermissionsForm) => void;
}

export function TransportSection({ form, setForm }: TransportSectionProps) {
  return (
    <>
      {/* Bus Transportation */}
      <Card className="reveal border-l-4 border-l-blue-500">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Bus className="w-5 h-5 text-blue-500" />
            Bus Transportation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <Label htmlFor="needsBus" className="cursor-pointer font-medium">My child needs bus transportation to/from CCD</Label>
            <Switch id="needsBus" checked={form.needsBusTransport} onCheckedChange={(v) => setForm({ ...form, needsBusTransport: v })} />
          </div>
          {form.needsBusTransport && (
            <div className="space-y-3 pt-2">
              <div>
                <Label htmlFor="busPickup">Pickup Location</Label>
                <Input id="busPickup" value={form.busPickupLocation} onChange={(e) => setForm({ ...form, busPickupLocation: e.target.value })} placeholder="School name or address" />
              </div>
              <div>
                <Label htmlFor="busDropoff">Dropoff Location</Label>
                <Input id="busDropoff" value={form.busDropoffLocation} onChange={(e) => setForm({ ...form, busDropoffLocation: e.target.value })} placeholder="Home address or other location" />
              </div>
              <div>
                <Label htmlFor="busNotes">Bus Notes (optional)</Label>
                <Textarea id="busNotes" value={form.busNotes} onChange={(e) => setForm({ ...form, busNotes: e.target.value })} placeholder="Any special instructions for bus transportation" rows={2} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Early Dismissal */}
      <Card className="reveal border-l-4 border-l-amber-500">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Clock className="w-5 h-5 text-amber-500" />
            Early Dismissal Authorization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <Label htmlFor="earlyDismissal" className="cursor-pointer font-medium">My child may need early dismissal from CCD</Label>
            <Switch id="earlyDismissal" checked={form.earlyDismissalAuthorized} onCheckedChange={(v) => setForm({ ...form, earlyDismissalAuthorized: v })} />
          </div>
          {form.earlyDismissalAuthorized && (
            <div className="space-y-3 pt-2">
              <div>
                <Label htmlFor="dismissalReason">Reason</Label>
                <Input id="dismissalReason" value={form.earlyDismissalReason} onChange={(e) => setForm({ ...form, earlyDismissalReason: e.target.value })} placeholder="e.g., Sports practice, medical appointment" />
              </div>
              <div>
                <Label htmlFor="dismissalDates">Specific Dates (if known)</Label>
                <Textarea id="dismissalDates" value={form.earlyDismissalDates} onChange={(e) => setForm({ ...form, earlyDismissalDates: e.target.value })} placeholder="List dates or recurring schedule (e.g., every other Wednesday)" rows={2} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
