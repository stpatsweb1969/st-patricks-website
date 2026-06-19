/**
 * Watch Mass — livestream / recordings page.
 * Uses YouTube /embed/live_stream?channel=<id> for frameable embeds.
 * Falls back to a "Watch recent recordings" card when no channel ID is set.
 */
import { useEffect, useState } from "react";
import { ExternalLink, Radio, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { useParishSchedule, useParishInfo } from "@/hooks/useParishSchedule";
import { isServiceInProgress, getServicesForDay, TIMEZONE } from "../../../shared/scheduleEngine";

export default function Watch() {
  const { schedule } = useParishSchedule();
  const { info } = useParishInfo();
  const youtubeUrl = info?.youtubeUrl ?? "https://www.youtube.com/@StPatricksArmonk";
  const channelId = info?.youtubeChannelId ?? "";

  // Build the proper embeddable URL
  const embedUrl = channelId
    ? `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1`
    : null;

  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    function check() {
      if (!schedule) return;
      const now = new Date();
      // Pin to America/New_York
      const nyTime = new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }));
      const currentDay = nyTime.getDay();
      const currentMinutes = nyTime.getHours() * 60 + nyTime.getMinutes();
      const month = nyTime.getMonth() + 1;
      const todayServices = getServicesForDay(schedule, currentDay, month);
      const massServices = todayServices.filter(s => s.type === "mass");
      setIsLive(massServices.some(s => isServiceInProgress(s, currentMinutes)));
    }
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [schedule]);

  return (
    <PageLayout>
      <SEO
        title="Watch Mass"
        path="/watch"
        description="Watch Sunday Mass live or view past recordings from St. Patrick Church in Armonk, NY."
      />
      <PageHeader
        eyebrow="Worship"
        title="Watch Mass"
        description="Join us for live Mass or watch recent recordings from our parish."
      />

      <section className="py-6 sm:py-10">
        <div className="container max-w-4xl">
          {/* Live indicator */}
          {isLive && (
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-red-600">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="uppercase tracking-wide">Live Now</span>
            </div>
          )}

          {/* YouTube embed or fallback */}
          {embedUrl ? (
            <Card className="overflow-hidden rounded-xl border border-border/50 shadow-sm">
              <div className="aspect-video w-full">
                <iframe
                  src={embedUrl}
                  title="St. Patrick Church — Live Mass & Recordings"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center rounded-xl border border-border/50">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-serif text-lg font-semibold text-foreground mb-2">
                No live Mass right now
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Watch recent recordings of Mass and homilies on our YouTube channel.
              </p>
              <Button variant="default" size="sm" className="rounded-full" asChild>
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                  Watch on YouTube <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </a>
              </Button>
            </Card>
          )}

          {/* Info & external link */}
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="font-serif text-lg font-semibold text-foreground">Live Mass & Recordings</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sunday Mass is livestreamed weekly. Past Masses and homilies are available on our YouTube channel.
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full shrink-0" asChild>
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                Open on YouTube <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </Button>
          </div>

          {/* Schedule note */}
          <Card className="mt-6 p-4 border border-primary/15 bg-primary/[0.02] rounded-xl">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg shrink-0 mt-0.5">
                <Radio className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">When do we stream?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We typically livestream the Sunday morning Mass. A "Live Now" indicator will appear
                  in the navigation bar and on this page whenever a Mass is in progress.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </PageLayout>
  );
}
