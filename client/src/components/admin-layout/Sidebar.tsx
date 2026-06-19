import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { type UserRole, hasAccess, ROLE_LABELS } from "@shared/roles";
import {
  Shield, X, Home, LogOut, ChevronDown, Settings,
} from "lucide-react";
import { navGroups, type NavGroup } from "./navData";

type SidebarProps = {
  location: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole: UserRole;
  userName: string | undefined;
};

export function Sidebar({
  location,
  sidebarOpen,
  setSidebarOpen,
  userRole,
  userName,
}: SidebarProps) {
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasAccess(userRole, item.section)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-[280px] bg-white border-r flex flex-col transition-transform duration-200 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-serif font-bold text-primary">Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 rounded hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            location === "/"
              ? "bg-primary/10 text-primary"
              : "text-foreground/70 hover:bg-muted hover:text-foreground"
          }`}
          onClick={() => setSidebarOpen(false)}
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Link>

        {visibleGroups.map((group) => (
          <NavGroupComponent
            key={group.title}
            group={group}
            location={location}
            onNavigate={() => setSidebarOpen(false)}
          />
        ))}

        {hasAccess(userRole, "users") && (
          <Link
            href="/users"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location === "/users"
                ? "bg-primary/10 text-primary"
                : "text-foreground/70 hover:bg-muted hover:text-foreground"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Settings className="w-4 h-4" />
            User Management
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {userName?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName || "Staff"}</p>
            <p className="text-sm text-muted-foreground">{ROLE_LABELS[userRole]}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Link href="~/" className="flex-1">
            <Button variant="ghost" size="sm" className="w-full text-xs gap-1.5">
              <LogOut className="w-3 h-3" /> View Site
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}

/** Collapsible nav group */
function NavGroupComponent({
  group,
  location,
  onNavigate,
}: {
  group: NavGroup & { items: NavGroup["items"] };
  location: string;
  onNavigate: () => void;
}) {
  const isActive = group.items.some((item) => location === item.path);
  const [open, setOpen] = useState(isActive);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {group.title}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5">
          {group.items.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                location === item.path
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
              onClick={onNavigate}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
