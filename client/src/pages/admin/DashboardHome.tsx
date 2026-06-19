/**
 * Admin Dashboard Home — Thin composition importing from dashboard/.
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Newspaper, Users, Camera, Calendar, Heart,
  UserPlus, Cross, GraduationCap, AlertCircle,
  Megaphone, Check, Pencil, CloudSnow, Thermometer,
  BookOpen, HandHeart, UserCog,
} from "lucide-react";
import { ActivityFeed, QuickActions, StatCard } from "./dashboard/ActivityFeed";
import { useMemo } from "react";

export default function DashboardHome() {
  const { data: stats, isLoading } = trpc.adminStats.overview.useQuery();
  const { data: activity, isLoading: activityLoading } = trpc.adminStats.recentActivity.useQuery();
  const { data: marqueeData } = trpc.siteSettings.get.useQuery({ key: "marquee_text" });
  const utils = trpc.useUtils();
  const updateSetting = trpc.siteSettings.update.useMutation();

  const [editingBanner, setEditingBanner] = useState(false);
  const [bannerText, setBannerText] = useState("");

  useEffect(() => {
    if (marqueeData?.value) setBannerText(marqueeData.value);
  }, [marqueeData]);

  const handleSaveBanner = async () => {
    try {
      await updateSetting.mutateAsync({ key: "marquee_text", value: bannerText });
      utils.siteSettings.get.invalidate();
      setEditingBanner(false);
      toast.success("Announcement banner updated!");
    } catch { toast.error("Failed to update banner"); }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's an overview of your parish.</p>
      </div>

      {/* Pending Actions */}
      {stats && (stats.pendingCcdRegistrations > 0 || stats.pendingParishRegistrations > 0 || stats.pendingBaptisms > 0 || stats.pendingMarriages > 0 || stats.pendingTeenLife > 0 || stats.pendingMassIntentions > 0 || stats.pendingSponsorCerts > 0 || stats.pendingFunerals > 0) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-600" />Pending Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.pendingCcdRegistrations > 0 && <Link href="/ccd"><Badge variant="outline" className="cursor-pointer hover:bg-amber-100 border-amber-300">{stats.pendingCcdRegistrations} CCD Registration{stats.pendingCcdRegistrations > 1 ? "s" : ""}</Badge></Link>}
              {stats.pendingParishRegistrations > 0 && <Link href="/registrations"><Badge variant="outline" className="cursor-pointer hover:bg-amber-100 border-amber-300">{stats.pendingParishRegistrations} Parish Registration{stats.pendingParishRegistrations > 1 ? "s" : ""}</Badge></Link>}
              {stats.pendingBaptisms > 0 && <Link href="/sacraments"><Badge variant="outline" className="cursor-pointer hover:bg-amber-100 border-amber-300">{stats.pendingBaptisms} Baptism Request{stats.pendingBaptisms > 1 ? "s" : ""}</Badge></Link>}
              {stats.pendingMarriages > 0 && <Link href="/sacraments"><Badge variant="outline" className="cursor-pointer hover:bg-amber-100 border-amber-300">{stats.pendingMarriages} Marriage Inquir{stats.pendingMarriages > 1 ? "ies" : "y"}</Badge></Link>}
              {stats.pendingTeenLife > 0 && <Link href="/teen-life"><Badge variant="outline" className="cursor-pointer hover:bg-amber-100 border-amber-300">{stats.pendingTeenLife} Teen Life Registration{stats.pendingTeenLife > 1 ? "s" : ""}</Badge></Link>}
              {stats.pendingMassIntentions > 0 && <Link href="/mass-intentions"><Badge variant="outline" className="cursor-pointer hover:bg-amber-100 border-amber-300">{stats.pendingMassIntentions} Mass Intention{stats.pendingMassIntentions > 1 ? "s" : ""}</Badge></Link>}
              {stats.pendingSponsorCerts > 0 && <Link href="/sacraments"><Badge variant="outline" className="cursor-pointer hover:bg-amber-100 border-amber-300">{stats.pendingSponsorCerts} Sponsor Cert{stats.pendingSponsorCerts > 1 ? "s" : ""}</Badge></Link>}
              {stats.pendingFunerals > 0 && <Link href="/sacraments"><Badge variant="outline" className="cursor-pointer hover:bg-amber-100 border-amber-300">{stats.pendingFunerals} Funeral Request{stats.pendingFunerals > 1 ? "s" : ""}</Badge></Link>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Closure Suggestion */}
      <WeatherClosureSuggestion />

      {/* Announcement Banner */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Megaphone className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Announcement Banner</span></div>
          {editingBanner ? (
            <div className="flex items-center gap-2">
              <Input value={bannerText} onChange={(e) => setBannerText(e.target.value)} placeholder="Enter announcement text..." className="flex-1 text-sm" onKeyDown={(e) => e.key === "Enter" && handleSaveBanner()} />
              <Button size="sm" onClick={handleSaveBanner} disabled={updateSetting.isPending}><Check className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="outline" onClick={() => { setEditingBanner(false); setBannerText(marqueeData?.value || ""); }}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground flex-1 truncate">{marqueeData?.value || "No announcement set"}</p>
              <Button size="sm" variant="outline" onClick={() => setEditingBanner(true)}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-8 w-12" /></CardContent></Card>)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={Newspaper} label="News Posts" value={stats.totalNews} href="/news" color="text-blue-600" />
          <StatCard icon={Calendar} label="Events" value={stats.totalEvents} href="/events" color="text-green-600" />
          <StatCard icon={Users} label="Subscribers" value={stats.activeSubscribers} href="/subscribers" color="text-purple-600" />
          <StatCard icon={Camera} label="Photos" value={stats.totalGalleryPhotos} href="/gallery" color="text-pink-600" />
          <StatCard icon={Heart} label="Volunteers" value={stats.totalVolunteerSignups} href="/volunteers" color="text-red-600" />
          <StatCard icon={GraduationCap} label="CCD Reg." value={stats.pendingCcdRegistrations} href="/ccd" color="text-amber-600" highlight={stats.pendingCcdRegistrations > 0} />
          <StatCard icon={GraduationCap} label="CCD Perm." value={stats.pendingCcdPermissions} href="/ccd-permissions" color="text-amber-500" highlight={stats.pendingCcdPermissions > 0} />
          <StatCard icon={UserPlus} label="Parish Reg." value={stats.pendingParishRegistrations} href="/registrations" color="text-green-700" highlight={stats.pendingParishRegistrations > 0} />
          <StatCard icon={Cross} label="Pending Sacraments" value={stats.pendingBaptisms + stats.pendingMarriages + stats.pendingSponsorCerts + stats.pendingFunerals} href="/sacraments" color="text-indigo-600" highlight={(stats.pendingBaptisms + stats.pendingMarriages + stats.pendingSponsorCerts + stats.pendingFunerals) > 0} />
          <StatCard icon={Users} label="Teen Life" value={stats.pendingTeenLife} href="/teen-life" color="text-orange-600" highlight={stats.pendingTeenLife > 0} />
          <StatCard icon={Heart} label="Intentions" value={stats.pendingMassIntentions} href="/mass-intentions" color="text-rose-500" highlight={stats.pendingMassIntentions > 0} />
          <StatCard icon={Users} label="Vol. Needs" value={stats.unfilledVolunteerNeeds} href="/volunteer-needs" color="text-teal-600" highlight={stats.unfilledVolunteerNeeds > 0} />
          <StatCard icon={BookOpen} label="Bulletins" value={stats.totalBulletins} href="/bulletins" color="text-cyan-600" />
          <StatCard icon={HandHeart} label="Prayers" value={stats.totalPrayerIntentions} href="/needs-attention" color="text-violet-600" />
          <StatCard icon={UserCog} label="Staff" value={stats.totalStaff} href="/staff" color="text-slate-600" />
          <StatCard icon={UserPlus} label="Total Reg." value={stats.totalParishRegistrations} href="/registrations" color="text-emerald-600" />
        </div>
      ) : null}

      <ActivityFeed activity={activity as any} isLoading={activityLoading} />
      <QuickActions />
    </div>
  );
}

