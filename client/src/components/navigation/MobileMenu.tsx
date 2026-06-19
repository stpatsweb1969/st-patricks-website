/**
 * Mobile Menu — Full-screen overlay with search and grouped sections.
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { X, Church } from "lucide-react";
import { searchablePages, mobileMenuSections, Search } from "./menuData";
import type { SearchableItem } from "./menuData";

export function MobileMenu({ location, isAuthenticated, isAdmin, onClose }: {
  location: string;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when menu opens
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return searchablePages
      .map((page) => {
        const labelMatch = page.label.toLowerCase().includes(q);
        const matchedKeywords = page.keywords.filter((kw) => kw.includes(q));
        if (!labelMatch && matchedKeywords.length === 0) return null;
        return { ...page, matchedKeywords, labelMatch };
      })
      .filter(Boolean) as (SearchableItem & { matchedKeywords: string[]; labelMatch: boolean })[];
  }, [query]);

  const showSearch = query.trim().length > 0;

  // Highlight matching substring in text
  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/15 text-primary font-medium rounded-sm px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="lg:hidden border-t border-border/50 bg-white animate-slide-down max-h-[70vh] overflow-y-auto pb-16">
      <div className="container py-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages... (e.g. baptism, CCD, giving)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-sm bg-muted/50 border border-border/60 rounded-lg placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {showSearch && (
          <div className="space-y-1">
            {searchResults.length > 0 ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                </p>
                {searchResults.map((item) => {
                  const isActive = location === item.href;
                  const q = query.toLowerCase().trim();
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? "text-primary bg-primary/5 font-medium"
                          : "text-foreground/80 active:bg-primary/5"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm">{item.labelMatch ? highlightMatch(item.label, q) : item.label}</span>
                        {item.matchedKeywords.length > 0 && !item.labelMatch && (
                          <span className="text-sm text-muted-foreground mt-0.5">
                            Matches: {item.matchedKeywords.slice(0, 3).map((kw, i) => (
                              <span key={kw}>{i > 0 && ", "}{highlightMatch(kw, q)}</span>
                            ))}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </>
            ) : (
              <div className="flex flex-col items-center py-8 px-4">
                <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground/70 mb-1">
                  No pages found
                </p>
                <p className="text-xs text-muted-foreground text-center max-w-[220px]">
                  Try a different keyword like "mass", "baptism", "CCD", or "volunteer"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Grouped sections (hidden when searching) */}
        {!showSearch && (
          <>
            {mobileMenuSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 gap-0.5">
                  {section.items.map((item) => {
                    const isActive = location === item.href || location.startsWith(item.href.split('?')[0] + '?');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? "text-primary bg-primary/5 font-medium"
                            : "text-foreground/80 active:bg-primary/5"
                        }`}
                      >
                        <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            {isAuthenticated && isAdmin && (
              <div className="border-t border-border/50 pt-3 mt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">
                  Administration
                </h3>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-primary bg-primary/5"
                >
                  <Church className="w-4 h-4 text-primary" />
                  Admin Dashboard
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
