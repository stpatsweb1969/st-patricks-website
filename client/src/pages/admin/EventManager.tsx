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

export function EventManager() {
  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.events.listAll.useQuery();
  const createMutation = trpc.events.create.useMutation({ onSuccess: () => { utils.events.listAll.invalidate(); toast.success("Event created!"); } });
  const deleteMutation = trpc.events.delete.useMutation({ onSuccess: () => { utils.events.listAll.invalidate(); toast.success("Event deleted"); } });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const handleCreate = () => {
    if (!title || !startDate) { toast.error("Title and date required"); return; }
    const dateTime = startTime ? `${startDate}T${startTime}` : `${startDate}T09:00`;
    createMutation.mutate({ title, description: description || undefined, location: location || undefined, startDate: dateTime, published: true });
    setTitle(""); setDescription(""); setLocation(""); setStartDate(""); setStartTime(""); setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Parish Events</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> New Event
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-6 space-y-4">
            <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Location (e.g. Wallace Hall, St. Francis Hall, Church)" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label className="mb-2 block">Time</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Event"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : events && events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="bg-primary/10 rounded-lg p-2 text-center min-w-[50px]">
                  <p className="text-xs text-primary font-medium">{format(new Date(event.startDate), "MMM")}</p>
                  <p className="text-lg font-bold text-primary">{format(new Date(event.startDate), "d")}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.startDate), "h:mm a")}
                    {event.location && ` • ${event.location}`}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => deleteMutation.mutate({ id: event.id })}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No events yet. Create your first one above.</p>
        </Card>
      )}
    </div>
  );
}

