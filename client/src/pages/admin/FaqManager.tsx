/**
 * FAQ Manager — Admin page for managing Parish Assistant knowledge base.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["general", "logistics", "getting_started", "programs", "sacraments", "facilities"];

export default function FaqManager() {
  const { data: faqs, isLoading } = trpc.faq.listAll.useQuery();
  const utils = trpc.useUtils();
  const createMutation = trpc.faq.create.useMutation({ onSuccess: () => { utils.faq.listAll.invalidate(); toast.success("FAQ created"); } });
  const updateMutation = trpc.faq.update.useMutation({ onSuccess: () => { utils.faq.listAll.invalidate(); toast.success("FAQ updated"); } });
  const deleteMutation = trpc.faq.delete.useMutation({ onSuccess: () => { utils.faq.listAll.invalidate(); toast.success("FAQ deleted"); } });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("general");

  const resetForm = () => { setQuestion(""); setAnswer(""); setCategory("general"); setEditId(null); setShowForm(false); };

  const handleSubmit = () => {
    if (!question.trim() || !answer.trim()) return;
    if (editId) {
      updateMutation.mutate({ id: editId, question, answer, category });
    } else {
      createMutation.mutate({ question, answer, category });
    }
    resetForm();
  };

  const startEdit = (faq: any) => {
    setEditId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            FAQ Knowledge Base
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage questions and answers that the AI Parish Assistant uses to help visitors.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add FAQ
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      <div className="space-y-3">
        {faqs?.map((faq) => (
          <Card key={faq.id} className={`${!faq.active ? "opacity-50" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">{faq.category}</Badge>
                    {!faq.active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                  </div>
                  <p className="font-medium text-sm">{faq.question}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch
                    checked={faq.active}
                    onCheckedChange={(active) => updateMutation.mutate({ id: faq.id, active })}
                    className="mr-2"
                  />
                  <Button variant="ghost" size="sm" onClick={() => startEdit(faq)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this FAQ?")) deleteMutation.mutate({ id: faq.id }); }}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {faqs?.length === 0 && !isLoading && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No FAQs yet. Add some to train the Parish Assistant.</CardContent></Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium">Question</label>
              <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g., Where is parking?" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Answer</label>
              <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="The answer the assistant will use..." rows={4} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!question.trim() || !answer.trim()}>
                {editId ? "Save Changes" : "Add FAQ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
