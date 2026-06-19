/**
 * Admin: Announcement Composer
 * Multi-channel broadcast composer — push notifications, email list, homepage banner.
 * Supports custom title, body, optional link URL, channel selection, and audience segment.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Megaphone, Send, Users, Loader2, Bell, AlertTriangle, Mail, Monitor } from "lucide-react";

const TEMPLATES = [
  { id: "custom", label: "Custom Message", title: "", body: "", category: "general" },
  { id: "mass_change", label: "Mass Time Change", title: "Mass Schedule Update", body: "Please note a change to our Mass schedule this week.", category: "mass" },
  { id: "event_reminder", label: "Event Reminder", title: "Upcoming Event", body: "Don't miss our upcoming parish event!", category: "event" },
  { id: "bulletin_ready", label: "Bulletin Published", title: "This Week's Bulletin", body: "The weekly bulletin is now available online.", category: "bulletin" },
  { id: "urgent", label: "Urgent Notice", title: "Important Notice", body: "Please read this important update from St. Patrick's.", category: "urgent" },
];

export function AnnouncementComposer() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [template, setTemplate] = useState("custom");
  const [confirmSend, setConfirmSend] = useState(false);
  const [channels, setChannels] = useState({ push: true, email: false, banner: false });
  const [segment, setSegment] = useState<"all" | "bulletins" | "news">("all");

  const { data: pushCount } = trpc.pushNotifications.getCount.useQuery();
  const sendAnnouncement = trpc.pushNotifications.broadcast.useMutation({
    onSuccess: (data) => {
      const parts: string[] = [];
      if (data.pushSent > 0) parts.push(`${data.pushSent} push`);
      if (data.emailSent > 0) parts.push(`${data.emailSent} email`);
      if (channels.banner) parts.push("banner set");
      toast.success(`Announcement delivered: ${parts.join(", ") || "no channels selected"}`);
      setTitle("");
      setBody("");
      setUrl("");
      setTemplate("custom");
      setConfirmSend(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send announcement");
      setConfirmSend(false);
    },
  });

  const handleTemplateChange = (id: string) => {
    setTemplate(id);
    const t = TEMPLATES.find((t) => t.id === id);
    if (t && id !== "custom") {
      setTitle(t.title);
      setBody(t.body);
    }
  };

  const noChannelSelected = !channels.push && !channels.email && !channels.banner;

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (noChannelSelected) {
      toast.error("Select at least one delivery channel");
      return;
    }
    if (!confirmSend) {
      setConfirmSend(true);
      return;
    }
    sendAnnouncement.mutate({
      title: title.trim(),
      body: body.trim(),
      url: url.trim() || undefined,
      channels,
      segment,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="w-6 h-6" />
          Announcement Composer
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Broadcast announcements via push, email, and homepage banner
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Compose Broadcast
            </span>
            <Badge variant="secondary" className="gap-1">
              <Users className="w-3 h-3" />
              {pushCount?.count ?? 0} push subscribers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="template-select">Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger id="template-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="announcement-title">Title</Label>
            <Input
              id="announcement-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title..."
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/100
            </p>
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="announcement-body">Message</Label>
            <Textarea
              id="announcement-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your announcement..."
              rows={4}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">
              {body.length}/300
            </p>
          </div>

          {/* URL (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="announcement-url">Link URL (optional)</Label>
            <Input
              id="announcement-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/mass-times or https://..."
            />
            <p className="text-xs text-muted-foreground">
              Where should the notification link to when tapped?
            </p>
          </div>

          {/* Delivery Channels */}
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-sm font-medium">Delivery Channels</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                <Checkbox
                  checked={channels.push}
                  onCheckedChange={(v) => setChannels((c) => ({ ...c, push: !!v }))}
                />
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Push — all subscribers</span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                <Checkbox
                  checked={channels.email}
                  onCheckedChange={(v) => setChannels((c) => ({ ...c, email: !!v }))}
                />
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Email List</span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                <Checkbox
                  checked={channels.banner}
                  onCheckedChange={(v) => setChannels((c) => ({ ...c, banner: !!v }))}
                />
                <Monitor className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Homepage Banner</span>
              </label>
            </div>
          </div>

          {/* Audience Segment (for email) */}
          {channels.email && (
            <div className="space-y-1.5">
              <Label htmlFor="segment-select">Email Audience</Label>
              <Select value={segment} onValueChange={(v) => setSegment(v as typeof segment)}>
                <SelectTrigger id="segment-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Active Subscribers</SelectItem>
                  <SelectItem value="bulletins">Bulletin Subscribers</SelectItem>
                  <SelectItem value="news">News Subscribers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Send Button */}
          <div className="flex items-center justify-between pt-2 border-t">
            {confirmSend && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  Sending via {[channels.push && "push", channels.email && "email", channels.banner && "banner"].filter(Boolean).join(" + ")}. Click again to confirm.
                </span>
              </div>
            )}
            {!confirmSend && <div />}
            <div className="flex gap-2">
              {confirmSend && (
                <Button
                  variant="outline"
                  onClick={() => setConfirmSend(false)}
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSend}
                disabled={!title.trim() || !body.trim() || noChannelSelected || sendAnnouncement.isPending}
                className={confirmSend ? "bg-amber-600 hover:bg-amber-700" : ""}
              >
                {sendAnnouncement.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {confirmSend ? "Confirm Send" : "Send Announcement"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnnouncementComposer;
