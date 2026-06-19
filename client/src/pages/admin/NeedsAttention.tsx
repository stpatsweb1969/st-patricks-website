/**
 * Admin: Unified "Needs Attention" Inbox
 * Shows all pending form submissions across all types in one view with bulk actions.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Inbox,
  CheckCircle,
  XCircle,
  StickyNote,
  Filter,
} from "lucide-react";

const typeLabels: Record<string, string> = {
  baptism: "Baptism",
  marriage: "Marriage",
  ccd: "CCD",
  parish_registration: "Parish Reg.",
  teen_life: "Teen Life",
  ccd_permission: "CCD Permission",
  sponsor_cert: "Sponsor Cert.",
  funeral: "Funeral",
  mass_intention: "Mass Intention",
};

const typeColors: Record<string, string> = {
  baptism: "bg-blue-100 text-blue-800",
  marriage: "bg-pink-100 text-pink-800",
  ccd: "bg-purple-100 text-purple-800",
  parish_registration: "bg-green-100 text-green-800",
  teen_life: "bg-amber-100 text-amber-800",
  ccd_permission: "bg-indigo-100 text-indigo-800",
  sponsor_cert: "bg-teal-100 text-teal-800",
  funeral: "bg-slate-100 text-slate-800",
  mass_intention: "bg-rose-100 text-rose-800",
};

export default function NeedsAttention() {
  const { data: submissions, isLoading } = trpc.adminStats.getPendingSubmissions.useQuery();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>("all");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteTarget, setNoteTarget] = useState<{ id: number; type: string; currentNote: string } | null>(null);
  const [noteText, setNoteText] = useState("");

  const utils = trpc.useUtils();

  const bulkUpdate = trpc.adminStats.bulkUpdateStatus.useMutation({
    onSuccess: (data) => {
      utils.adminStats.getPendingSubmissions.invalidate();
      utils.adminStats.overview.invalidate();
      setSelectedIds(new Set());
      toast.success(`${data.updated} submission(s) updated`);
    },
    onError: () => toast.error("Failed to update submissions"),
  });

  const updateNote = trpc.adminStats.updateNote.useMutation({
    onSuccess: () => {
      utils.adminStats.getPendingSubmissions.invalidate();
      setNoteDialogOpen(false);
      setNoteTarget(null);
      toast.success("Note saved");
    },
  });

  const filtered = useMemo(() => {
    if (!submissions) return [];
    if (filterType === "all") return submissions;
    return submissions.filter((s: any) => s.type === filterType);
  }, [submissions, filterType]);

  const allSelected = filtered.length > 0 && filtered.every((s: any) => selectedIds.has(`${s.type}-${s.id}`));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s: any) => `${s.type}-${s.id}`)));
    }
  };

  const toggleOne = (key: string) => {
    const next = new Set(selectedIds);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedIds(next);
  };

  const handleBulkAction = (status: "approved" | "rejected") => {
    const items = Array.from(selectedIds).map((key) => {
      const [type, id] = key.split("-");
      return { type, id: Number(id) };
    });
    bulkUpdate.mutate({ items, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="w-6 h-6" />
            Needs Attention
          </h1>
          <p className="text-muted-foreground text-sm">
            All pending submissions in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="baptism">Baptism</SelectItem>
              <SelectItem value="marriage">Marriage</SelectItem>
              <SelectItem value="ccd">CCD</SelectItem>
              <SelectItem value="parish_registration">Parish Reg.</SelectItem>
              <SelectItem value="teen_life">Teen Life</SelectItem>
              <SelectItem value="ccd_permission">CCD Permission</SelectItem>
              <SelectItem value="sponsor_cert">Sponsor Cert.</SelectItem>
              <SelectItem value="funeral">Funeral</SelectItem>
              <SelectItem value="mass_intention">Mass Intention</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-3 flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedIds.size} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleBulkAction("approved")}
                disabled={bulkUpdate.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve All
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction("rejected")}
                disabled={bulkUpdate.isPending}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium text-lg">All caught up!</h3>
            <p className="text-muted-foreground text-sm mt-1">
              No pending submissions need your attention.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {/* Select All Header */}
          <div className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            <span>Select all ({filtered.length})</span>
          </div>

          {filtered.map((item: any) => {
            const key = `${item.type}-${item.id}`;
            return (
              <Card key={key} className="hover:bg-muted/30 transition-colors">
                <CardContent className="py-3 flex items-center gap-3">
                  <Checkbox
                    checked={selectedIds.has(key)}
                    onCheckedChange={() => toggleOne(key)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {item.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${typeColors[item.type] || ""}`}
                      >
                        {typeLabels[item.type] || item.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {item.adminNotes && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <StickyNote className="w-3 h-3" />
                          Has note
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNoteTarget({
                        id: item.id,
                        type: item.type,
                        currentNote: item.adminNotes || "",
                      });
                      setNoteText(item.adminNotes || "");
                      setNoteDialogOpen(true);
                    }}
                  >
                    <StickyNote className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Note</DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            placeholder="Add a note about this submission..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (noteTarget) {
                  updateNote.mutate({
                    id: noteTarget.id,
                    type: noteTarget.type,
                    note: noteText,
                  });
                }
              }}
              disabled={updateNote.isPending}
            >
              Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
