/**
 * Admin: Audit Log Viewer
 * Shows a chronological record of admin actions for accountability.
 */
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, User, Clock } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  activate: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  deactivate: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  update: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  create: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  delete: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  approve: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  reject: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

function formatEntityType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AuditLog() {
  const { data: logs, isLoading } = trpc.siteSettings.auditLog.useQuery({ limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="w-6 h-6" />
          Audit Log
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Recent admin actions across the site
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Loading audit history...
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No actions recorded yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Admin actions will appear here as they happen
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {log.userName || "Admin"}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${ACTION_COLORS[log.action] || ""}`}
                        >
                          {log.action}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {formatEntityType(log.entityType)}
                        </Badge>
                      </div>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {(() => {
                            try {
                              const d = JSON.parse(log.details);
                              return Object.entries(d)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ");
                            } catch {
                              return log.details;
                            }
                          })()}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
