import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Wind, Droplets, Thermometer, Sunrise, Sunset, Clock, CalendarPlus, MapPin } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ColorfulWeatherIcon } from "@/components/WeatherIcons";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useParishSchedule, getNextService } from "@/hooks/useParishSchedule";
import { downloadMassICS } from "@/lib/icsGenerator";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getTimeGreeting(): string {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  const hour = now.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function HeroSection() {
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [nextMassLabel, setNextMassLabel] = useState("");
  const [nextMassData, setNextMassData] = useState<{ name: string; day: string; time: string } | null>(null);
  const [timeGreeting, setTimeGreeting] = useState(getTimeGreeting);
  const { schedule } = useParishSchedule();

  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => setTimeGreeting(getTimeGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Update Next Mass countdown every minute
  useEffect(() => {
    if (!schedule) return;
    function update() {
      const now = new Date();
      const next = getNextService(schedule!, now);
      if (!next) { setNextMassLabel(""); return; }
      const { service, daysAhead, countdown } = next;
      const dayName = daysAhead === 0 ? "Today" : daysAhead === 1 ? "Tomorrow" : DAY_NAMES[(new Date().getDay() + daysAhead) % 7];
      const parts = ["Next:", service.name, "\u00B7", dayName, service.time];
      if (countdown) parts.push("\u00B7", countdown);
      setNextMassLabel(parts.join(" "));
      setNextMassData({ name: service.name, day: dayName, time: service.time });
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  // Close popover on scroll
  useEffect(() => {
    if (!weatherOpen) return;
    const close = () => setWeatherOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [weatherOpen]);

  const { data: currentWeather } = trpc.weather.current.useQuery(undefined, {
    staleTime: 15 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });

  return (
    <section
      className="relative min-h-[520px] sm:min-h-[560px] md:min-h-[600px] flex flex-col overflow-hidden"
      aria-label="Parish welcome"
    >
      {/* Full church image — no cropping, no scaling, natural dimensions */}
      <div className="absolute inset-0">
        <img
          src="/manus-storage/church-exterior_60bbb0cd.webp"
          alt="St. Patrick's Church front exterior"
          className="w-full h-full object-contain object-center"
        />
      </div>

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            165deg,
            oklch(0.10 0.04 160 / 0.70) 0%,
            oklch(0.12 0.03 160 / 0.55) 40%,
            oklch(0.08 0.02 160 / 0.65) 100%
          )`,
        }}
      />

      {/* Current Weather — visible on ALL breakpoints, top-right */}
      {currentWeather && (
        <div
          className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-12 lg:right-20 z-20 opacity-0"
          style={{ animation: 'fadeSlideUp 0.6s ease 0.5s forwards' }}
        >
          <Popover open={weatherOpen} onOpenChange={setWeatherOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md bg-white/15 border border-white/20 shadow-lg cursor-pointer hover:bg-white/25 transition-colors duration-200 press-scale">
                <ColorfulWeatherIcon icon={currentWeather.icon} className="w-5 h-5 sm:w-6 sm:h-6" isDay={currentWeather.isDay} />
                <span className="text-white font-semibold text-sm sm:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                  {currentWeather.temperature}°F
                </span>
                <span className="hidden sm:inline text-white/80 text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  {currentWeather.description}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="end"
              className="w-56 p-3 rounded-xl backdrop-blur-xl bg-background/95 border border-border/50 shadow-xl"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <ColorfulWeatherIcon icon={currentWeather.icon} className="w-8 h-8" isDay={currentWeather.isDay} />
                  <div>
                    <p className="text-lg font-bold text-foreground">{currentWeather.temperature}°F</p>
                    <p className="text-xs text-muted-foreground">{currentWeather.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/30">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Feels like</p>
                      <p className="text-xs font-semibold">{currentWeather.feelsLike}°F</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Humidity</p>
                      <p className="text-xs font-semibold">{currentWeather.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-slate-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Wind</p>
                      <p className="text-xs font-semibold">{currentWeather.windSpeed} mph</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sunrise</p>
                      <p className="text-xs font-semibold">{currentWeather.sunrise}</p>
                    </div>
                  </div>
                </div>
                {currentWeather.sunset && (
                  <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-border/30">
                    <Sunset className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs text-muted-foreground">Sunset</span>
                    <span className="text-xs font-semibold">{currentWeather.sunset}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground text-center pt-1">Armonk, NY · Updated every 15 min</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Content — left-aligned, bottom-anchored */}
      <div className="relative z-10 flex flex-col flex-1 justify-end pb-14 sm:pb-16 md:pb-20 px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1400px] mx-auto w-full">
        <div className="max-w-3xl">

          {/* Time-of-day greeting eyebrow */}
          <p
            className="text-white/70 text-xs sm:text-sm font-medium tracking-[0.15em] uppercase mb-3 opacity-0 [text-shadow:_0_1px_4px_rgba(0,0,0,0.7)]"
            style={{ animation: 'fadeSlideUp 0.7s ease 0.1s forwards' }}
          >
            {timeGreeting} · Armonk, New York
          </p>

          {/* Primary heading — Fraunces with gold accent */}
          <h1
            className="text-white mb-4 opacity-0 [text-shadow:_0_2px_8px_rgba(0,0,0,0.7),_0_4px_16px_rgba(0,0,0,0.4)]"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(2.5rem, 5vw + 1rem, 5.5rem)',
              fontOpticalSizing: 'auto',
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              animation: 'fadeSlideUp 0.7s ease 0.2s forwards',
            }}
          >
            <span className="text-emerald-300">St. Patrick</span><br />
            in Armonk
          </h1>

          {/* Motto */}
          <p
            className="text-white text-base sm:text-lg italic mb-2 opacity-0 max-w-xl [text-shadow:_0_2px_6px_rgba(0,0,0,0.7),_0_1px_3px_rgba(0,0,0,0.5)]"
            style={{
              lineHeight: 1.6,
              animation: 'fadeSlideUp 0.7s ease 0.3s forwards',
            }}
          >
            God Bless the Whole World, No Exceptions
          </p>

          {/* Address */}
          <p
            className="text-white/90 text-xs sm:text-sm font-medium tracking-wide mb-3 opacity-0 [text-shadow:_0_1px_4px_rgba(0,0,0,0.7),_0_2px_8px_rgba(0,0,0,0.4)]"
            style={{ animation: 'fadeSlideUp 0.7s ease 0.35s forwards' }}
          >
            29 Cox Avenue, Armonk, NY 10504
          </p>

          {/* Next Mass countdown */}
          {nextMassLabel && (
            <p
              className="flex items-center gap-2 text-emerald-200 text-xs sm:text-sm font-medium mb-6 opacity-0 [text-shadow:_0_1px_4px_rgba(0,0,0,0.7)]"
              style={{ animation: 'fadeSlideUp 0.7s ease 0.38s forwards' }}
              aria-live="polite"
              aria-atomic="true"
            >
              <Clock className="w-3.5 h-3.5" />
              {nextMassLabel}
              {nextMassData && (
                <button
                  onClick={(e) => { e.stopPropagation(); downloadMassICS({ title: nextMassData.name, day: nextMassData.day, time: nextMassData.time, location: "St. Patrick's Church, 29 Cox Ave, Armonk, NY 10504" }); }}
                  className="ml-1 p-0.5 rounded hover:bg-white/20 transition-colors"
                  title="Add to Calendar"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                </button>
              )}
            </p>
          )}

          {/* CTA Group */}
          <div
            className="flex flex-row flex-wrap items-center gap-3 opacity-0"
            style={{ animation: 'fadeSlideUp 0.7s ease 0.4s forwards' }}
          >
            <Link href="/new-here">
              <Button
                size="lg"
                className="bg-gold text-parish-green hover:bg-gold/90 font-semibold px-7 py-3 rounded-full press-scale tracking-wide"
              >
                I'm New Here
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/mass-times">
              <Button
                size="lg"
                variant="outline"
                className="border border-white/30 text-white hover:border-white/60 hover:bg-white/10 font-semibold px-7 py-3 rounded-full press-scale backdrop-blur-sm bg-white/5"
              >
                Mass Times
              </Button>
            </Link>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=29+Cox+Avenue+Armonk+NY+10504"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="border border-white/30 text-white hover:border-white/60 hover:bg-white/10 font-semibold px-7 py-3 rounded-full press-scale backdrop-blur-sm bg-white/5"
              >
                <MapPin className="w-4 h-4 mr-1.5" />
                Get Directions
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator — desktop only */}
      <div className="absolute bottom-6 right-6 md:right-12 lg:right-20 hidden md:flex flex-col items-center gap-2 opacity-40">
        <span className="text-white text-xs tracking-[0.2em] uppercase" style={{ writingMode: 'vertical-rl' }}>Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" style={{ animation: 'scrollLine 2s ease infinite' }} />
      </div>


    </section>
  );
}
