/**
 * CCD Permissions form defaults and validation helpers.
 */

export const INITIAL_FORM_STATE = {
  childFirstName: "",
  childLastName: "",
  childGrade: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  needsBusTransport: false,
  busPickupLocation: "",
  busDropoffLocation: "",
  busNotes: "",
  earlyDismissalAuthorized: false,
  earlyDismissalReason: "",
  earlyDismissalDates: "",
  authorizedPickup1Name: "",
  authorizedPickup1Phone: "",
  authorizedPickup1Relation: "",
  authorizedPickup2Name: "",
  authorizedPickup2Phone: "",
  authorizedPickup2Relation: "",
  authorizedPickup3Name: "",
  authorizedPickup3Phone: "",
  authorizedPickup3Relation: "",
  allergies: "",
  medications: "",
  medicalConditions: "",
  doctorName: "",
  doctorPhone: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
  photoReleaseConsent: false,
  medicalReleaseConsent: false,
  parentSignature: "",
  signatureDate: new Date().toISOString().split("T")[0],
  schoolYear: "2026-2027",
};

export type CcdPermissionsForm = typeof INITIAL_FORM_STATE;

export const GRADE_OPTIONS = [
  "1st Grade", "2nd Grade", "3rd Grade", "4th Grade",
  "5th Grade", "6th Grade", "7th Grade", "8th Grade",
];

export function validateForm(form: CcdPermissionsForm): string | null {
  if (!form.childFirstName || !form.childLastName || !form.childGrade || !form.parentName || !form.parentPhone || !form.parentEmail) {
    return "Please fill in all required fields";
  }
  if (!form.authorizedPickup1Name || !form.authorizedPickup1Phone || !form.authorizedPickup1Relation) {
    return "Please fill in all required fields";
  }
  if (!form.emergencyContactName || !form.emergencyContactPhone || !form.emergencyContactRelation) {
    return "Please fill in all required fields";
  }
  if (!form.parentSignature) {
    return "Please fill in all required fields";
  }
  if (!form.medicalReleaseConsent) {
    return "Medical release consent is required";
  }
  return null;
}
