/**
 * Dashboard Activity Feed — Recent form submissions and quick actions.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Newspaper, BookOpen, Users, Camera, Calendar, Heart,
  UserPlus, Cross, GraduationCap, Bell,
  Baby, HeartHandshake, Church, ShieldCheck,
} from "lucide-react";

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Bell; color: string; bgColor: string }> = {
  baptism: { label: "Baptism", icon: Baby, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  marriage: { label: "Marriage", icon: HeartHandshake, color: "text-rose-600", bgColor: "bg-rose-50" },
  ccd: { label: "CCD Registration", icon: GraduationCap, color: "text-amber-600", bgColor: "bg-amber-50" },
  parish_registration: { label: "Parish Registration", icon: Church, color: "text-green-700", bgColor: "bg-green-50" },
  teen_life: { label: "Teen Life", icon: Users, color: "text-orange-600", bgColor: "bg-orange-50" },
  ccd_permission: { label: "CCD Permission", icon: ShieldCheck, color: "text-purple-600", bgColor: "bg-purple-50" },
};

function timeAgo(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

interface ActivityItem {
  id: number;
  type: string;
  name: string;
  status: string;
  createdAt: string | Date | null;
}

interface ActivityFeedProps {
  activity: ActivityItem[] | undefined;
  isLoading: boolean;
}

export function ActivityFeed({ activity, isLoading }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Recent Form Submissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : activity && activity.length > 0 ? (
          <div className="space-y-1">
            {activity.map((item, i) => {
              const config = TYPE_CONFIG[item.type] || { label: item.type, icon: Bell, color: "text-gray-600", bgColor: "bg-gray-50" };
              const Icon = config.icon;
              return (
                <div key={`${item.type}-${item.id}-${i}`} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}><Icon className={`w-4 h-4 ${config.color}`} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.status === "pending" && <Badge variant="outline" className="text-xs px-1.5 py-0 border-amber-300 text-amber-700 bg-amber-50">Pending</Badge>}
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{timeAgo(item.createdAt!)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No form submissions yet. They'll appear here as parishioners submit forms.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function QuickActions() {
  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <QuickAction href="/news" icon={Newspaper} label="Create News Post" description="Publish an announcement" />
        <QuickAction href="/gallery" icon={Camera} label="Upload Photos" description="Add to the photo gallery" />
        <QuickAction href="/events" icon={Calendar} label="Add Event" description="Schedule a parish event" />
        <QuickAction href="/bulletins" icon={BookOpen} label="Upload Bulletin" description="Post this week's bulletin" />
        <QuickAction href="/key-dates" icon={Calendar} label="Manage Key Dates" description="Update important dates" />
        <QuickAction href="/users" icon={Users} label="Manage Staff" description="Assign department roles" />
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, description }: { href: string; icon: typeof Newspaper; label: string; description: string }) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"><Icon className="w-5 h-5 text-primary" /></div>
          <div><p className="font-medium text-sm">{label}</p><p className="text-xs text-muted-foreground">{description}</p></div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function StatCard({ icon: Icon, label, value, href, color, highlight }: { icon: typeof Newspaper; label: string; value: number; href: string; color: string; highlight?: boolean }) {
  return (
    <Link href={href}>
      <Card className={`cursor-pointer hover:shadow-md transition-shadow ${highlight ? "border-amber-300 bg-amber-50/30" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Icon className={`w-4 h-4 ${color}`} /><span className="text-xs text-muted-foreground font-medium uppercase tracking-wide leading-tight">{label}</span></div>
          <p className="text-2xl font-bold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
