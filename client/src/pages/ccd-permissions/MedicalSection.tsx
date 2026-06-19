/**
 * Medical, Emergency Contact, and Consent sections for CCD Permissions form.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Shield, FileCheck } from "lucide-react";
import type { CcdPermissionsForm } from "./formDefaults";

interface MedicalSectionProps {
  form: CcdPermissionsForm;
  setForm: (f: CcdPermissionsForm) => void;
}

export function MedicalSection({ form, setForm }: MedicalSectionProps) {
  return (
    <>
      {/* Medical Information */}
      <Card className="reveal border-l-4 border-l-red-500">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Heart className="w-5 h-5 text-red-500" />
            Medical & Allergy Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
          <div>
            <Label htmlFor="allergies">Allergies (food, medication, environmental)</Label>
            <Textarea id="allergies" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="List all known allergies or type 'None'" rows={2} />
          </div>
          <div>
            <Label htmlFor="medications">Current Medications</Label>
            <Textarea id="medications" value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} placeholder="List medications or type 'None'" rows={2} />
          </div>
          <div>
            <Label htmlFor="medicalConditions">Medical Conditions</Label>
            <Textarea id="medicalConditions" value={form.medicalConditions} onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })} placeholder="Asthma, diabetes, seizures, etc. or 'None'" rows={2} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="doctorName">Doctor's Name</Label>
              <Input id="doctorName" value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="doctorPhone">Doctor's Phone</Label>
              <Input id="doctorPhone" type="tel" value={form.doctorPhone} onChange={(e) => setForm({ ...form, doctorPhone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input id="insuranceProvider" value={form.insuranceProvider} onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
              <Input id="insurancePolicyNumber" value={form.insurancePolicyNumber} onChange={(e) => setForm({ ...form, insurancePolicyNumber: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="reveal border-l-4 border-l-orange-500">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Shield className="w-5 h-5 text-orange-500" />
            Emergency Contact (other than parent)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="emergencyName">Name *</Label>
              <Input id="emergencyName" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Phone *</Label>
              <Input id="emergencyPhone" type="tel" value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} required />
            </div>
          </div>
          <div>
            <Label htmlFor="emergencyRelation">Relationship to Child *</Label>
            <Input id="emergencyRelation" value={form.emergencyContactRelation} onChange={(e) => setForm({ ...form, emergencyContactRelation: e.target.value })} placeholder="e.g., Grandparent, Aunt, Family Friend" required />
          </div>
        </CardContent>
      </Card>

      {/* Consents & Signature */}
      <Card className="reveal border-l-4 border-l-purple-500">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileCheck className="w-5 h-5 text-purple-500" />
            Consents & Digital Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <Checkbox id="photoRelease" checked={form.photoReleaseConsent} onCheckedChange={(v) => setForm({ ...form, photoReleaseConsent: v === true })} className="mt-0.5" />
            <Label htmlFor="photoRelease" className="cursor-pointer text-sm leading-relaxed">
              <span className="font-medium">Photo/Video Release:</span> I grant permission for St. Patrick in Armonk to photograph or video my child during CCD activities for use in parish communications, website, and social media.
            </Label>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <Checkbox id="medicalRelease" checked={form.medicalReleaseConsent} onCheckedChange={(v) => setForm({ ...form, medicalReleaseConsent: v === true })} className="mt-0.5" />
            <Label htmlFor="medicalRelease" className="cursor-pointer text-sm leading-relaxed">
              <span className="font-medium">Medical Release (Required):</span> In the event of an emergency, I authorize the CCD staff to seek medical attention for my child. I understand that every effort will be made to contact me first. *
            </Label>
          </div>
          <div className="pt-2 space-y-3">
            <div>
              <Label htmlFor="parentSignature">Parent/Guardian Digital Signature (type full name) *</Label>
              <Input id="parentSignature" value={form.parentSignature} onChange={(e) => setForm({ ...form, parentSignature: e.target.value })} placeholder="Type your full legal name" className="font-serif italic text-lg" required />
            </div>
            <div>
              <Label htmlFor="signatureDate">Date *</Label>
              <Input id="signatureDate" type="date" value={form.signatureDate} onChange={(e) => setForm({ ...form, signatureDate: e.target.value })} required />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
