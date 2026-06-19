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

export function VolunteerManager() {
  const utils = trpc.useUtils();
  const { data: opportunities, isLoading } = trpc.volunteer.listAllOpportunities.useQuery();
  const createMutation = trpc.volunteer.createOpportunity.useMutation({ onSuccess: () => { utils.volunteer.listAllOpportunities.invalidate(); toast.success("Opportunity created!"); setShowForm(false); } });
  const deleteMutation = trpc.volunteer.deleteOpportunity.useMutation({ onSuccess: () => { utils.volunteer.listAllOpportunities.invalidate(); toast.success("Deleted"); } });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ministry, setMinistry] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [spots, setSpots] = useState("10");

  const handleCreate = () => {
    if (!title || !spots) { toast.error("Title and spots required"); return; }
    createMutation.mutate({
      title,
      description: description || undefined,
      ministry: ministry || undefined,
      eventDate: eventDate || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      spotsAvailable: parseInt(spots),
    });
    setTitle(""); setDescription(""); setMinistry(""); setEventDate(""); setStartTime(""); setEndTime(""); setSpots("10");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Volunteer Opportunities</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> New Opportunity
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Opportunity title" value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Ministry (optional)" value={ministry} onChange={e => setMinistry(e.target.value)} />
              <Input type="date" placeholder="Date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              <Input type="number" placeholder="Spots available" value={spots} onChange={e => setSpots(e.target.value)} min="1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="time" placeholder="Start time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              <Input type="time" placeholder="End time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={createMutation.isPending}>Create</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : opportunities && opportunities.length > 0 ? (
        <div className="space-y-3">
          {opportunities.map(opp => (
            <Card key={opp.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-sm">{opp.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {opp.ministry && `${opp.ministry} • `}
                    {opp.eventDate && `${format(new Date(opp.eventDate), "MMM d, yyyy")} • `}
                    {opp.spotsFilled}/{opp.spotsAvailable} filled
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={opp.active ? "default" : "secondary"}>{opp.active ? "Active" : "Inactive"}</Badge>
                  <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => deleteMutation.mutate({ id: opp.id })}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No volunteer opportunities yet. Create one above.</p>
        </Card>
      )}
    </div>
  );
}


const DOC_CATEGORIES = [
  { value: "baptism", label: "Baptism" },
  { value: "confirmation", label: "Confirmation" },
  { value: "marriage", label: "Marriage" },
  { value: "funeral", label: "Funeral" },
  { value: "ccd", label: "Religious Education (CCD)" },
  { value: "general", label: "General" },
];
