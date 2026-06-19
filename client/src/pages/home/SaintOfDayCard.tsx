import { trpc } from "@/lib/trpc";
import { ArrowRight, Cross, Flame } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";

function SaintOfDaySkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
      </div>
      <div className="rounded-xl border border-border/50 shadow-sm p-5 sm:p-6">
        <div className="flex gap-4 sm:gap-6">
          <div className="hidden sm:block w-24 h-32 rounded-lg bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
            <div className="space-y-2 pt-1">
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StreakBadge({ streak, totalVisits }: { streak: number; totalVisits: number }) {
  if (streak === 0 && totalVisits === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium">
      <Flame className="w-3.5 h-3.5 text-orange-500" />
      <span className="text-orange-600 dark:text-orange-400">
        {streak} day{streak !== 1 ? "s" : ""}
      </span>
      {totalVisits > streak && (
        <span className="text-muted-foreground ml-1">
          ({totalVisits} total)
        </span>
      )}
    </div>
  );
}

export function SaintOfDayCard() {
  const { data: saint, isLoading } = trpc.saintOfDay.today.useQuery();
  const { user } = useAuth();
  const { data: streakData } = trpc.saintOfDay.getStreak.useQuery(undefined, {
    enabled: !!user,
  });
  const recordVisit = trpc.saintOfDay.recordVisit.useMutation();

  // Record visit when the card is viewed by an authenticated user
  useEffect(() => {
    if (user && saint?.featuredSaint) {
      recordVisit.mutate();
    }
  }, [user, saint?.featuredSaint?.name]);

  if (isLoading) {
    return <SaintOfDaySkeleton />;
  }

  if (!saint || !saint.featuredSaint) {
    return null;
  }

  const { featuredSaint, saints } = saint;

  return (
    <div>
      <SectionHeader
        icon={Cross}
        title="Saint of the Day"
        size="sm"
        iconBg="bg-gold/10"
        iconColor="text-gold"
        action={
          <div className="flex items-center gap-3">
            {user && streakData && (
              <StreakBadge streak={streakData.currentStreak} totalVisits={streakData.totalVisits} />
            )}
            <a
              href="https://www.evangelizo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              Evangelizo.org <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        }
      />
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-3">
            {featuredSaint.imageUrl && (
              <div className="hidden sm:block flex-shrink-0">
                <img
                  src={featuredSaint.imageUrl}
                  alt={featuredSaint.name}
                  className="w-16 h-20 object-cover rounded-lg shadow-sm"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-sm sm:text-base font-bold text-foreground">
                {featuredSaint.name}
              </h3>
              {saints.length > 1 && (
                <p className="text-sm text-foreground/70 mt-0.5">
                  Also: {saints.filter(s => s !== featuredSaint.name && !featuredSaint.name.includes(s)).slice(0, 2).join(", ")}
                </p>
              )}
              {featuredSaint.biography && (
                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3 mt-1">
                  {featuredSaint.biography}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
