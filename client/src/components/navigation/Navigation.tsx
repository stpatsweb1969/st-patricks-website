/**
 * Navigation — Main header component with desktop nav, mobile menu, and bottom tab bar.
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Church, ArrowRight, Heart } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import MobileBottomNav from "../MobileBottomNav";
import { useParishSchedule } from "@/hooks/useParishSchedule";
import { isServiceInProgress, getServicesForDay } from "../../../../shared/scheduleEngine";

import { navLinks } from "./menuData";
import { DesktopDropdown } from "./DesktopNav";
import { MobileMenu } from "./MobileMenu";

/** Schedule-aware Watch Live chip — shows "LIVE NOW" pulse when a Mass is in progress */
function WatchLiveChip() {
  const { schedule } = useParishSchedule();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    function check() {
      if (!schedule) return;
      const now = new Date();
      const currentDay = now.getDay();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const month = now.getMonth() + 1;
      const todayServices = getServicesForDay(schedule, currentDay, month);
      const massServices = todayServices.filter(s => s.type === "mass");
      setIsLive(massServices.some(s => isServiceInProgress(s, currentMinutes)));
    }
    check();
    const interval = setInterval(check, 30000); // re-check every 30s
    return () => clearInterval(interval);
  }, [schedule]);

  return (
    <a
      href="/watch"
      className="inline-flex items-center gap-1.5 text-xs sm:text-xs font-medium hover:underline transition-all"
    >
      {isLive ? (
        <span className="inline-flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-bold uppercase tracking-wide">Live Now</span>
        </span>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          <span>Watch Mass</span>
        </>
      )}
      <ArrowRight className="w-3 h-3" />
    </a>
  );
}

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { data: marqueeData } = trpc.siteSettings.get.useQuery({ key: "marquee_text" });
  const announcementText = marqueeData?.value || "";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);



  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        {/* Top Bar — slim single bar (≤36px): announcement override OR default Watch Mass link */}
        <div className="bg-primary text-white h-9 flex items-center overflow-hidden relative">
          {announcementText ? (
            <div className="announcement-marquee flex whitespace-nowrap">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center gap-8 px-6 shrink-0 announcement-marquee-content">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-xs font-medium">
                    {announcementText}
                  </span>
                  <span className="text-white/30">•</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <WatchLiveChip />
            </div>
          )}
        </div>
        <nav className="container flex items-center justify-between h-16 lg:h-[4.5rem]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Church className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-primary leading-tight tracking-tight">
                St. Patrick
              </span>
              <span className="text-xs text-muted-foreground leading-tight tracking-widest uppercase">
                in Armonk
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) =>
              link.children ? (
                <DesktopDropdown key={link.label} item={link} location={location} />
              ) : link.highlight ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="ml-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-all duration-150 press-scale shadow-sm"
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link-underline px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    location === link.href
                      ? "text-primary active"
                      : "text-foreground/70 hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                className={`ml-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${
                  location === "/admin"
                    ? "bg-accent text-accent-foreground"
                    : "bg-accent/10 text-accent-foreground/80 hover:bg-accent/20"
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Give button — persistent gold, visible on all viewports */}
          <Link
            href="/giving"
            className="ml-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[oklch(0.75_0.15_85)] text-white hover:bg-[oklch(0.70_0.15_85)] transition-all duration-150 press-scale shadow-sm flex items-center gap-1"
          >
            <Heart className="w-3.5 h-3.5" fill="currentColor" />
            Give
          </Link>

          {/* Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden press-scale"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </nav>

        {/* Mobile Menu - Grouped sections with search */}
        {mobileOpen && (
          <MobileMenu
            location={location}
            isAuthenticated={isAuthenticated}
            isAdmin={user?.role === "admin"}
            onClose={() => setMobileOpen(false)}
          />
        )}
      </header>

      {/* Bottom Tab Bar - Mobile only */}
      <MobileBottomNav />
    </>
  );
}
