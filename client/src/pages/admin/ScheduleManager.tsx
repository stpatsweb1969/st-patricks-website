/**
 * Admin Schedule & Parish Info Manager
 * Lets staff edit Mass/Confession/Prayer times and parish info with no deploy.
 * Reads from parishSchedule.getSchedule / getInfo, saves via updateSchedule / updateInfo.
 */
import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Trash2, Save, Clock, MapPin, Phone, Mail, Globe, Eye } from "lucide-react";
import { parseTimeToMinutes } from "@shared/scheduleEngine";
import type { ScheduledService, HolyDay, ParishSchedule, ParishInfo, ServiceType } from "@shared/scheduleEngine";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: "mass", label: "Mass" },
  { value: "confession", label: "Confession" },
  { value: "prayer", label: "Prayer" },
  { value: "adoration", label: "Adoration" },
];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function validateTime(time: string): boolean {
  return parseTimeToMinutes(time) > 0 || time === "12:00 AM";
}

export default function ScheduleManager() {
  const { data: schedule, isLoading: schedLoading } = trpc.parishSchedule.getSchedule.useQuery();
  const { data: info, isLoading: infoLoading } = trpc.parishSchedule.getInfo.useQuery();
  const utils = trpc.useUtils();

  const updateSchedule = trpc.parishSchedule.updateSchedule.useMutation({
    onSuccess: () => {
      utils.parishSchedule.getSchedule.invalidate();
      toast.success("Schedule saved successfully");
    },
    onError: (e) => toast.error(`Failed to save schedule: ${e.message}`),
  });
  const updateInfo = trpc.parishSchedule.updateInfo.useMutation({
    onSuccess: () => {
      utils.parishSchedule.getInfo.invalidate();
      toast.success("Parish info saved successfully");
    },
    onError: (e) => toast.error(`Failed to save info: ${e.message}`),
  });

  const [services, setServices] = useState<ScheduledService[]>([]);
  const [holyDays, setHolyDays] = useState<HolyDay[]>([]);
  const [parishInfo, setParishInfo] = useState<ParishInfo | null>(null);

  useEffect(() => {
    if (schedule) {
      setServices([...schedule.services]);
      setHolyDays([...schedule.holyDays]);
    }
  }, [schedule]);

  useEffect(() => {
    if (info) setParishInfo({ ...info });
  }, [info]);

  // Group services by day
  const servicesByDay = useMemo(() => {
    const grouped: Record<number, ScheduledService[]> = {};
    for (let d = 0; d < 7; d++) grouped[d] = [];
    services.forEach((s) => {
      if (grouped[s.dayOfWeek]) grouped[s.dayOfWeek].push(s);
    });
    return grouped;
  }, [services]);

  function addService(dayOfWeek: number) {
    setServices((prev) => [
      ...prev,
      { type: "mass", name: "", dayOfWeek, time: "8:00 AM", durationMin: 60 },
    ]);
  }

  function removeService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  function updateService(globalIndex: number, field: keyof ScheduledService, value: any) {
    setServices((prev) =>
      prev.map((s, i) => (i === globalIndex ? { ...s, [field]: value } : s))
    );
  }

  function getGlobalIndex(dayOfWeek: number, localIndex: number): number {
    let count = 0;
    for (let i = 0; i < services.length; i++) {
      if (services[i].dayOfWeek === dayOfWeek) {
        if (count === localIndex) return i;
        count++;
      }
    }
    return -1;
  }

  function addHolyDay() {
    setHolyDays((prev) => [...prev, { month: 1, day: 1, name: "", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] }]);
  }

  function removeHolyDay(index: number) {
    setHolyDays((prev) => prev.filter((_, i) => i !== index));
  }

  function updateHolyDay(index: number, field: keyof HolyDay, value: any) {
    setHolyDays((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
  }

  function handleSaveSchedule() {
    // Validate all times
    const invalid = services.filter((s) => !validateTime(s.time));
    if (invalid.length > 0) {
      toast.error(`Invalid time format on ${invalid.length} service(s). Use "H:MM AM/PM" format.`);
      return;
    }
    const invalidHD = holyDays.filter((h) => h.massTimes.some(t => !validateTime(t)));
    if (invalidHD.length > 0) {
      toast.error(`Invalid time format on ${invalidHD.length} holy day(s). Use "H:MM AM/PM" format.`);
      return;
    }
    const payload: ParishSchedule = { services, holyDays };
    updateSchedule.mutate({ schedule: payload });
  }

  function handleSaveInfo() {
    if (!parishInfo) return;
    updateInfo.mutate({ info: parishInfo });
  }

  if (schedLoading || infoLoading) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading parish schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mass Schedule & Parish Info</h1>
        <p className="text-muted-foreground mt-1">
          Edit service times and parish information. Changes go live immediately — no code deploy needed.
        </p>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">
            <Clock className="w-4 h-4 mr-1.5" /> Schedule
          </TabsTrigger>
          <TabsTrigger value="holydays">
            <Clock className="w-4 h-4 mr-1.5" /> Holy Days
          </TabsTrigger>
          <TabsTrigger value="info">
            <MapPin className="w-4 h-4 mr-1.5" /> Parish Info
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-1.5" /> Preview
          </TabsTrigger>
        </TabsList>

        {/* ─── SCHEDULE TAB ─── */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Add, edit, or remove Mass, Confession, Prayer, and Adoration services by day of week.
            </p>
            <Button onClick={handleSaveSchedule} disabled={updateSchedule.isPending}>
              <Save className="w-4 h-4 mr-1.5" />
              {updateSchedule.isPending ? "Saving…" : "Save Schedule"}
            </Button>
          </div>

          {DAY_NAMES.map((dayName, dayIndex) => (
            <Card key={dayIndex}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{dayName}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => addService(dayIndex)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {servicesByDay[dayIndex].length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No services scheduled</p>
                )}
                {servicesByDay[dayIndex].map((service, localIdx) => {
                  const globalIdx = getGlobalIndex(dayIndex, localIdx);
                  return (
                    <div key={localIdx} className="flex flex-wrap items-end gap-2 p-3 bg-muted/50 rounded-lg">
                      <div className="w-28">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={service.type}
                          onValueChange={(v) => updateService(globalIdx, "type", v)}
                        >
                          <SelectTrigger className="h-8 text-xs" aria-label={`Service type for ${dayName} service ${localIdx + 1}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <Label className="text-xs">Name</Label>
                        <Input
                          className="h-8 text-xs"
                          value={service.name}
                          onChange={(e) => updateService(globalIdx, "name", e.target.value)}
                          placeholder="e.g. Vigil Mass"
                          aria-label={`Service name for ${dayName} service ${localIdx + 1}`}
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs">Time</Label>
                        <Input
                          className={`h-8 text-xs ${!validateTime(service.time) && service.time ? "border-red-500" : ""}`}
                          value={service.time}
                          onChange={(e) => updateService(globalIdx, "time", e.target.value)}
                          placeholder="5:30 PM"
                          aria-label={`Service time for ${dayName} service ${localIdx + 1}`}
                        />
                      </div>
                      <div className="w-20">
                        <Label className="text-xs">Duration</Label>
                        <Input
                          className="h-8 text-xs"
                          type="number"
                          value={service.durationMin}
                          onChange={(e) => updateService(globalIdx, "durationMin", parseInt(e.target.value) || 0)}
                          placeholder="60"
                          aria-label={`Duration in minutes for ${dayName} service ${localIdx + 1}`}
                        />
                      </div>
                      <div className="w-32">
                        <Label className="text-xs">Seasonal</Label>
                        <Input
                          className="h-8 text-xs"
                          value={service.seasonal?.note || ""}
                          onChange={(e) => {
                            const note = e.target.value;
                            if (note) {
                              updateService(globalIdx, "seasonal", {
                                months: service.seasonal?.months || [1,2,3,4,5,6,7,8,9,10,11,12],
                                note,
                              });
                            } else {
                              updateService(globalIdx, "seasonal", undefined);
                            }
                          }}
                          placeholder="e.g. Oct–Jun"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeService(globalIdx)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ─── HOLY DAYS TAB ─── */}
        <TabsContent value="holydays" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Manage Holy Days of Obligation and their Mass times.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addHolyDay}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Holy Day
              </Button>
              <Button onClick={handleSaveSchedule} disabled={updateSchedule.isPending}>
                <Save className="w-4 h-4 mr-1.5" />
                {updateSchedule.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-4 space-y-3">
              {holyDays.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No holy days configured</p>
              )}
              {holyDays.map((hd, idx) => (
                <div key={idx} className="flex flex-wrap items-end gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className="w-20">
                    <Label className="text-xs">Month</Label>
                    <Select
                      value={String(hd.month)}
                      onValueChange={(v) => updateHolyDay(idx, "month", parseInt(v))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_NAMES.map((m, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-16">
                    <Label className="text-xs">Day</Label>
                    <Input
                      className="h-8 text-xs"
                      type="number"
                      min={1}
                      max={31}
                      value={hd.day}
                      onChange={(e) => updateHolyDay(idx, "day", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <Label className="text-xs">Name</Label>
                    <Input
                      className="h-8 text-xs"
                      value={hd.name}
                      onChange={(e) => updateHolyDay(idx, "name", e.target.value)}
                      placeholder="e.g. Immaculate Conception"
                    />
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <Label className="text-xs">Mass Times (comma-separated)</Label>
                    <Input
                      className={`h-8 text-xs ${hd.massTimes.some(t => !validateTime(t)) ? "border-red-500" : ""}`}
                      value={hd.massTimes.join(", ")}
                      onChange={(e) => updateHolyDay(idx, "massTimes", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                      placeholder="8:30 AM, 12:10 PM, 7:30 PM"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => removeHolyDay(idx)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── PARISH INFO TAB ─── */}
        <TabsContent value="info" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Edit parish contact info, address, and links. Used site-wide in SEO, footer, and assistant.
            </p>
            <Button onClick={handleSaveInfo} disabled={updateInfo.isPending}>
              <Save className="w-4 h-4 mr-1.5" />
              {updateInfo.isPending ? "Saving…" : "Save Info"}
            </Button>
          </div>

          {parishInfo && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location & Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="pi-name">Parish Name</Label>
                    <Input id="pi-name" value={parishInfo.name} onChange={(e) => setParishInfo({ ...parishInfo, name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="pi-address">Address</Label>
                    <Input id="pi-address" value={parishInfo.address} onChange={(e) => setParishInfo({ ...parishInfo, address: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="pi-city">City</Label>
                      <Input id="pi-city" value={parishInfo.city} onChange={(e) => setParishInfo({ ...parishInfo, city: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="pi-state">State</Label>
                      <Input id="pi-state" value={parishInfo.state} onChange={(e) => setParishInfo({ ...parishInfo, state: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="pi-zip">ZIP</Label>
                      <Input id="pi-zip" value={parishInfo.zip} onChange={(e) => setParishInfo({ ...parishInfo, zip: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pi-phone">Phone</Label>
                    <Input id="pi-phone" value={parishInfo.phone} onChange={(e) => setParishInfo({ ...parishInfo, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="pi-email">Office Email</Label>
                    <Input id="pi-email" value={parishInfo.officeEmail} onChange={(e) => setParishInfo({ ...parishInfo, officeEmail: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="pi-hours">Office Hours</Label>
                    <Input id="pi-hours" value={parishInfo.officeHours} onChange={(e) => setParishInfo({ ...parishInfo, officeHours: e.target.value })} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Pastor & Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="pi-pastor">Pastor Name</Label>
                    <Input id="pi-pastor" value={parishInfo.pastorName} onChange={(e) => setParishInfo({ ...parishInfo, pastorName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="pi-pastor-email">Pastor Email</Label>
                    <Input id="pi-pastor-email" value={parishInfo.pastorEmail} onChange={(e) => setParishInfo({ ...parishInfo, pastorEmail: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="pi-flocknote">Flocknote URL</Label>
                    <Input id="pi-flocknote" value={parishInfo.flocknoteUrl} onChange={(e) => setParishInfo({ ...parishInfo, flocknoteUrl: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="pi-youtube">YouTube URL</Label>
                    <Input id="pi-youtube" value={parishInfo.youtubeUrl} onChange={(e) => setParishInfo({ ...parishInfo, youtubeUrl: e.target.value })} />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="pi-lat">Latitude</Label>
                      <Input
                        id="pi-lat"
                        type="number"
                        step="0.0001"
                        value={parishInfo.mapCoordinates.lat}
                        onChange={(e) => setParishInfo({
                          ...parishInfo,
                          mapCoordinates: { ...parishInfo.mapCoordinates, lat: parseFloat(e.target.value) || 0 },
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pi-lng">Longitude</Label>
                      <Input
                        id="pi-lng"
                        type="number"
                        step="0.0001"
                        value={parishInfo.mapCoordinates.lng}
                        onChange={(e) => setParishInfo({
                          ...parishInfo,
                          mapCoordinates: { ...parishInfo.mapCoordinates, lng: parseFloat(e.target.value) || 0 },
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ─── PREVIEW TAB ─── */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live Preview</CardTitle>
              <CardDescription>
                This shows how the schedule appears to parishioners right now (from the saved data).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchedulePreview />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Preview component that renders the schedule exactly as parishioners see it */
function SchedulePreview() {
  const { data: schedule } = trpc.parishSchedule.getSchedule.useQuery();
  const { data: info } = trpc.parishSchedule.getInfo.useQuery();

  if (!schedule || !info) return <p className="text-muted-foreground">Loading preview…</p>;

  const servicesByDay: Record<number, ScheduledService[]> = {};
  for (let d = 0; d < 7; d++) servicesByDay[d] = [];
  schedule.services.forEach((s) => {
    if (servicesByDay[s.dayOfWeek]) servicesByDay[s.dayOfWeek].push(s);
  });

  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">Parish Info (as shown in SEO & footer)</h3>
        <p className="text-sm">{info.name}</p>
        <p className="text-sm text-muted-foreground">{info.address}, {info.city}, {info.state} {info.zip}</p>
        <p className="text-sm text-muted-foreground">{info.phone} · {info.officeEmail}</p>
        <p className="text-sm text-muted-foreground">Office: {info.officeHours}</p>
        <p className="text-sm text-muted-foreground">Pastor: {info.pastorName}</p>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3">Weekly Schedule</h3>
        <div className="grid gap-3">
          {DAY_NAMES.map((dayName, dayIndex) => {
            const dayServices = servicesByDay[dayIndex];
            if (dayServices.length === 0) return null;
            return (
              <div key={dayIndex} className="flex gap-3">
                <span className="text-sm font-medium w-24 shrink-0">{dayName}</span>
                <div className="flex flex-wrap gap-1.5">
                  {dayServices.map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {s.name || s.type} · {s.time}
                      {s.seasonal && <span className="ml-1 opacity-60">({s.seasonal.note})</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {schedule.holyDays.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Holy Days of Obligation</h3>
          <div className="flex flex-wrap gap-1.5">
            {schedule.holyDays.map((hd, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {MONTH_NAMES[hd.month - 1]} {hd.day} — {hd.name} ({hd.massTimes.join(", ")})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
