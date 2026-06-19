import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Clock, Flame, Heart } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return `${Math.floor(diffDay / 7)}w ago`;
}

export default function Prayers() {
  const { data, isLoading } = trpc.prayerWall.getIntentions.useQuery();
  const intentions = data?.intentions?.filter((i: any) => i.isPublic) || [];

  // Get prayer support counts for all visible intentions
  const intentionIds = useMemo(() => intentions.map((i: any) => i.id), [intentions]);
  const { data: supportCounts } = trpc.prayerWall.getSupportCounts.useQuery(
    { intentionIds },
    { enabled: intentionIds.length > 0 }
  );

  return (
    <div className="min-h-screen section-candlelight">
      <SEO
        title="Prayer Wall"
        path="/prayers"
        description="Light a virtual candle and share your prayer intentions with the St. Patrick Church community. We pray together."
      />
      {/* Header */}
      <div className="container py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-amber-300/70 hover:text-amber-200 text-sm mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-amber-100">Community Prayers</h1>
            <p className="text-sm text-amber-300/60">{intentions.length} prayer intentions shared</p>
          </div>
        </div>
      </div>

      {/* Prayer list */}
      <div className="container pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-amber-900/20 animate-pulse" />
            ))}
          </div>
        ) : intentions.length === 0 ? (
          <p className="text-center text-amber-300/50 py-12">No prayer intentions shared yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {intentions.map((item: any) => (
              <PrayerCard
                key={item.id}
                item={item}
                prayerCount={supportCounts?.[item.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PrayerCard({ item, prayerCount }: { item: any; prayerCount: number }) {
  const [prayed, setPrayed] = useState(false);
  const [localCount, setLocalCount] = useState(prayerCount);
  const utils = trpc.useUtils();

  const prayMutation = trpc.prayerWall.prayForThis.useMutation({
    onSuccess: () => {
      setPrayed(true);
      setLocalCount((c) => c + 1);
      toast.success("Your prayer has been added. God bless you.");
      utils.prayerWall.getSupportCounts.invalidate();
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  return (
    <div className="py-2.5 px-3.5 rounded-lg bg-amber-900/15 border border-amber-800/25 hover:border-amber-700/40 transition-colors">
      <p className="text-sm text-amber-100/90 leading-snug">{item.intention}</p>
      <div className="flex items-center gap-2 mt-2">
        {item.name && (
          <span className="text-sm text-amber-300/60 font-medium">— {item.name}</span>
        )}
        <span className="text-sm text-amber-400/40 flex items-center gap-0.5 ml-auto">
          <Clock className="w-2.5 h-2.5" />
          {timeAgo(typeof item.createdAt === "string" ? item.createdAt : new Date(item.createdAt).toISOString())}
        </span>
      </div>
      {/* I prayed for this button */}
      <button
        onClick={() => {
          if (!prayed) {
            prayMutation.mutate({ intentionId: item.id });
          }
        }}
        disabled={prayed || prayMutation.isPending}
        className={`mt-2 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full transition-all duration-200 ${
          prayed
            ? "bg-amber-500/20 text-amber-300 cursor-default"
            : "bg-amber-900/30 text-amber-400/70 hover:bg-amber-500/20 hover:text-amber-300 active:scale-95"
        }`}
      >
        <Heart className={`w-3 h-3 ${prayed ? "fill-amber-400" : ""}`} />
        {prayed ? "Prayed" : "I prayed for this"}
        {localCount > 0 && (
          <span className="text-amber-400/50 ml-0.5">· {localCount}</span>
        )}
      </button>
    </div>
  );
}