/** Weather-aware closure suggestion card */
function WeatherClosureSuggestion() {
  const { data: forecast } = trpc.weather.daily.useQuery(undefined, { staleTime: 60 * 60 * 1000 });

  const suggestion = useMemo(() => {
    if (!forecast || !Array.isArray(forecast)) return null;
    for (const day of forecast.slice(0, 2)) {
      const code = day.weatherCode;
      const isSnow = (code >= 71 && code <= 77) || (code >= 85 && code <= 86);
      const isFreezingRain = (code >= 66 && code <= 67) || (code >= 56 && code <= 57);
      const isThunderstorm = code >= 95 && code <= 99;
      const isExtremeCold = day.low <= 10;
      if (isSnow || isFreezingRain || isThunderstorm || isExtremeCold) {
        const dateStr = new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        let reason = "";
        if (isSnow) reason = `Snow expected (${day.description})`;
        else if (isFreezingRain) reason = "Freezing rain/drizzle expected";
        else if (isThunderstorm) reason = "Severe thunderstorm expected";
        else if (isExtremeCold) reason = `Extreme cold (low: ${day.low}°F)`;
        return { date: dateStr, reason, high: day.high, low: day.low, precipChance: day.precipProbabilityMax };
      }
    }
    return null;
  }, [forecast]);

  if (!suggestion) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <CloudSnow className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-blue-900">Weather Advisory</p>
            <p className="text-sm text-blue-700 mt-0.5">
              {suggestion.reason} on {suggestion.date}.
              {suggestion.precipChance > 60 && ` ${suggestion.precipChance}% precipitation chance.`}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-blue-600">
              <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" />High {suggestion.high}° / Low {suggestion.low}°</span>
            </div>
            <Link href="/closure">
              <Button size="sm" variant="outline" className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100">
                Consider Closure for {suggestion.date}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
