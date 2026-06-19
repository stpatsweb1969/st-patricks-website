import { useLocation } from "wouter";
import { Home, Clock, Flame, Menu, Sparkles } from "lucide-react";
import { useState } from "react";
import { MobileMenu } from "./navigation/MobileMenu";
import { useAuth } from "@/_core/hooks/useAuth";
import { openParishAssistant } from "./ParishAssistant";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/mass-times", label: "Mass", icon: Clock },
  { href: "__ask__", label: "Ask", icon: Sparkles, center: true },
  { href: "/prayers", label: "Prayers", icon: Flame },
  { href: "__menu__", label: "Menu", icon: Menu },
];

export default function MobileBottomNav() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/[0.97] backdrop-blur-xl border-t border-border/20" role="navigation" aria-label="Mobile navigation">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {tabs.map((tab) => {
            const isMenu = tab.href === "__menu__";
            const isAsk = tab.href === "__ask__";
            const isHome = tab.href === "/";
            const isActive = isMenu ? menuOpen : (!isAsk && (isHome ? location === "/" : location.startsWith(tab.href)));

            // Raised center "Ask" button
            if (tab.center) {
              return (
                <button
                  key={tab.href}
                  onClick={() => {
                    setMenuOpen(false);
                    openParishAssistant();
                  }}
                  className="relative flex flex-col items-center justify-center gap-[2px] min-w-[44px]"
                  aria-label="Ask the Parish Assistant"
                >
                  <span className="flex items-center justify-center w-12 h-12 -translate-y-2 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 active:scale-[0.92]">
                    <Sparkles className="w-5 h-5" strokeWidth={2} />
                  </span>
                  <span className="text-[10px] font-bold text-primary -mt-1 tracking-tight">
                    Ask
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.href}
                onClick={() => {
                  if (isMenu) {
                    setMenuOpen(!menuOpen);
                  } else {
                    setMenuOpen(false);
                    window.location.href = tab.href;
                  }
                }}
                className={`relative flex flex-col items-center justify-center gap-[3px] min-w-[44px] min-h-[44px] w-14 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/70 active:scale-[0.92] active:bg-muted/30"
                }`}
                aria-current={isActive && !isMenu ? "page" : undefined}
              >
                {isActive && (
                  <span
                    className="absolute -top-[1px] w-8 h-[3px] rounded-full bg-primary"
                    style={{ boxShadow: "0 1px 4px oklch(0.47 0.14 160 / 0.3)" }}
                  />
                )}
                <tab.icon
                  className={`w-[21px] h-[21px] transition-all duration-200 ${
                    isActive ? "text-primary scale-105" : ""
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span
                  className={`text-[10px] tracking-tight transition-all duration-200 ${
                    isActive ? "text-primary font-bold" : "font-medium"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Safe area for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* Full-screen mobile menu overlay triggered by Menu tab */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white overflow-y-auto pb-24">
          <div className="pt-4">
            <MobileMenu
              location={location}
              isAuthenticated={isAuthenticated}
              isAdmin={user?.role === "admin"}
              onClose={() => setMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
