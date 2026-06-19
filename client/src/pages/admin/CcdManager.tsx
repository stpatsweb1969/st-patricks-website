import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminTableControls } from "@/components/AdminTableControls";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";

export function CcdManager() {
  const { data: registrations, isLoading } = trpc.ccd.list.useQuery();
  const { data: ccdEvents, isLoading: eventsLoading } = trpc.ccd.listEvents.useQuery({ schoolYear: "2026-2027" });
  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.ccd.updateStatus.useMutation({
    onSuccess: () => { utils.ccd.list.invalidate(); toast.success("Status updated"); },
  });
  const createEventMutation = trpc.ccd.createEvent.useMutation({
    onSuccess: () => { utils.ccd.listEvents.invalidate(); toast.success("Event created"); setShowEventForm(false); },
  });
  const deleteEventMutation = trpc.ccd.deleteEvent.useMutation({
    onSuccess: () => { utils.ccd.listEvents.invalidate(); toast.success("Event deleted"); },
  });

  const updateEventMutation = trpc.ccd.updateEvent.useMutation({
    onSuccess: () => { utils.ccd.listEvents.invalidate(); toast.success("Event updated"); setEditingEventId(null); },
  });

  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState<"class" | "holiday" | "special" | "sacrament">("class");
  const [eventDescription, setEventDescription] = useState("");
  const [eventGrade, setEventGrade] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  const startEditEvent = (event: any) => {
    setEditingEventId(event.id);
    setEventTitle(event.title);
    setEventDate(new Date(event.eventDate).toISOString().slice(0, 16));
    setEventType(event.eventType);
    setEventDescription(event.description || "");
    setEventGrade(event.grade || "");
    setEventLocation(event.location || "");
    setShowEventForm(true);
  };

  const handleSaveEvent = () => {
    if (!eventTitle || !eventDate) { toast.error("Title and date are required"); return; }
    if (editingEventId) {
      updateEventMutation.mutate({
        id: editingEventId,
        title: eventTitle,
        eventDate,
        eventType,
        description: eventDescription || undefined,
        grade: eventGrade || undefined,
        location: eventLocation || undefined,
      });
    } else {
      handleCreateEvent();
    }
  };

  const handleCreateEvent = () => {
    if (!eventTitle || !eventDate) { toast.error("Title and date are required"); return; }
    createEventMutation.mutate({
      title: eventTitle,
      eventDate,
      eventType,
      description: eventDescription || undefined,
      grade: eventGrade || undefined,
      location: eventLocation || undefined,
      schoolYear: "2026-2027",
    });
    setEventTitle(""); setEventDate(""); setEventType("class"); setEventDescription(""); setEventGrade(""); setEventLocation("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">CCD Registrations</h2>
        <Badge variant="secondary">{registrations?.length ?? 0} total</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : registrations && registrations.length > 0 ? (
        <CcdRegistrationsTable registrations={registrations} updateStatusMutation={updateStatusMutation} />
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No CCD registrations yet. Parents can register at /ccd-registration.</p>
        </Card>
      )}

      {/* CCD Calendar Events Management */}
      <div className="border-t pt-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">CCD Calendar Events</h2>
          <Button size="sm" onClick={() => setShowEventForm(!showEventForm)}>
            <Plus className="w-4 h-4 mr-1" /> Add Event
          </Button>
        </div>

        {showEventForm && (
          <Card className="p-4 mb-4 border-primary/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Event title *" value={eventTitle} onChange={e => setEventTitle(e.target.value)} />
              <Input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              <select className="border rounded-md px-3 py-2 text-sm" value={eventType} onChange={e => setEventType(e.target.value as any)}>
                <option value="class">Class</option>
                <option value="holiday">Holiday / No Class</option>
                <option value="special">Special Event</option>
                <option value="sacrament">Sacrament</option>
              </select>
              <Input placeholder="Grade (optional, e.g. 2nd, All)" value={eventGrade} onChange={e => setEventGrade(e.target.value)} />
              <Input placeholder="Location (e.g. Wallace Hall, St. Francis Hall, Church)" value={eventLocation} onChange={e => setEventLocation(e.target.value)} />
              <Input placeholder="Description (optional)" value={eventDescription} onChange={e => setEventDescription(e.target.value)} />
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleSaveEvent} disabled={createEventMutation.isPending || updateEventMutation.isPending}>
                {(createEventMutation.isPending || updateEventMutation.isPending) ? "Saving..." : editingEventId ? "Update Event" : "Save Event"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowEventForm(false); setEditingEventId(null); setEventTitle(""); setEventDate(""); setEventType("class"); setEventDescription(""); setEventGrade(""); setEventLocation(""); }}>Cancel</Button>
            </div>
          </Card>
        )}

        {eventsLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : ccdEvents && ccdEvents.length > 0 ? (
          <div className="space-y-2">
            {ccdEvents.map((event: any) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-primary bg-green-50 px-2 py-1 rounded">
                    {new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-sm font-medium">{event.title}</span>
                  <Badge variant="secondary" className="text-xs">{event.eventType}</Badge>
                  {event.grade && <span className="text-xs text-muted-foreground">Grade: {event.grade}</span>}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => startEditEvent(event)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => deleteEventMutation.mutate({ id: event.id })}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No CCD events added yet. Add events to display on the CCD Calendar page.</p>
        )}
      </div>
    </div>
  );
}


function CcdRegistrationsTable({ registrations, updateStatusMutation }: { registrations: any[]; updateStatusMutation: any }) {
  const statusOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach((r: any) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return Object.entries(counts).map(([value, count]) => ({ value, label: value, count }));
  }, [registrations]);

  const gradeOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach((r: any) => { counts[r.grade] = (counts[r.grade] || 0) + 1; });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([value, count]) => ({ value, label: `Grade ${value}`, count }));
  }, [registrations]);

  return (
    <AdminTableControls
      items={registrations}
      searchFn={(reg: any) => `${reg.childFirstName} ${reg.childLastName} ${reg.parentFirstName} ${reg.parentLastName} ${reg.parentEmail} ${reg.parentPhone}`}
      searchPlaceholder="Search by child name, parent, email..."
      filters={[
        { key: "status", label: "Status", options: statusOptions, getItemValue: (r: any) => r.status },
        { key: "grade", label: "Grade", options: gradeOptions, getItemValue: (r: any) => r.grade },
      ]}
    >
      {(items) => (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-secondary/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Child</th>
                    <th className="text-left p-3 text-sm font-medium">Grade</th>
                    <th className="text-left p-3 text-sm font-medium">Parent</th>
                    <th className="text-left p-3 text-sm font-medium">Email</th>
                    <th className="text-center p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((reg: any) => (
                    <tr key={reg.id} className="border-b last:border-0">
                      <td className="p-3 text-sm font-medium">{reg.childFirstName} {reg.childLastName}</td>
                      <td className="p-3 text-sm">{reg.grade}</td>
                      <td className="p-3 text-sm">{reg.parentFirstName} {reg.parentLastName}</td>
                      <td className="p-3 text-sm text-muted-foreground">{reg.parentEmail}</td>
                      <td className="p-3 text-center">
                        <Badge variant={reg.status === "approved" ? "default" : reg.status === "pending" ? "secondary" : "destructive"} className="text-xs">
                          {reg.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {reg.status !== "approved" && (
                            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => updateStatusMutation.mutate({ id: reg.id, status: "approved" })}>
                              Approve
                            </Button>
                          )}
                          {reg.status !== "waitlisted" && (
                            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => updateStatusMutation.mutate({ id: reg.id, status: "waitlisted" })}>
                              Waitlist
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </AdminTableControls>
  );
}
