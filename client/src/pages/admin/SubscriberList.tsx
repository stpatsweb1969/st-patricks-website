import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Trash2, Edit, FileText, Upload, Users, Shield } from "lucide-react";

export function SubscriberList() {
  const { data: subscribers, isLoading } = trpc.subscriptions.listAll.useQuery();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Email Subscribers</h2>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : subscribers && subscribers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-secondary/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Email</th>
                    <th className="text-left p-3 text-sm font-medium">Name</th>
                    <th className="text-center p-3 text-sm font-medium">Bulletins</th>
                    <th className="text-center p-3 text-sm font-medium">News</th>
                    <th className="text-center p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Subscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b last:border-0">
                      <td className="p-3 text-sm">{sub.email}</td>
                      <td className="p-3 text-sm text-muted-foreground">{sub.name || "—"}</td>
                      <td className="p-3 text-center">
                        <Badge variant={sub.subscribedToBulletins ? "default" : "secondary"} className="text-xs">
                          {sub.subscribedToBulletins ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={sub.subscribedToNews ? "default" : "secondary"} className="text-xs">
                          {sub.subscribedToNews ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={sub.active ? "default" : "destructive"} className="text-xs">
                          {sub.active ? "Active" : "Unsubscribed"}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {format(new Date(sub.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No subscribers yet. Parishioners can subscribe from the homepage.</p>
        </Card>
      )}
    </div>
  );
}

