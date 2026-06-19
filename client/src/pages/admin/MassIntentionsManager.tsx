/**
 * Admin Mass Intentions Manager — view and manage intention requests.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export function MassIntentionsManager() {
  const [filter, setFilter] = useState<string>("all");
  const { data: intentions, refetch, isLoading, error } = trpc.massIntentions.list.useQuery({ status: filter as any });
  const updateStatus = trpc.massIntentions.updateStatus.useMutation({
    onSuccess: () => { refetch(); toast.success("Intention updated"); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Mass Intentions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage Mass intention requests from parishioners.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 animate-pulse">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading intentions...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="mx-auto w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">Couldn't load intentions</p>
          <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Try Again</Button>
        </div>
      )}

      {!isLoading && !error && !intentions?.length && (
        <div className="text-center py-12 text-muted-foreground">
          <Heart className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No intentions yet</p>
          <p className="text-xs mt-1">When parishioners submit Mass intention requests, they'll appear here for scheduling.</p>
        </div>
      )}

      <div className="grid gap-4">
        {intentions?.map((intention) => (
          <Card key={intention.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{intention.intentionFor}</span>
                    <Badge variant="secondary" className={STATUS_COLORS[intention.status] || ""}>
                      {intention.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {intention.intentionType}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Requested by: {intention.requesterName} ({intention.requesterEmail})
                    {intention.requesterPhone && ` · ${intention.requesterPhone}`}
                  </p>
                  {intention.preferredDate && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Preferred: {intention.preferredDate}
                      {intention.preferredMass && ` · ${intention.preferredMass}`}
                    </p>
                  )}
                  {intention.notes && (
                    <p className="text-xs text-muted-foreground italic">"{intention.notes}"</p>
                  )}
                  {intention.scheduledMass && (
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Scheduled: {intention.scheduledMass}
                      {intention.scheduledDate && ` on ${new Date(intention.scheduledDate).toLocaleDateString()}`}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Submitted {new Date(intention.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {intention.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => updateStatus.mutate({ id: intention.id, status: "scheduled" })}
                      >
                        <Clock className="w-3.5 h-3.5 mr-1" /> Schedule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => updateStatus.mutate({ id: intention.id, status: "cancelled" })}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                  {intention.status === "scheduled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-600"
                      onClick={() => updateStatus.mutate({ id: intention.id, status: "completed" })}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
