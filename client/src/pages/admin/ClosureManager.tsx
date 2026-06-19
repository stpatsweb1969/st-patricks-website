/**
 * ClosureManager — Admin one-tap severe weather / emergency closure panel.
 * Allows admin to activate/deactivate closure alerts with push notifications.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CloudLightning, ShieldAlert, Info, Power, PowerOff, CloudSnow, Thermometer } from "lucide-react";
import { toast } from "sonner";

const presets = [
  {
    type: "weather" as const,
    title: "Parish Closed — Severe Weather",
    message: "All Masses and activities are cancelled today due to severe weather. Stay safe.",
    icon: CloudLightning,
    label: "Severe Weather",
  },
  {
    type: "weather" as const,
    title: "Delayed Opening — Winter Storm",
    message: "Morning Mass cancelled. Parish office opens at 10 AM. Evening activities proceed as scheduled.",
    icon: CloudLightning,
    label: "Winter Storm",
  },
  {
    type: "emergency" as const,
    title: "Parish Closed — Emergency",
    message: "The parish is temporarily closed. Please check back for updates.",
    icon: ShieldAlert,
    label: "Emergency",
  },
];

export function ClosureManager() {
  const utils = trpc.useUtils();
  const { data: alert, isLoading } = trpc.closureAlert.get.useQuery();
  const { data: pushCount } = trpc.pushNotifications.getCount.useQuery();
  const { data: forecast } = trpc.weather.daily.useQuery();

  // Weather-aware closure suggestion
  const weatherSuggestion = useMemo(() => {
    if (!forecast || !Array.isArray(forecast)) return null;
    // Check next 2 days for severe conditions
    for (const day of forecast.slice(0, 2)) {
      const code = day.weatherCode;
      // WMO codes: 71-77 = snow, 85-86 = snow showers, 66-67 = freezing rain
      // 95-99 = thunderstorm, 56-57 = freezing drizzle
      const isSnow = code >= 71 && code <= 77 || code >= 85 && code <= 86;
      const isFreezingRain = code >= 66 && code <= 67 || code >= 56 && code <= 57;
      const isThunderstorm = code >= 95 && code <= 99;
      const isExtremeCold = day.low <= 10; // 10°F or below
      if (isSnow || isFreezingRain || isThunderstorm || isExtremeCold) {
        const dateStr = new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        let reason = "";
        if (isSnow) reason = `Snow expected (${day.description})`;
        else if (isFreezingRain) reason = `Freezing rain/drizzle expected`;
        else if (isThunderstorm) reason = `Severe thunderstorm expected`;
        else if (isExtremeCold) reason = `Extreme cold (low: ${day.low}°F)`;
        return { date: dateStr, reason, high: day.high, low: day.low, precipChance: day.precipProbabilityMax };
      }
    }
    return null;
  }, [forecast]);

  const [type, setType] = useState<"weather" | "emergency" | "custom">("weather");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  const activateMutation = trpc.closureAlert.activate.useMutation({
    onSuccess: (data) => {
      toast.success(`Closure alert activated. Push sent to ${data.pushSent} subscribers.`);
      utils.closureAlert.get.invalidate();
      setConfirming(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deactivateMutation = trpc.closureAlert.deactivate.useMutation({
    onSuccess: () => {
      toast.success("Closure alert deactivated.");
      utils.closureAlert.get.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handlePreset = (preset: typeof presets[0]) => {
    setType(preset.type);
    setTitle(preset.title);
    setMessage(preset.message);
    setConfirming(true);
  };

  const handleActivate = () => {
    if (!title || !message) {
      toast.error("Please fill in title and message");
      return;
    }
    activateMutation.mutate({ type, title, message });
  };

  if (isLoading) return (
    <div className="text-center py-12">
      <div className="mx-auto w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3 animate-pulse">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
      </div>
      <p className="text-sm text-muted-foreground">Checking alert status...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Closure Alert System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Current Status:{" "}
                {alert?.active ? (
                  <Badge variant="destructive" className="ml-1">ACTIVE</Badge>
                ) : (
                  <Badge variant="secondary" className="ml-1">Inactive</Badge>
                )}
              </p>
              {alert?.active && (
                <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="font-bold text-red-800 dark:text-red-200">{alert.title}</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{alert.message}</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Activated: {new Date(alert.activatedAt).toLocaleString()}
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Push subscribers: {pushCount?.count ?? 0}
              </p>
            </div>
            {alert?.active && (
              <Button
                variant="outline"
                onClick={() => deactivateMutation.mutate()}
                disabled={deactivateMutation.isPending}
                className="border-green-500 text-green-700 hover:bg-green-50"
              >
                <PowerOff className="w-4 h-4 mr-1" />
                Deactivate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weather Suggestion */}
      {!alert?.active && weatherSuggestion && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                <CloudSnow className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-blue-900 dark:text-blue-100">Weather Advisory</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
                  {weatherSuggestion.reason} on {weatherSuggestion.date}.
                  {weatherSuggestion.precipChance > 60 && ` ${weatherSuggestion.precipChance}% precipitation chance.`}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-blue-600 dark:text-blue-400">
                  <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" />High {weatherSuggestion.high}° / Low {weatherSuggestion.low}°</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => {
                    setType("weather");
                    setTitle("Parish Closed — Severe Weather");
                    setMessage(`All Masses and activities are cancelled on ${weatherSuggestion.date} due to ${weatherSuggestion.reason.toLowerCase()}. Stay safe.`);
                    setConfirming(true);
                  }}
                >
                  Consider Closure for {weatherSuggestion.date}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Presets */}
      {!alert?.active && !confirming && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Activate (One Tap)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {presets.map((preset, i) => {
              const Icon = preset.icon;
              return (
                <button
                  key={i}
                  onClick={() => handlePreset(preset)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <Icon className="w-5 h-5 text-red-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{preset.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{preset.message}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">{preset.label}</Badge>
                </button>
              );
            })}
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setType("custom");
                  setTitle("");
                  setMessage("");
                  setConfirming(true);
                }}
              >
                <Info className="w-3.5 h-3.5 mr-1" />
                Custom Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation / Custom Form */}
      {!alert?.active && confirming && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-base text-red-700 dark:text-red-300">
              Confirm Closure Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="closure-title" className="text-sm font-medium">Title</label>
              <Input
                id="closure-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Parish Closed — Severe Weather"
              />
            </div>
            <div>
              <label htmlFor="closure-message" className="text-sm font-medium">Message</label>
              <Textarea
                id="closure-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., All Masses and activities are cancelled today..."
                rows={3}
              />
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
              This will immediately show a banner on the website and send a push notification to {pushCount?.count ?? 0} subscriber(s).
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleActivate}
                disabled={activateMutation.isPending}
              >
                <Power className="w-4 h-4 mr-1" />
                {activateMutation.isPending ? "Activating..." : "Activate Alert"}
              </Button>
              <Button variant="outline" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
