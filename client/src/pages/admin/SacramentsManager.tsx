import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminTableControls, type SortConfig } from "@/components/AdminTableControls";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown, ChevronUp, AlertTriangle, Mail, Phone, Bell, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { exportCsv, type CsvColumn } from "@/lib/exportCsv";
import type {
  SacramentType,
  SacramentStage,
  SacramentSubmissionRow,
  SacramentAction,
} from "../../../../shared/sacramentStages";
import {
  STAGE_META,
  TYPE_META,
  ACTIONS,
  STAGE_SORT_ORDER,
} from "../../../../shared/sacramentStages";

/**
 * Unified Sacraments Manager — L99 spec.
 * One table for all 4 sacrament submission types with shared stage mapping,
 * type-aware actions, urgency flags, and sortable/filterable controls.
 */
export function SacramentsManager() {
  const { data: submissions, isLoading, error } = trpc.sacraments.allSubmissions.useQuery();
  const utils = trpc.useUtils();

  // Per-type update mutations
  const baptismUpdate = trpc.baptism.updateStatus.useMutation({
    onSuccess: () => { utils.sacraments.allSubmissions.invalidate(); utils.baptism.list.invalidate(); toast.success("Status updated"); },
  });
  const sponsorUpdate = trpc.sponsor.updateStatus.useMutation({
    onSuccess: () => { utils.sacraments.allSubmissions.invalidate(); utils.sponsor.list.invalidate(); toast.success("Status updated"); },
  });
  const marriageUpdate = trpc.marriage.updateStatus.useMutation({
    onSuccess: () => { utils.sacraments.allSubmissions.invalidate(); utils.marriage.list.invalidate(); toast.success("Status updated"); },
  });
  const funeralUpdate = trpc.funeral.updateStatus.useMutation({
    onSuccess: () => { utils.sacraments.allSubmissions.invalidate(); utils.funeral.list.invalidate(); toast.success("Status updated"); },
  });

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<{
    row: SacramentSubmissionRow;
    action: SacramentAction;
  } | null>(null);

  // Notify checkbox state (per-action)
  const [notifyFamily, setNotifyFamily] = useState(true);

  // Expanded row state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAction = useCallback((row: SacramentSubmissionRow, action: SacramentAction) => {
    // Determine default notify state based on status type
    const milestoneStatuses = ["approved", "scheduled", "meeting_scheduled", "denied", "declined"];
    const defaultNotify = milestoneStatuses.includes(action.nextStatus);
    setNotifyFamily(defaultNotify);

    if (action.confirm) {
      setConfirmAction({ row, action });
      return;
    }
    // For non-confirm actions, show confirm dialog too (to allow notify toggle)
    setConfirmAction({ row, action });
  }, []);

  const executeAction = useCallback((row: SacramentSubmissionRow, nextStatus: string, notify: boolean) => {
    const payload = { id: row.id, status: nextStatus, notify };
    switch (row.type) {
      case "baptism": baptismUpdate.mutate(payload); break;
      case "sponsor": sponsorUpdate.mutate(payload); break;
      case "marriage": marriageUpdate.mutate(payload); break;
      case "funeral": funeralUpdate.mutate(payload); break;
    }
  }, [baptismUpdate, sponsorUpdate, marriageUpdate, funeralUpdate]);

  // Compute filter counts
  const typeCounts = useMemo(() => {
    if (!submissions) return {};
    const counts: Record<string, number> = {};
    submissions.forEach((s) => { counts[s.type] = (counts[s.type] || 0) + 1; });
    return counts;
  }, [submissions]);

  const stageCounts = useMemo(() => {
    if (!submissions) return {};
    const counts: Record<string, number> = {};
    submissions.forEach((s) => { counts[s.stage] = (counts[s.stage] || 0) + 1; });
    return counts;
  }, [submissions]);

  // Sort configurations
  const sorts: SortConfig<SacramentSubmissionRow>[] = useMemo(() => [
    {
      key: "submitted",
      label: "Submitted",
      compareFn: (a, b, dir) => {
        // Urgent always first
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        const diff = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        return dir === "asc" ? diff : -diff;
      },
    },
    {
      key: "preferredDate",
      label: "Preferred Date",
      compareFn: (a, b, dir) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        const dateA = a.preferredDate ? new Date(a.preferredDate).getTime() : 0;
        const dateB = b.preferredDate ? new Date(b.preferredDate).getTime() : 0;
        const diff = dateA - dateB;
        return dir === "asc" ? diff : -diff;
      },
    },
    {
      key: "name",
      label: "Name",
      compareFn: (a, b, dir) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        const diff = a.name.localeCompare(b.name);
        return dir === "asc" ? diff : -diff;
      },
    },
    {
      key: "stage",
      label: "Stage",
      compareFn: (a, b, dir) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        const diff = STAGE_SORT_ORDER[a.stage] - STAGE_SORT_ORDER[b.stage];
        return dir === "asc" ? diff : -diff;
      },
    },
  ], []);

  // Error state
  if (error) {
    return (
      <Card className="p-8 text-center border-destructive">
        <p className="text-destructive font-medium mb-2">Failed to load submissions</p>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button variant="outline" onClick={() => utils.sacraments.allSubmissions.invalidate()}>
          Retry
        </Button>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const items = submissions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Sacrament Submissions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            All baptism, sponsor, marriage, and funeral submissions in one view.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => {
            const cols: CsvColumn<SacramentSubmissionRow>[] = [
              { header: "Type", accessor: (r) => TYPE_META[r.type].label },
              { header: "Name", accessor: (r) => r.name },
              { header: "Email", accessor: (r) => r.email },
              { header: "Phone", accessor: (r) => r.phone },
              { header: "Submitted", accessor: (r) => new Date(r.submittedAt).toLocaleDateString() },
              { header: "Preferred Date", accessor: (r) => r.preferredDate },
              { header: "Stage", accessor: (r) => STAGE_META[r.stage].label },
            ];
            const today = new Date().toISOString().slice(0, 10);
            exportCsv(items, cols, `sacraments-${today}.csv`);
            toast.success("CSV exported");
          }}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export CSV
        </Button>
      </div>

      <AdminTableControls
        items={items}
        searchFn={(row) => `${row.name} ${row.email || ""} ${row.phone || ""}`}
        searchPlaceholder="Search by name, email, or phone..."
        filters={[
          {
            key: "type",
            label: "Type",
            options: (["baptism", "sponsor", "marriage", "funeral"] as SacramentType[]).map((t) => ({
              value: t,
              label: TYPE_META[t].label,
              count: typeCounts[t] || 0,
            })),
            getItemValue: (row) => row.type,
          },
          {
            key: "stage",
            label: "Stage",
            options: (["new", "contacted", "scheduled", "completed", "declined"] as SacramentStage[]).map((s) => ({
              value: s,
              label: STAGE_META[s].label,
              count: stageCounts[s] || 0,
            })),
            getItemValue: (row) => row.stage,
          },
        ]}
        sorts={sorts}
        defaultSortKey="submitted"
        defaultSortDirection="desc"
        dateRange={{
          label: "Any time",
          options: [
            { value: "any", label: "Any", days: 0 },
            { value: "7d", label: "7 days", days: 7 },
            { value: "30d", label: "30 days", days: 30 },
            { value: "90d", label: "90 days", days: 90 },
          ],
          getItemDate: (row) => row.submittedAt,
        }}
        pageSize={15}
      >
        {(paginatedItems, totalCount) => (
          <>
            {totalCount === 0 && items.length > 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No matches — try adjusting your filters.</p>
              </Card>
            )}
            {totalCount === 0 && items.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No sacrament submissions yet.</p>
              </Card>
            )}

            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium w-8"></th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Submitted</th>
                      <th className="text-left p-3 font-medium">Preferred Date</th>
                      <th className="text-left p-3 font-medium">Stage</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((row) => {
                      const rowKey = `${row.type}-${row.id}`;
                      const isExpanded = expandedId === rowKey;
                      const actions = ACTIONS[row.type]?.[row.rawStatus] || [];
                      return (
                        <TableRow
                          key={rowKey}
                          row={row}
                          rowKey={rowKey}
                          isExpanded={isExpanded}
                          actions={actions}
                          onToggleExpand={() => setExpandedId(isExpanded ? null : rowKey)}
                          onAction={(action) => handleAction(row, action)}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {paginatedItems.map((row) => {
                const rowKey = `${row.type}-${row.id}`;
                const isExpanded = expandedId === rowKey;
                const actions = ACTIONS[row.type]?.[row.rawStatus] || [];
                return (
                  <MobileCard
                    key={rowKey}
                    row={row}
                    rowKey={rowKey}
                    isExpanded={isExpanded}
                    actions={actions}
                    onToggleExpand={() => setExpandedId(isExpanded ? null : rowKey)}
                    onAction={(action) => handleAction(row, action)}
                  />
                );
              })}
            </div>
          </>
        )}
      </AdminTableControls>

      {/* Confirm dialog with Notify checkbox */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action.confirm ? "Confirm Action" : `${confirmAction?.action.label}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action.confirm
                ? <>Are you sure you want to {confirmAction?.action.label.toLowerCase()} the submission from <strong>{confirmAction?.row.name}</strong>? This action cannot be undone.</>
                : <>Update status of <strong>{confirmAction?.row.name}</strong> to "{confirmAction?.action.label}"?</>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Notify the family checkbox */}
          <label className="flex items-center gap-3 px-1 py-2 cursor-pointer select-none">
            <Checkbox
              checked={notifyFamily}
              onCheckedChange={(checked) => setNotifyFamily(!!checked)}
            />
            <div className="flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Notify the family</span>
            </div>
          </label>
          {notifyFamily && (
            <p className="text-xs text-muted-foreground pl-8">An email will be sent to the submitter about this status change.</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction?.action.confirm ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={() => {
                if (confirmAction) {
                  executeAction(confirmAction.row, confirmAction.action.nextStatus, notifyFamily);
                  setConfirmAction(null);
                }
              }}
            >
              {confirmAction?.action.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ===== Desktop Table Row =====
function TableRow({
  row,
  rowKey,
  isExpanded,
  actions,
  onToggleExpand,
  onAction,
}: {
  row: SacramentSubmissionRow;
  rowKey: string;
  isExpanded: boolean;
  actions: SacramentAction[];
  onToggleExpand: () => void;
  onAction: (action: SacramentAction) => void;
}) {
  const stageMeta = STAGE_META[row.stage];
  const typeMeta = TYPE_META[row.type];

  return (
    <>
      <tr
        className={`border-t hover:bg-muted/30 cursor-pointer transition-colors ${
          row.urgent ? "border-l-4 border-l-red-500" : ""
        }`}
        onClick={onToggleExpand}
      >
        <td className="p-3">
          {row.urgent && (
            <AlertTriangle className="w-4 h-4 text-red-500" aria-label="Immediate need" />
          )}
        </td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.name}</span>
            {row.urgent && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">
                Immediate
              </Badge>
            )}
          </div>
        </td>
        <td className="p-3">
          <Badge className={`${typeMeta.className} text-xs`}>{typeMeta.label}</Badge>
        </td>
        <td className="p-3 text-muted-foreground">
          {new Date(row.submittedAt).toLocaleDateString()}
        </td>
        <td className="p-3 text-muted-foreground">
          {row.preferredDate || "—"}
        </td>
        <td className="p-3">
          <Badge className={`${stageMeta.className} text-xs`}>{stageMeta.label}</Badge>
        </td>
        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-1.5 justify-end">
            {actions.map((action) => (
              <Button
                key={action.nextStatus}
                size="sm"
                variant={action.variant}
                className="h-7 text-xs px-2"
                onClick={() => onAction(action)}
              >
                {action.label}
              </Button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={onToggleExpand}
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-t bg-muted/20">
          <td colSpan={7} className="p-4">
            <SubmissionDetail row={row} />
          </td>
        </tr>
      )}
    </>
  );
}

// ===== Mobile Card =====
function MobileCard({
  row,
  rowKey,
  isExpanded,
  actions,
  onToggleExpand,
  onAction,
}: {
  row: SacramentSubmissionRow;
  rowKey: string;
  isExpanded: boolean;
  actions: SacramentAction[];
  onToggleExpand: () => void;
  onAction: (action: SacramentAction) => void;
}) {
  const stageMeta = STAGE_META[row.stage];
  const typeMeta = TYPE_META[row.type];

  return (
    <Card className={`overflow-hidden ${row.urgent ? "border-l-4 border-l-red-500" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2" onClick={onToggleExpand}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {row.urgent && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
              <span className="font-semibold text-sm">{row.name}</span>
              {row.urgent && (
                <Badge className="bg-red-100 text-red-800 text-xs">Immediate</Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <Badge className={`${typeMeta.className} text-xs`}>{typeMeta.label}</Badge>
              <Badge className={`${stageMeta.className} text-xs`}>{stageMeta.label}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {new Date(row.submittedAt).toLocaleDateString()}
              {row.preferredDate && ` · Preferred: ${row.preferredDate}`}
            </p>
          </div>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {actions.map((action) => (
              <Button
                key={action.nextStatus}
                size="sm"
                variant={action.variant}
                className="h-8 text-xs"
                onClick={() => onAction(action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Expanded detail */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t">
            <SubmissionDetail row={row} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== Submission Detail (type-specific) =====
function SubmissionDetail({ row }: { row: SacramentSubmissionRow }) {
  // Fetch full detail from the per-type list (already cached by the per-type queries)
  const { data: baptisms } = trpc.baptism.list.useQuery(undefined, { enabled: row.type === "baptism" });
  const { data: sponsors } = trpc.sponsor.list.useQuery(undefined, { enabled: row.type === "sponsor" });
  const { data: marriages } = trpc.marriage.list.useQuery(undefined, { enabled: row.type === "marriage" });
  const { data: funerals } = trpc.funeral.list.useQuery(undefined, { enabled: row.type === "funeral" });

  const detail = useMemo(() => {
    switch (row.type) {
      case "baptism": return baptisms?.find((b: any) => b.id === row.id);
      case "sponsor": return sponsors?.find((s: any) => s.id === row.id);
      case "marriage": return marriages?.find((m: any) => m.id === row.id);
      case "funeral": return funerals?.find((f: any) => f.id === row.id);
    }
  }, [row, baptisms, sponsors, marriages, funerals]);

  if (!detail) {
    return <p className="text-sm text-muted-foreground">Loading details...</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      {/* Contact info */}
      <div className="flex items-center gap-4 flex-wrap text-muted-foreground">
        {row.email && (
          <a href={`mailto:${row.email}`} className="flex items-center gap-1 hover:text-foreground">
            <Mail className="w-3.5 h-3.5" /> {row.email}
          </a>
        )}
        {row.phone && (
          <a href={`tel:${row.phone}`} className="flex items-center gap-1 hover:text-foreground">
            <Phone className="w-3.5 h-3.5" /> {row.phone}
          </a>
        )}
      </div>

      {/* Type-specific fields */}
      {row.type === "baptism" && <BaptismDetail detail={detail} />}
      {row.type === "sponsor" && <SponsorDetail detail={detail} />}
      {row.type === "marriage" && <MarriageDetail detail={detail} />}
      {row.type === "funeral" && <FuneralDetail detail={detail} />}
    </div>
  );
}

function BaptismDetail({ detail }: { detail: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
      <div><span className="text-muted-foreground">DOB:</span> {detail.childDob}</div>
      <div><span className="text-muted-foreground">Gender:</span> {detail.childGender}</div>
      <div><span className="text-muted-foreground">Father:</span> {detail.fatherName || "—"}</div>
      <div><span className="text-muted-foreground">Mother:</span> {detail.motherName || "—"}</div>
      <div><span className="text-muted-foreground">Godparent 1:</span> {detail.godparentName1 || "—"}</div>
      <div><span className="text-muted-foreground">Godparent 2:</span> {detail.godparentName2 || "—"}</div>
      {detail.preferredDate && <div><span className="text-muted-foreground">Preferred Date:</span> {detail.preferredDate}</div>}
      {detail.notes && <div className="col-span-full italic text-muted-foreground">"{detail.notes}"</div>}
    </div>
  );
}

function SponsorDetail({ detail }: { detail: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
      <div><span className="text-muted-foreground">Candidate:</span> {detail.candidateName}</div>
      <div><span className="text-muted-foreground">Sacrament:</span> {detail.sacramentType}</div>
      <div><span className="text-muted-foreground">Parish:</span> {detail.sponsorParish}, {detail.sponsorParishCity}</div>
      <div><span className="text-muted-foreground">Ceremony Date:</span> {detail.ceremonyDate || "—"}</div>
      <div className="col-span-full flex gap-3 flex-wrap text-xs">
        <span>Baptized: {detail.isBaptized ? "Yes" : "No"}</span>
        <span>Confirmed: {detail.isConfirmed ? "Yes" : "No"}</span>
        <span>Active Catholic: {detail.isActiveCatholic ? "Yes" : "No"}</span>
      </div>
      {detail.notes && <div className="col-span-full italic text-muted-foreground">"{detail.notes}"</div>}
    </div>
  );
}

function MarriageDetail({ detail }: { detail: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
      <div><span className="text-muted-foreground">Bride:</span> {detail.brideFirstName} {detail.brideLastName}</div>
      <div><span className="text-muted-foreground">Groom:</span> {detail.groomFirstName} {detail.groomLastName}</div>
      <div><span className="text-muted-foreground">Bride Email:</span> {detail.brideEmail}</div>
      <div><span className="text-muted-foreground">Groom Email:</span> {detail.groomEmail || "—"}</div>
      <div><span className="text-muted-foreground">Preferred:</span> {detail.preferredDate || "—"}</div>
      <div><span className="text-muted-foreground">Alternate:</span> {detail.alternateDate || "—"}</div>
      <div className="col-span-full flex gap-3 flex-wrap text-xs">
        <span>Parishioner: {detail.isParishioner ? "Yes" : "No"}</span>
        <span>Previous Marriage: {detail.previousMarriage ? "Yes" : "No"}</span>
        {detail.guestCount && <span>Guests: {detail.guestCount}</span>}
      </div>
      {detail.notes && <div className="col-span-full italic text-muted-foreground">"{detail.notes}"</div>}
    </div>
  );
}

function FuneralDetail({ detail }: { detail: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
      <div><span className="text-muted-foreground">Planner:</span> {detail.plannerName} ({detail.plannerRelation || "N/A"})</div>
      <div><span className="text-muted-foreground">Type:</span> {detail.isPrePlanning ? "Pre-Planning" : "Immediate Need"}</div>
      <div><span className="text-muted-foreground">Service:</span> {detail.massType?.replace(/_/g, " ")}</div>
      <div><span className="text-muted-foreground">Date:</span> {detail.preferredDate || "—"}</div>
      {detail.hymns && <div className="col-span-full"><span className="text-muted-foreground">Hymns:</span> {detail.hymns}</div>}
      {detail.eulogist && <div><span className="text-muted-foreground">Eulogist:</span> {detail.eulogist}</div>}
      {detail.pallbearers && <div className="col-span-full"><span className="text-muted-foreground">Pallbearers:</span> {detail.pallbearers}</div>}
      {detail.specialRequests && <div className="col-span-full italic text-muted-foreground">"{detail.specialRequests}"</div>}
    </div>
  );
}
