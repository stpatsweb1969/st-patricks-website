/**
 * HolyDaysManager — Admin CRUD for Holy Days of Obligation & Special Mass Times.
 * Displays all holy days in a table with add/edit/delete and category filtering.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Star, Calendar } from "lucide-react";
import { toast } from "sonner";

type HolyDayCategory = "holy_day" | "special_mass" | "seasonal" | "parish_feast" | "triduum" | "other";

const CATEGORIES: { value: HolyDayCategory; label: string; color: string }[] = [
  { value: "holy_day", label: "Holy Day of Obligation", color: "bg-amber-100 text-amber-800" },
  { value: "special_mass", label: "Special Mass", color: "bg-blue-100 text-blue-800" },
  { value: "seasonal", label: "Seasonal", color: "bg-green-100 text-green-800" },
  { value: "parish_feast", label: "Parish Feast", color: "bg-purple-100 text-purple-800" },
  { value: "triduum", label: "Triduum", color: "bg-red-100 text-red-800" },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-800" },
];

function getCategoryBadge(category: HolyDayCategory) {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat ? <Badge className={`${cat.color} border-0`}>{cat.label}</Badge> : <Badge>{category}</Badge>;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function isPast(dateStr: string) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

type FormData = {
  id?: number;
  name: string;
  date: string;
  massTimes: string; // comma-separated for editing
  category: HolyDayCategory;
  notes: string;
};

const emptyForm: FormData = { name: "", date: "", massTimes: "8:30 AM, 12:10 PM, 7:30 PM", category: "holy_day", notes: "" };

export function HolyDaysManager() {
  const { data: holyDays, isLoading } = trpc.holyDays.listAll.useQuery();
  const utils = trpc.useUtils();
  const upsertMutation = trpc.holyDays.upsert.useMutation({
    onSuccess: () => { utils.holyDays.invalidate(); toast.success("Holy day saved"); setDialogOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.holyDays.delete.useMutation({
    onSuccess: () => { utils.holyDays.invalidate(); toast.success("Holy day deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!holyDays) return [];
    if (filterCategory === "all") return holyDays;
    return holyDays.filter(h => h.category === filterCategory);
  }, [holyDays, filterCategory]);

  const upcomingCount = useMemo(() => {
    if (!holyDays) return 0;
    const today = new Date().toISOString().slice(0, 10);
    return holyDays.filter(h => h.date >= today).length;
  }, [holyDays]);

  function openCreate() {
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(h: NonNullable<typeof holyDays>[number]) {
    setForm({
      id: h.id,
      name: h.name,
      date: h.date,
      massTimes: (h.massTimes as string[]).join(", "),
      category: h.category as HolyDayCategory,
      notes: h.notes || "",
    });
    setDialogOpen(true);
  }

  function handleSave() {
    const massTimes = form.massTimes.split(",").map(t => t.trim()).filter(Boolean);
    if (!form.name || !form.date || massTimes.length === 0) {
      toast.error("Name, date, and at least one Mass time are required");
      return;
    }
    upsertMutation.mutate({
      id: form.id,
      name: form.name,
      date: form.date,
      massTimes,
      category: form.category,
      notes: form.notes || null,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500" />
            Holy Days & Special Masses
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage upcoming holy days of obligation and special Mass times.
            {upcomingCount > 0 && <span className="ml-2 font-medium text-foreground">{upcomingCount} upcoming</span>}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Holy Day
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          variant={filterCategory === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterCategory("all")}
        >
          All ({holyDays?.length || 0})
        </Badge>
        {CATEGORIES.map(cat => {
          const count = holyDays?.filter(h => h.category === cat.value).length || 0;
          if (count === 0) return null;
          return (
            <Badge
              key={cat.value}
              variant={filterCategory === cat.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterCategory(cat.value)}
            >
              {cat.label} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No holy days found</p>
            <p className="text-sm mt-1">Add upcoming holy days so parishioners know when special Masses are scheduled.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(h => (
            <Card key={h.id} className={`transition-all ${isPast(h.date) ? "opacity-60" : ""}`}>
              <CardContent className="py-4 px-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-base">{h.name}</span>
                    {getCategoryBadge(h.category as HolyDayCategory)}
                    {isPast(h.date) && <Badge variant="outline" className="text-xs">Past</Badge>}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
                    <span className="font-medium">{formatDate(h.date)}</span>
                    <span>Mass: {(h.massTimes as string[]).join(" · ")}</span>
                  </div>
                  {h.notes && <p className="text-sm text-muted-foreground mt-1 italic">{h.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(h)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteTarget({ id: h.id, name: h.name })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Holy Day" : "Add Holy Day"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Assumption of the Blessed Virgin Mary"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Mass Times * (comma-separated)</Label>
              <Input
                placeholder="8:30 AM, 12:10 PM, 7:30 PM"
                value={form.massTimes}
                onChange={e => setForm(f => ({ ...f, massTimes: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Standard holy day times: 8:30 AM, 12:10 PM, 7:30 PM</p>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as HolyDayCategory }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any additional info for parishioners..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this holy day entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => { if (deleteTarget) deleteMutation.mutate({ id: deleteTarget.id }); setDeleteTarget(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default HolyDaysManager;
