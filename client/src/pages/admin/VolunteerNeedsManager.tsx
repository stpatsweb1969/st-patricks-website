/**
 * Admin: Volunteer Needs Board Manager
 * Create, edit, close needs and view responses.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Users, Eye, XCircle, CheckCircle } from "lucide-react";

const urgencyColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

export default function VolunteerNeedsManager() {
  const { data: needs, isLoading } = trpc.volunteerNeeds.listAll.useQuery();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Volunteer Needs Board</h1>
          <p className="text-muted-foreground text-sm">Post urgent volunteer needs for parishioners</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Post Need</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Post a Volunteer Need</DialogTitle>
            </DialogHeader>
            <CreateNeedForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : !needs || needs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No volunteer needs posted yet. Click "Post Need" to create one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {needs.map((need: any) => (
            <NeedRow key={need.id} need={need} />
          ))}
        </div>
      )}
    </div>
  );
}

function NeedRow({ need }: { need: any }) {
  const [viewResponses, setViewResponses] = useState(false);
  const utils = trpc.useUtils();
  const { data: responses } = trpc.volunteerNeeds.getResponses.useQuery(
    { needId: need.id },
    { enabled: viewResponses }
  );

  const updateMutation = trpc.volunteerNeeds.update.useMutation({
    onSuccess: () => {
      utils.volunteerNeeds.listAll.invalidate();
      toast.success("Need updated");
    },
  });

  return (
    <Card className={!need.active ? "opacity-60" : ""}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{need.title}</h3>
              <Badge className={urgencyColors[need.urgency]} variant="secondary">
                {need.urgency}
              </Badge>
              {!need.active && <Badge variant="outline">Closed</Badge>}
            </div>
            {need.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{need.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span><Users className="w-3 h-3 inline mr-1" />{need.spotsFilled}/{need.spotsNeeded} filled</span>
              {need.neededBy && <span>Due: {new Date(need.neededBy).toLocaleDateString()}</span>}
              {need.category && <Badge variant="outline" className="text-xs">{need.category}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewResponses(!viewResponses)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            {need.active ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateMutation.mutate({ id: need.id, active: false })}
              >
                <XCircle className="w-4 h-4 text-red-500" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateMutation.mutate({ id: need.id, active: true })}
              >
                <CheckCircle className="w-4 h-4 text-green-500" />
              </Button>
            )}
          </div>
        </div>

        {viewResponses && (
          <div className="mt-4 border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Responses ({responses?.length || 0})</h4>
            {!responses || responses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No responses yet.</p>
            ) : (
              <div className="space-y-2">
                {responses.map((r: any) => (
                  <div key={r.id} className="text-sm bg-muted/50 rounded p-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{r.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-muted-foreground">{r.email} {r.phone && `· ${r.phone}`}</div>
                    {r.message && <p className="mt-1 text-foreground">{r.message}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateNeedForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("");
  const [spotsNeeded, setSpotsNeeded] = useState(1);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const utils = trpc.useUtils();
  const create = trpc.volunteerNeeds.create.useMutation({
    onSuccess: () => {
      utils.volunteerNeeds.listAll.invalidate();
      toast.success("Volunteer need posted!");
      onSuccess();
    },
    onError: () => toast.error("Failed to create need"),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate({
          title,
          description: description || undefined,
          urgency,
          category: category || undefined,
          spotsNeeded,
          contactName: contactName || undefined,
          contactEmail: contactEmail || undefined,
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="text-sm font-medium">Title *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Lectors needed for Christmas Eve" />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Details about what's needed..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Urgency</label>
          <Select value={urgency} onValueChange={(v) => setUrgency(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (Flexible)</SelectItem>
              <SelectItem value="medium">Medium (Soon)</SelectItem>
              <SelectItem value="high">High (Urgent)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Spots Needed</label>
          <Input type="number" min={1} value={spotsNeeded} onChange={(e) => setSpotsNeeded(Number(e.target.value))} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Category</label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Liturgy, Events, Maintenance" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Contact Name</label>
          <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Contact Email</label>
          <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? "Posting..." : "Post Volunteer Need"}
      </Button>
    </form>
  );
}
