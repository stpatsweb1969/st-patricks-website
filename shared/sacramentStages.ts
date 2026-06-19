/**
 * Canonical stage mapping for unified sacrament submissions view.
 * Maps per-type raw statuses to a shared stage for cross-type filtering and sorting.
 */

export type SacramentType = "baptism" | "sponsor" | "marriage" | "funeral";
export type SacramentStage = "new" | "contacted" | "scheduled" | "completed" | "declined";

export interface SacramentSubmissionRow {
  id: number;
  type: SacramentType;
  name: string;           // child / sponsor / "Bride & Groom" / deceased
  email: string | null;
  phone: string | null;
  submittedAt: string;    // createdAt (ISO)
  preferredDate: string | null;
  rawStatus: string;      // the per-type status (for display + action logic)
  stage: SacramentStage;  // canonical — for filter/sort
  urgent: boolean;        // funeral && !isPrePlanning
}

/**
 * Maps raw per-type status strings to canonical stages.
 * Unknown statuses fall back to "new" with a console warning.
 */
const RAW_TO_STAGE: Record<string, SacramentStage> = {
  pending: "new",
  contacted: "contacted",
  approved: "scheduled",
  meeting_scheduled: "scheduled",
  scheduled: "scheduled",
  completed: "completed",
  denied: "declined",
};

export function rawStatusToStage(rawStatus: string): SacramentStage {
  const stage = RAW_TO_STAGE[rawStatus];
  if (!stage) {
    console.warn(`[sacramentStages] Unknown raw status "${rawStatus}", defaulting to "new"`);
    return "new";
  }
  return stage;
}

/**
 * Stage display metadata: label, color classes for badges.
 */
export const STAGE_META: Record<SacramentStage, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  contacted: { label: "Contacted", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  scheduled: { label: "Scheduled", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400" },
  declined: { label: "Declined", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

export const TYPE_META: Record<SacramentType, { label: string; className: string }> = {
  baptism: { label: "Baptism", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300" },
  sponsor: { label: "Sponsor", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  marriage: { label: "Marriage", className: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  funeral: { label: "Funeral", className: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300" },
};

/**
 * Declarative actions config per type + rawStatus.
 * Each action defines: label, nextStatus, button variant, and whether to confirm.
 */
export interface SacramentAction {
  label: string;
  nextStatus: string;
  variant: "default" | "outline" | "destructive";
  confirm?: boolean;
}

export const ACTIONS: Record<SacramentType, Record<string, SacramentAction[]>> = {
  baptism: {
    pending: [
      { label: "Approve", nextStatus: "approved", variant: "default" },
      { label: "Contacted", nextStatus: "contacted", variant: "outline" },
    ],
    contacted: [
      { label: "Approve", nextStatus: "approved", variant: "default" },
    ],
    approved: [
      { label: "Complete", nextStatus: "completed", variant: "outline" },
    ],
  },
  sponsor: {
    pending: [
      { label: "Approve", nextStatus: "approved", variant: "default" },
      { label: "Deny", nextStatus: "denied", variant: "destructive", confirm: true },
    ],
  },
  marriage: {
    pending: [
      { label: "Schedule Meeting", nextStatus: "meeting_scheduled", variant: "default" },
      { label: "Contacted", nextStatus: "contacted", variant: "outline" },
    ],
    contacted: [
      { label: "Schedule Meeting", nextStatus: "meeting_scheduled", variant: "default" },
    ],
    meeting_scheduled: [
      { label: "Complete", nextStatus: "completed", variant: "outline" },
    ],
  },
  funeral: {
    pending: [
      { label: "Schedule", nextStatus: "scheduled", variant: "default" },
      { label: "Contacted", nextStatus: "contacted", variant: "outline" },
    ],
    contacted: [
      { label: "Schedule", nextStatus: "scheduled", variant: "default" },
    ],
    scheduled: [
      { label: "Complete", nextStatus: "completed", variant: "outline" },
    ],
  },
};

/**
 * Stage sort priority (lower = higher priority in default sort).
 */
export const STAGE_SORT_ORDER: Record<SacramentStage, number> = {
  new: 0,
  contacted: 1,
  scheduled: 2,
  completed: 3,
  declined: 4,
};
