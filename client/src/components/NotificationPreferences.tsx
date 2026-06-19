/**
 * NotificationPreferences — let users choose which push categories they receive.
 * Shows after push is granted, or in a settings sheet.
 */
import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Church, Newspaper, CloudLightning, Calendar, Megaphone } from "lucide-react";
import { toast } from "sonner";

const PUSH_CATEGORIES = [
  { id: "mass_reminders", label: "Mass Reminders", description: "Sunday Mass time reminders", icon: Church },
  { id: "bulletin", label: "Weekly Bulletin", description: "When a new bulletin is published", icon: Newspaper },
  { id: "closures", label: "Closures & Alerts", description: "Weather closures and emergencies", icon: CloudLightning },
  { id: "events", label: "Parish Events", description: "Upcoming event notifications", icon: Calendar },
  { id: "announcements", label: "Announcements", description: "General parish announcements", icon: Megaphone },
] as const;

export function NotificationPreferences() {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [categories, setCategories] = useState<Set<string>>(new Set(PUSH_CATEGORIES.map(c => c.id)));
  const [isLoading, setIsLoading] = useState(true);

  const categoriesQuery = trpc.pushNotifications.getCategories.useQuery(
    { endpoint: endpoint || "" },
    { enabled: !!endpoint }
  );
  const updateMutation = trpc.pushNotifications.updateCategories.useMutation();

  // Get current subscription endpoint
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setIsLoading(false);
      return;
    }
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) {
          setEndpoint(sub.endpoint);
        }
        setIsLoading(false);
      });
    });
  }, []);

  // Sync categories from server
  useEffect(() => {
    if (categoriesQuery.data?.categories) {
      const cats = categoriesQuery.data.categories.split(",").map(c => c.trim()).filter(Boolean);
      setCategories(new Set(cats));
    }
  }, [categoriesQuery.data]);

  const toggleCategory = useCallback(async (categoryId: string) => {
    if (!endpoint) return;
    const newCats = new Set(categories);
    if (newCats.has(categoryId)) {
      newCats.delete(categoryId);
    } else {
      newCats.add(categoryId);
    }
    setCategories(newCats);

    try {
      await updateMutation.mutateAsync({
        endpoint,
        categories: Array.from(newCats).join(","),
      });
      toast.success("Preferences updated");
    } catch {
      // Revert on error
      setCategories(categories);
      toast.error("Failed to update preferences");
    }
  }, [endpoint, categories, updateMutation]);

  if (isLoading) {
    return null;
  }

  if (!endpoint) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enable push notifications first to customize which updates you receive.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Choose which notifications you'd like to receive:
        </p>
        {PUSH_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.id} className="flex items-center justify-between gap-3 py-1">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <Label htmlFor={`cat-${cat.id}`} className="text-sm font-medium cursor-pointer">
                    {cat.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                </div>
              </div>
              <Switch
                id={`cat-${cat.id}`}
                checked={categories.has(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
                disabled={updateMutation.isPending}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
