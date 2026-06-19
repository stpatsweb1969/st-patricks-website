import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Megaphone, Save } from "lucide-react";
import NotificationRoutingEditor from "./NotificationRoutingEditor";

export default function SettingsManager() {
  const { data: settings, isLoading } = trpc.siteSettings.getAll.useQuery();
  const updateSetting = trpc.siteSettings.update.useMutation();
  const utils = trpc.useUtils();

  const [marqueeText, setMarqueeText] = useState("");
  const [marqueeLink, setMarqueeLink] = useState("");

  useEffect(() => {
    if (settings) {
      const marquee = settings.find((s) => s.key === "marquee_text");
      const link = settings.find((s) => s.key === "marquee_link");
      if (marquee) setMarqueeText(marquee.value);
      if (link) setMarqueeLink(link.value);
    }
  }, [settings]);

  const handleSaveMarquee = async () => {
    try {
      await updateSetting.mutateAsync({ key: "marquee_text", value: marqueeText });
      if (marqueeLink) {
        await updateSetting.mutateAsync({ key: "marquee_link", value: marqueeLink });
      }
      utils.siteSettings.getAll.invalidate();
      utils.siteSettings.get.invalidate();
      toast.success("Announcement bar updated!");
    } catch {
      toast.error("Failed to update setting");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Site Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage site-wide content and announcements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Announcement Bar
          </CardTitle>
          <CardDescription>
            This text scrolls across the top of every page. Keep it short and actionable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Announcement Text</label>
            <Input
              value={marqueeText}
              onChange={(e) => setMarqueeText(e.target.value)}
              placeholder="e.g., New to St. Patrick in Armonk? Register as a Parishioner"
              className="max-w-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This appears in the green scrolling bar at the top of the site.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Link URL (optional)</label>
            <Input
              value={marqueeLink}
              onChange={(e) => setMarqueeLink(e.target.value)}
              placeholder="/parish-registration"
              className="max-w-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Where clicking the announcement takes visitors. Default: /parish-registration
            </p>
          </div>
          <Button onClick={handleSaveMarquee} disabled={updateSetting.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {updateSetting.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <NotificationRoutingEditor />
    </div>
  );
}
