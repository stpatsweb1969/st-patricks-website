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

export function KeyDatesManager() {
  const utils = trpc.useUtils();
  const { data: dates, isLoading } = trpc.importantDates.all.useQuery();
  const createMutation = trpc.importantDates.create.useMutation({
    onSuccess: () => { utils.importantDates.all.invalidate(); utils.importantDates.allPublished.invalidate(); toast.success("Key date created!"); setShowForm(false); resetForm(); },
  });
  const updateMutation = trpc.importantDates.update.useMutation({
    onSuccess: () => { utils.importantDates.all.invalidate(); utils.importantDates.allPublished.invalidate(); toast.success("Key date updated!"); setEditingDate(null); },
  });
  const deleteMutation = trpc.importantDates.delete.useMutation({
    onSuccess: () => { utils.importantDates.all.invalidate(); utils.importantDates.allPublished.invalidate(); toast.success("Key date deleted"); },
  });

  const [showForm, setShowForm] = useState(false);
  const [editingDate, setEditingDate] = useState<any>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formCategory, setFormCategory] = useState<string>("parish");
  const [formPublished, setFormPublished] = useState(true);

  const resetForm = () => {
    setFormTitle(""); setFormDate(""); setFormLocation(""); setFormNote(""); setFormCategory("parish"); setFormPublished(true);
  };

  const startEdit = (date: any) => {
    setEditingDate(date);
    setFormTitle(date.title);
    setFormDate(format(new Date(date.eventDate), "yyyy-MM-dd"));
    setFormLocation(date.location || "");
    setFormNote(date.note || "");
    setFormCategory(date.category);
    setFormPublished(date.published);
  };

  const handleCreate = () => {
    if (!formTitle || !formDate) { toast.error("Title and date are required"); return; }
    createMutation.mutate({
      title: formTitle,
      eventDate: new Date(formDate + "T12:00:00Z").toISOString(),
      location: formLocation || undefined,
      note: formNote || undefined,
      category: formCategory as any,
      published: formPublished,
    });
  };

  const handleUpdate = () => {
    if (!editingDate || !formTitle || !formDate) { toast.error("Title and date are required"); return; }
    updateMutation.mutate({
      id: editingDate.id,
      title: formTitle,
      eventDate: new Date(formDate + "T12:00:00Z").toISOString(),
      location: formLocation || null,
      note: formNote || null,
      category: formCategory as any,
      published: formPublished,
    });
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate({ id });
    }
  };

  const categoryLabels: Record<string, { label: string; color: string }> = {
    ccd: { label: "CCD", color: "bg-green-100 text-green-800" },
    cyo: { label: "CYO", color: "bg-orange-100 text-orange-800" },
    sacrament: { label: "Sacrament", color: "bg-purple-100 text-purple-800" },
    parish: { label: "Parish", color: "bg-emerald-100 text-emerald-800" },
    teen_life: { label: "Teen Life (St. Francis Hall)", color: "bg-blue-100 text-blue-800" },
    social: { label: "Social", color: "bg-amber-100 text-amber-800" },
  };

  const DateForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <Card className={isEdit ? "" : "border-primary/30"}>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="kd-title">Event Title *</Label>
            <Input id="kd-title" placeholder="e.g. Parish BBQ" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="kd-date">Date *</Label>
            <Input id="kd-date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="kd-category">Category</Label>
            <select
              id="kd-category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="parish">Parish</option>
              <option value="ccd">CCD</option>
              <option value="cyo">CYO</option>
              <option value="sacrament">Sacrament</option>
              <option value="teen_life">Teen Life</option>
              <option value="social">Social</option>
            </select>
          </div>
          <div>
            <Label htmlFor="kd-location">Location</Label>
            <Input id="kd-location" placeholder="e.g. Church, St. Francis Hall, Wallace Hall" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="kd-note">Time / Note</Label>
            <Input id="kd-note" placeholder="e.g. After 5:30pm Mass" value={formNote} onChange={(e) => setFormNote(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={formPublished} onCheckedChange={setFormPublished} id="kd-published" />
          <Label htmlFor="kd-published">Published (visible on website)</Label>
        </div>
        <div className="flex gap-3">
          {isEdit ? (
            <>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => { setEditingDate(null); resetForm(); }}>Cancel</Button>
            </>
          ) : (
            <>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Key Date"}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Key Dates</h2>
          <p className="text-sm text-muted-foreground">Manage the 2026–2027 parish calendar of important dates</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Date
        </Button>
      </div>

      {showForm && <DateForm />}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : dates && dates.length > 0 ? (
        <div className="space-y-2">
          {dates.map((date) => {
            const cat = categoryLabels[date.category] || categoryLabels.parish;
            return (
              <Card key={date.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-gold uppercase leading-none">
                      {format(new Date(date.eventDate), "MMM")}
                    </span>
                    <span className="text-base font-bold text-gold leading-tight">
                      {format(new Date(date.eventDate), "d")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-semibold text-sm truncate">{date.title}</h3>
                      <Badge className={`text-xs px-1.5 py-0 ${cat.color} border-0`}>{cat.label}</Badge>
                      {!date.published && <Badge variant="secondary" className="text-xs px-1.5 py-0">Draft</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {date.location && <span>{date.location}</span>}
                      {date.location && date.note && <span> · </span>}
                      {date.note && <span>{date.note}</span>}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(date)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(date.id, date.title)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No key dates yet. Add your first one above.</p>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingDate} onOpenChange={(open) => { if (!open) { setEditingDate(null); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Key Date</DialogTitle>
          </DialogHeader>
          <DateForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
}
