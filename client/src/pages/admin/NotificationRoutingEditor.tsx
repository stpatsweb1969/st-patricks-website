import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Save, RotateCcw } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  sacraments: "Sacraments (Baptism, Marriage, Funeral, Mass Intentions)",
  ccd_registrations: "CCD Registrations",
  ccd_permissions: "CCD Permission Forms",
  teen_life: "Teen Life",
  cyo: "CYO / Gym",
  volunteers: "Volunteer Signups",
  registrations: "Parish Registrations",
};

export default function NotificationRoutingEditor() {
  const { data: config, isLoading } = trpc.siteSettings.getNotificationRouting.useQuery();
  const updateRouting = trpc.siteSettings.updateNotificationRouting.useMutation();
  const utils = trpc.useUtils();

  const [catchall, setCatchall] = useState("");
  const [bySection, setBySection] = useState<Record<string, string>>({});

  useEffect(() => {
    if (config) {
      setCatchall(config.catchall);
      setBySection(config.bySection as Record<string, string>);
    }
  }, [config]);

  const handleSave = async () => {
    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(catchall)) {
      toast.error("Catch-all email is invalid");
      return;
    }
    for (const [section, email] of Object.entries(bySection)) {
      if (email && !emailRegex.test(email)) {
        toast.error(`Invalid email for ${SECTION_LABELS[section] || section}`);
        return;
      }
    }

    try {
      await updateRouting.mutateAsync({ catchall, bySection });
      utils.siteSettings.getNotificationRouting.invalidate();
      toast.success("Notification routing saved!");
    } catch {
      toast.error("Failed to save routing config");
    }
  };

  const handleReset = () => {
    if (config) {
      setCatchall(config.catchall);
      setBySection(config.bySection as Record<string, string>);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Notification Routing
        </CardTitle>
        <CardDescription>
          When a form is submitted, the notification email goes to the section recipient below.
          The catch-all address is always BCC'd. If a section has no recipient, the catch-all receives it directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Catch-all */}
        <div>
          <label htmlFor="catchall" className="text-sm font-medium mb-1.5 block">
            Catch-All (BCC on every submission)
          </label>
          <Input
            id="catchall"
            type="email"
            value={catchall}
            onChange={(e) => setCatchall(e.target.value)}
            placeholder="office@stpatrickinarmonk.org"
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This address always receives a copy. If a section isn't mapped, it gets the primary copy too.
          </p>
        </div>

        {/* Per-section routing */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Section Recipients</h3>
          {Object.entries(SECTION_LABELS).map(([key, label]) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label htmlFor={`section-${key}`} className="text-sm min-w-[280px] text-muted-foreground">
                {label}
              </label>
              <Input
                id={`section-${key}`}
                type="email"
                value={bySection[key] || ""}
                onChange={(e) => setBySection((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={catchall || "office@stpatrickinarmonk.org"}
                className="max-w-sm"
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={updateRouting.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {updateRouting.isPending ? "Saving..." : "Save Routing"}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
