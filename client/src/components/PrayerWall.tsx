import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "wouter";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

/** Animated floating spark particles */
function Sparks() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber-300/80 animate-spark"
          style={{
            left: `${45 + Math.random() * 10}%`,
            bottom: "40%",
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${2 + Math.random() * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Realistic SVG candle with animated flame */
function AnimatedCandle({ count }: { count: number }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Outer glow rings */}
      <div className="absolute top-4 w-32 h-32 rounded-full bg-amber-400/10 animate-pulse-slow blur-xl" />
      <div className="absolute top-8 w-20 h-20 rounded-full bg-amber-500/20 animate-pulse-slow blur-lg" style={{ animationDelay: "0.5s" }} />

      {/* SVG Candle */}
      <svg width="80" height="140" viewBox="0 0 80 140" className="relative z-10 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
        {/* Flame outer glow */}
        <ellipse cx="40" cy="35" rx="14" ry="20" fill="url(#flameGlow)" className="animate-flicker origin-bottom" style={{ transformBox: "fill-box" }} />
        {/* Flame body */}
        <path
          d="M40 15 C40 15, 50 30, 48 42 C46 52, 34 52, 32 42 C30 30, 40 15, 40 15Z"
          fill="url(#flameGradient)"
          className="animate-flicker origin-bottom"
          style={{ transformBox: "fill-box" }}
        />
        {/* Flame inner core */}
        <ellipse cx="40" cy="42" rx="5" ry="8" fill="#FFF7ED" opacity="0.9" className="animate-flicker-fast" />
        {/* Wick */}
        <line x1="40" y1="48" x2="40" y2="56" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
        {/* Candle body */}
        <rect x="28" y="56" width="24" height="70" rx="3" fill="url(#candleBody)" />
        {/* Wax drip */}
        <path d="M28 60 C26 65, 26 70, 28 72 L28 56 Z" fill="#F5E6D3" opacity="0.6" />
        <path d="M52 63 C54 68, 54 73, 52 76 L52 56 Z" fill="#E8D5C0" opacity="0.4" />
        {/* Candle base */}
        <ellipse cx="40" cy="126" rx="16" ry="4" fill="#8B7355" />
        <rect x="32" y="122" width="16" height="8" rx="2" fill="#A0845C" />

        {/* Gradients */}
        <defs>
          <radialGradient id="flameGlow">
            <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="80%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="candleBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="50%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
        </defs>
      </svg>

      {/* Count badge — below candle */}
      <div className="mt-3 flex items-center gap-2 bg-amber-900/30 border border-amber-500/40 rounded-full px-4 py-1.5 backdrop-blur-sm">
        <span className="text-amber-300 text-lg font-bold tabular-nums">{count}</span>
        <span className="text-amber-200/80 text-sm">candles lit this week</span>
      </div>
    </div>
  );
}

export function PrayerWall() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [intention, setIntention] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [justLit, setJustLit] = useState(false);

  const { data, refetch } = trpc.prayerWall.getIntentions.useQuery();
  const lightCandle = trpc.prayerWall.lightCandle.useMutation({
    onSuccess: () => {
      toast.success("Your candle has been lit. We are praying with you.");
      setShowForm(false);
      setName("");
      setIntention("");
      setJustLit(true);
      refetch();
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  useEffect(() => {
    if (justLit) {
      const t = setTimeout(() => setJustLit(false), 3000);
      return () => clearTimeout(t);
    }
  }, [justLit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intention.trim()) return;
    lightCandle.mutate({ name: name.trim() || undefined, intention: intention.trim(), isPublic });
  };

  const candleCount = data?.candlesThisWeek ?? 0;
  const intentions = data?.intentions ?? [];

  return (
    <div className="relative py-10 px-4 overflow-hidden">
      {/* Dark immersive background with subtle texture */}
      <div className="absolute inset-0 section-candlelight" />
      {/* Radial warm glow behind candle */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-100 tracking-tight">Light a Candle</h2>
          <p className="text-sm text-amber-200/50 mt-1">Share a prayer intention with our parish family</p>
        </div>

        {/* Candle visual — centered hero */}
        <div className="relative flex justify-center mb-6">
          <Sparks />
          <AnimatedCandle count={candleCount} />
        </div>

        {/* Success flash */}
        {justLit && (
          <div className="text-center mb-4 animate-fade-in">
            <p className="text-amber-300 text-sm font-medium">Your candle is burning brightly</p>
          </div>
        )}

        {/* Light a Candle Button / Form */}
        {!showForm ? (
          <div className="text-center">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-amber-500 hover:bg-amber-400 text-amber-950 active:scale-97 transition-all duration-200 rounded-full px-8 py-3 text-sm font-bold shadow-lg shadow-amber-900/30"
              size="lg"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C12 2 8 8 8 12a4 4 0 008 0c0-4-4-10-4-10z" fill="currentColor" opacity="0.3" />
                <path d="M12 2C12 2 8 8 8 12a4 4 0 008 0c0-4-4-10-4-10z" />
              </svg>
              Light a Candle
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 rounded-xl p-4 bg-amber-950/50 backdrop-blur-sm border border-amber-700/20">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-amber-800/30 rounded-lg bg-amber-950/60 text-amber-100 placeholder:text-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
              maxLength={100}
            />
            <textarea
              placeholder="Your prayer intention..."
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-amber-800/30 rounded-lg bg-amber-950/60 text-amber-100 placeholder:text-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none transition-all"
              rows={3}
              maxLength={300}
              required
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-amber-300/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded w-3.5 h-3.5 accent-amber-500"
                />
                Share publicly
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="text-xs text-amber-300/60 hover:text-amber-200 hover:bg-amber-800/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!intention.trim() || lightCandle.isPending}
                  className="bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-bold rounded-full px-5 shadow-md"
                >
                  <Send className="w-3 h-3 mr-1.5" />
                  {lightCandle.isPending ? "Sending..." : "Submit Prayer"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Prayer Intentions List — refined grid */}
        {intentions.length > 0 && (
          <div className="mt-6 pt-5 border-t border-amber-800/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-semibold text-amber-100">Community Prayers</p>
              <p className="text-xs text-amber-300/60 font-medium">{intentions.length} shared</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
              {intentions.slice(0, 10).map((item) => (
                <div key={item.id} className="py-2.5 px-3 rounded-lg bg-amber-900/10 border border-amber-800/15 hover:border-amber-700/30 transition-colors">
                  <p className="text-sm text-amber-100/90 leading-snug line-clamp-2">{item.intention}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {item.name && (
                      <span className="text-xs text-amber-200/70 font-medium truncate max-w-[100px]">— {item.name}</span>
                    )}
                    <span className="text-xs text-amber-300/50">
                      {timeAgo(typeof item.createdAt === 'string' ? item.createdAt : new Date(item.createdAt).toISOString())}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {intentions.length > 10 && (
              <Link href="/prayers" className="flex items-center justify-center gap-1 mt-3 text-sm font-medium text-amber-300/80 hover:text-amber-200 transition-colors">
                View all {intentions.length} prayers <span className="text-sm">→</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
