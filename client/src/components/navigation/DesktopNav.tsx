/**
 * Desktop Navigation — Dropdown menus for top nav bar.
 */

import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "./menuData";

export function DesktopDropdown({ item, location }: { item: NavItem; location: string }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const isActive = item.children?.some(c => c.href === location) || item.href === location;

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={item.href}
        className={`nav-link-underline flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
          isActive
            ? "text-primary active"
            : "text-foreground/70 hover:text-primary"
        }`}
      >
        {item.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </Link>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1.5 z-50">
          <div className="nav-dropdown-enter bg-white rounded-lg shadow-md ring-1 ring-black/[0.04] py-1.5 min-w-[200px]">
            {item.children!.map(child => (
              <Link
                key={child.href}
                href={child.href}
                className={`block px-3.5 py-2 text-[13px] transition-colors duration-100 ${
                  location === child.href
                    ? "text-primary font-medium"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/[0.04]"
                }`}
                onClick={() => setOpen(false)}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
