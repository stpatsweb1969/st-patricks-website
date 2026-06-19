/**
 * ClosureAlertBanner — Site-wide banner shown when admin activates a closure alert.
 * Displays prominently at the top of the page with type-specific styling.
 */
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CloudLightning, ShieldAlert, Info, X } from "lucide-react";
import { useState } from "react";

const typeConfig = {
  weather: {
    icon: CloudLightning,
    bg: "bg-red-600",
    text: "text-white",
    label: "Weather Alert",
  },
  emergency: {
    icon: ShieldAlert,
    bg: "bg-red-700",
    text: "text-white",
    label: "Emergency",
  },
  custom: {
    icon: Info,
    bg: "bg-amber-600",
    text: "text-white",
    label: "Notice",
  },
};

export function ClosureAlertBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data: alert } = trpc.closureAlert.get.useQuery(undefined, {
    staleTime: 60 * 1000, // Check every minute
    refetchInterval: 60 * 1000,
  });

  if (!alert?.active || dismissed) return null;

  const config = typeConfig[alert.type] || typeConfig.custom;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`${config.bg} ${config.text} relative z-50`}
    >
      <div className="container py-3 flex items-center gap-3">
        <Icon className="w-5 h-5 shrink-0 animate-pulse" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm sm:text-base">
            {alert.title}
          </p>
          <p className="text-xs sm:text-sm opacity-90 mt-0.5">
            {alert.message}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-md hover:bg-white/20 transition-colors shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
