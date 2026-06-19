import type { AdminSection } from "@shared/roles";
import {
  Home, Newspaper, FileText, Calendar, Inbox, Clock, Star,
  Users, Camera, Heart, BookOpen, GraduationCap, Cross,
  UserPlus, Settings, Download, MessageCircle, AlertTriangle, Megaphone, ClipboardList,
} from "lucide-react";

export type NavItem = {
  label: string;
  section: AdminSection;
  icon: typeof Home;
  path: string;
};

export type NavGroup = {
  title: string;
  section: AdminSection;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    title: "Overview",
    section: "news",
    items: [
      { label: "Needs Attention", section: "news", icon: Inbox, path: "/needs-attention" },
    ],
  },
  {
    title: "Communications",
    section: "news",
    items: [
      { label: "News & Announcements", section: "news", icon: Newspaper, path: "/news" },
      { label: "Push Announcements", section: "news", icon: Megaphone, path: "/announcements" },
      { label: "Weekly Bulletins", section: "bulletins", icon: BookOpen, path: "/bulletins" },
      { label: "Photo Gallery", section: "gallery", icon: Camera, path: "/gallery" },
      { label: "Subscribers", section: "subscribers", icon: Users, path: "/subscribers" },
    ],
  },
  {
    title: "Parish Life",
    section: "events",
    items: [
      { label: "Events", section: "events", icon: Calendar, path: "/events" },
      { label: "Key Dates", section: "key_dates", icon: Calendar, path: "/key-dates" },
      { label: "Volunteers", section: "volunteers", icon: Heart, path: "/volunteers" },
      { label: "Needs Board", section: "volunteers", icon: Heart, path: "/volunteer-needs" },
      { label: "Registrations", section: "registrations", icon: UserPlus, path: "/registrations" },
    ],
  },
  {
    title: "Religious Education",
    section: "ccd_registrations",
    items: [
      { label: "CCD Registrations", section: "ccd_registrations", icon: GraduationCap, path: "/ccd" },
      { label: "CCD Calendar", section: "ccd_calendar", icon: Calendar, path: "/ccd-calendar" },
      { label: "CCD Permissions", section: "ccd_permissions", icon: FileText, path: "/ccd-permissions" },
      { label: "Documents", section: "documents", icon: FileText, path: "/documents" },
    ],
  },
  {
    title: "Youth Ministry",
    section: "cyo",
    items: [
      { label: "CYO Basketball", section: "cyo", icon: Calendar, path: "/cyo" },
      { label: "Teen Life", section: "teen_life", icon: Users, path: "/teen-life" },
    ],
  },
  {
    title: "Sacraments",
    section: "sacraments",
    items: [
      { label: "Sacrament Requests", section: "sacraments", icon: Cross, path: "/sacraments" },
      { label: "Mass Intentions", section: "sacraments", icon: Heart, path: "/mass-intentions" },
      { label: "Holy Days", section: "sacraments", icon: Star, path: "/holy-days" },
    ],
  },
  {
    title: "Administration",
    section: "settings",
    items: [
      { label: "Site Settings", section: "settings", icon: Settings, path: "/settings" },
      { label: "User Management", section: "users", icon: Users, path: "/users" },
      { label: "Form Export", section: "form_export", icon: Download, path: "/form-export" },
      { label: "FAQ Knowledge Base", section: "faq", icon: MessageCircle, path: "/faq" },
      { label: "Closure Alert", section: "settings", icon: AlertTriangle, path: "/closure" },
      { label: "Mass Schedule & Info", section: "settings", icon: Clock, path: "/schedule" },
      { label: "Staff Directory", section: "settings", icon: Users, path: "/staff" },
      { label: "Audit Log", section: "settings", icon: ClipboardList, path: "/audit-log" },
    ],
  },
];

/** Get current page label from path */
export function getCurrentPageLabel(path: string): string {
  const allItems = navGroups.flatMap((g) => g.items);
  const match = allItems.find((item) => item.path === path);
  if (match) return match.label;
  const segment = path.split("/").filter(Boolean).pop() || "";
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
