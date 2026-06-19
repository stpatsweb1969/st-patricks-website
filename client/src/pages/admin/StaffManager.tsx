/**
 * StaffManager — Admin CRUD for the staff directory.
 * Replaces hardcoded Staff.tsx data with DB-backed management.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, Phone, Mail } from "lucide-react";

const CATEGORIES = [
  { value: "clergy", label: "Clergy" },
  { value: "staff", label: "Staff" },
  { value: "leadership", label: "Leadership" },
  { value: "ministry_leader", label: "Ministry Leaders" },
  { value: "emeritus", label: "Emeritus" },
] as const;

const categoryColors: Record<string, string> = {
  clergy: "bg-purple-100 text-purple-800",
  staff: "bg-blue-100 text-blue-800",
  leadership: "bg-green-100 text-green-800",
  ministry_leader: "bg-amber-100 text-amber-800",
  emeritus: "bg-slate-100 text-slate-800",
};

type Category = "clergy" | "staff" | "leadership" | "ministry_leader" | "emeritus";

interface FormState {
  id?: number;
  name: string;
  role: string;
  category: Category;
  phone: string;
  email: string;
  sortOrder: number;
}

const emptyForm: FormState = { name: "", role: "", category: "staff", phone: "", email: "", sortOrder: 0 };

export default function StaffManager() {
  const { data: staffList, isLoading } = trpc.staff.list.useQuery();
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [filterCat, setFilterCat] = useState<string>("all");

  const upsert = trpc.staff.upsert.useMutation({
    onSuccess: () => {
      utils.staff.list.invalidate();
      setDialogOpen(false);
      toast.success(form.id ? "Staff member updated" : "Staff member added");
    },
    onError: () => toast.error("Failed to save"),
  });

  const deleteMut = trpc.staff.delete.useMutation({
    onSuccess: () => {
      utils.staff.list.invalidate();
      toast.success("Staff member removed");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const openNew = () => { setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (m: any) => {
    setForm({ id: m.id, name: m.name, role: m.role, category: m.category, phone: m.phone || "", email: m.email || "", sortOrder: m.sortOrder });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.role) { toast.error("Name and role are required"); return; }
    upsert.mutate({
      id: form.id,
      name: form.name,
      role: form.role,
      category: form.category,
      phone: form.phone || null,
      email: form.email || null,
      sortOrder: form.sortOrder,
    });
  };

  const filtered = staffList?.filter((s: any) => filterCat === "all" || s.category === filterCat) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" />Staff Directory</h1>
          <p className="text-muted-foreground text-sm">Manage parish staff, clergy, and ministry leaders.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12"><CardContent><p className="text-muted-foreground">No staff members found.</p></CardContent></Card>
      ) : (
        <div className="space-y-1">
          {filtered.map((m: any) => (
            <Card key={m.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-serif font-bold text-xs">{m.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{m.name}</span>
                    <Badge variant="secondary" className={`text-xs ${categoryColors[m.category] || ""}`}>
                      {CATEGORIES.find(c => c.value === m.category)?.label || m.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                  <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                    {m.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{m.phone}</span>}
                    {m.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{m.email}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" aria-label={`Edit ${m.name}`} onClick={() => openEdit(m)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" aria-label={`Delete ${m.name}`} className="text-destructive" onClick={() => { if (confirm(`Remove ${m.name}?`)) deleteMut.mutate({ id: m.id }); }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upsert Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{form.id ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="staff-name">Name *</Label><Input id="staff-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
            <div><Label htmlFor="staff-role">Role *</Label><Input id="staff-role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Office Manager" /></div>
            <div><Label htmlFor="staff-category">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v as Category }))}>
                <SelectTrigger id="staff-category" aria-label="Staff category"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="staff-phone">Phone</Label><Input id="staff-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(914) 273-9724" /></div>
            <div><Label htmlFor="staff-email">Email</Label><Input id="staff-email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="name@stpatrickinarmonk.org" /></div>
            <div><Label htmlFor="staff-sort">Sort Order</Label><Input id="staff-sort" type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={upsert.isPending}>{form.id ? "Update" : "Add"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
