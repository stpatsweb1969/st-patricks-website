import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Trash2, Edit, FileText, Upload, Users, Shield } from "lucide-react";

export function CcdPermissionsManager() {
  const { data: permissions, isLoading } = trpc.ccdPermissions.list.useQuery();
  const updateStatus = trpc.ccdPermissions.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">CCD Permission & Release Forms</h3>
        <Badge variant="outline">{permissions?.length || 0} total</Badge>
      </div>
      {(!permissions || permissions.length === 0) ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No CCD permission forms submitted yet.</CardContent></Card>
      ) : (
        permissions.map((perm: any) => (
          <Card key={perm.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{perm.childFirstName} {perm.childLastName}</h4>
                    <Badge variant="outline" className="text-xs">{perm.childGrade}</Badge>
                    <Badge variant={perm.status === "approved" ? "default" : perm.status === "flagged" ? "destructive" : "secondary"} className="text-xs">{perm.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Parent: {perm.parentName} &middot; {perm.parentEmail} &middot; {perm.parentPhone}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {perm.needsBusTransport && <Badge variant="outline" className="text-xs bg-blue-50">🚌 Bus</Badge>}
                    {perm.earlyDismissalAuthorized && <Badge variant="outline" className="text-xs bg-amber-50">⏰ Early Dismissal</Badge>}
                    {perm.photoReleaseConsent && <Badge variant="outline" className="text-xs bg-green-50">📷 Photo OK</Badge>}
                    {perm.medicalReleaseConsent && <Badge variant="outline" className="text-xs bg-red-50">🏥 Medical OK</Badge>}
                    {perm.allergies && perm.allergies !== "None" && perm.allergies !== "none" && <Badge variant="outline" className="text-xs bg-orange-50">⚠️ Allergies</Badge>}
                  </div>
                  {perm.needsBusTransport && (
                    <p className="text-xs text-muted-foreground mt-1">Bus: {perm.busPickupLocation} → {perm.busDropoffLocation}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Emergency: {perm.emergencyContactName} ({perm.emergencyContactPhone})</p>
                  <p className="text-xs text-muted-foreground">Signed: {perm.parentSignature} on {perm.signatureDate}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {perm.status !== "approved" && (
                    <Button size="sm" onClick={() => updateStatus.mutate({ id: perm.id, status: "approved" })}>Approve</Button>
                  )}
                  {perm.status !== "flagged" && (
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus.mutate({ id: perm.id, status: "flagged" })}>Flag</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}


