/**
 * Navigation Menu Data — 5-bucket IA structure.
 * Buckets: Worship, Faith Formation, Parish Life, About + standalone Give + I'm New CTA
 */

import { Clock, BookOpen, Users, Heart, Calendar, FileText, GraduationCap, Newspaper, Phone, UserPlus, HandHeart, Cross, Church, Search, Flame, Sun, BookHeart } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  highlight?: boolean; // renders as CTA button
  children?: { href: string; label: string; description?: string }[];
};

export const navLinks: NavItem[] = [
  {
    href: "/mass-times",
    label: "Worship",
    children: [
      { href: "/mass-times", label: "Mass Times & Confession" },
      { href: "/sacraments", label: "Sacraments" },
      { href: "/prayers", label: "Prayers & Devotions" },
      { href: "/worship/today", label: "Today's Readings, Saint & News" },
      { href: "/mass-intention", label: "Request a Mass Intention" },
    ],
  },
  {
    href: "/faith-formation",
    label: "Faith Formation",
    children: [
      { href: "/faith-formation", label: "Overview" },
      { href: "/calendar?filter=ccd", label: "CCD Calendar" },
      { href: "/ccd-registration", label: "CCD Registration" },
      { href: "/ccd-permissions", label: "CCD Permission Forms" },
    ],
  },
  {
    href: "/news",
    label: "Parish Life",
    children: [
      { href: "/news", label: "News" },
      { href: "/calendar", label: "Full Calendar" },
      { href: "/gallery", label: "Photo Gallery" },
      { href: "/bulletins", label: "Bulletins & Homilies" },
      { href: "/calendar?filter=cyo", label: "CYO Schedule" },
      { href: "/ministries", label: "Ministries & Devotions" },
      { href: "/serve", label: "Serve & Volunteer" },
    ],
  },
  {
    href: "/about",
    label: "About",
    children: [
      { href: "/about", label: "Our Parish" },
      { href: "/staff", label: "Staff & Leadership" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
  { href: "/giving", label: "Give" },
  { href: "/new-here", label: "I'm New", highlight: true },
];

// Searchable page index — includes all pages with keywords for fuzzy matching
export type SearchableItem = { href: string; label: string; keywords: string[]; icon: typeof Clock };

export const searchablePages: SearchableItem[] = [
  { href: "/mass-times", label: "Mass Times & Confession", keywords: ["mass", "confession", "reconciliation", "schedule", "saturday", "sunday", "weekday", "holy day", "prayer", "lauds"], icon: Clock },
  { href: "/sacraments", label: "Sacraments", keywords: ["baptism", "confirmation", "marriage", "wedding", "funeral", "communion", "eucharist", "sponsor", "rcia", "anointing"], icon: Cross },
  { href: "/prayers", label: "Prayers & Devotions", keywords: ["prayer", "rosary", "novena", "adoration", "devotion", "candle", "intention"], icon: Flame },
  { href: "/worship/today", label: "Today's Readings, Saint & News", keywords: ["readings", "saint", "daily", "gospel", "liturgy", "today", "catholic resources", "usccb", "formed"], icon: Sun },
  { href: "/mass-intention", label: "Request a Mass Intention", keywords: ["mass intention", "intention", "memorial", "prayer request", "offering", "deceased", "living"], icon: Heart },
  { href: "/watch", label: "Watch Mass", keywords: ["watch", "livestream", "live", "youtube", "video", "stream", "recording", "homily"], icon: Church },
  { href: "/faith-formation", label: "Faith Formation", keywords: ["faith", "formation", "religious education", "rcia", "walking with purpose", "blaze", "adult"], icon: GraduationCap },
  { href: "/calendar?filter=ccd", label: "CCD Calendar", keywords: ["ccd", "religious ed", "class", "schedule", "catechism"], icon: Calendar },
  { href: "/ccd-registration", label: "CCD Registration", keywords: ["ccd", "register", "enroll", "religious ed", "sign up", "child"], icon: FileText },
  { href: "/ccd-permissions", label: "CCD Permission Forms", keywords: ["ccd", "permission", "release", "bus", "medical", "allergy", "pickup", "dismissal", "photo"], icon: FileText },
  { href: "/faith-formation", label: "Teen Life & Youth Ministry", keywords: ["teen", "youth", "high school", "confirmation", "young", "teen life"], icon: Users },
  { href: "/news", label: "News", keywords: ["news", "announcement", "update", "parish"], icon: Newspaper },
  { href: "/calendar", label: "Full Calendar", keywords: ["calendar", "events", "schedule", "upcoming", "parish", "cyo", "ccd", "full"], icon: Calendar },
  { href: "/bulletins", label: "Bulletins & Homilies", keywords: ["bulletin", "weekly", "pdf", "download", "read", "homily", "sermon", "listen"], icon: BookOpen },
  { href: "/calendar?filter=cyo", label: "CYO Schedule", keywords: ["cyo", "basketball", "sports", "practice", "youth", "athletics"], icon: Calendar },
  { href: "/ministries", label: "Ministries & Devotions", keywords: ["ministry", "devotion", "lector", "eucharistic", "choir", "music", "rosary", "prayer", "share care", "fiat", "embrace"], icon: HandHeart },
  { href: "/serve", label: "Serve & Volunteer", keywords: ["volunteer", "help", "serve", "sign up", "get involved", "needs", "urgent"], icon: Users },
  { href: "/giving", label: "Give Online", keywords: ["give", "donate", "offering", "weshare", "venmo", "tithe", "stewardship", "cardinal", "appeal"], icon: Heart },
  { href: "/contact", label: "Contact Us", keywords: ["contact", "phone", "email", "address", "office", "hours", "directions", "map"], icon: Phone },
  { href: "/gallery", label: "Photo Gallery", keywords: ["photo", "gallery", "pictures", "images", "events", "album"], icon: Church },
  { href: "/about", label: "Our Parish", keywords: ["about", "parish", "history", "armonk", "cross", "community"], icon: Church },
  { href: "/new-here", label: "I'm New — Plan Your Visit", keywords: ["new", "visit", "welcome", "first time", "directions", "what to expect"], icon: UserPlus },
  { href: "/staff", label: "Staff & Leadership", keywords: ["staff", "pastor", "priest", "deacon", "director", "leadership", "team", "contact"], icon: Users },
  { href: "/parish-registration", label: "Register as a Parishioner", keywords: ["register", "new member", "join", "parishioner", "sign up", "family"], icon: UserPlus },
  { href: "/forms", label: "Forms & Documents", keywords: ["form", "document", "download", "pdf", "application"], icon: FileText },
];

// Grouped mobile menu matching 5-bucket IA
export type MobileMenuSection = {
  title: string;
  items: { href: string; label: string; icon: typeof Clock }[];
};

export const mobileMenuSections: MobileMenuSection[] = [
  {
    title: "Worship",
    items: [
      { href: "/mass-times", label: "Mass Times & Confession", icon: Clock },
      { href: "/sacraments", label: "Sacraments", icon: Cross },
      { href: "/prayers", label: "Prayers & Devotions", icon: Flame },
      { href: "/worship/today", label: "Today's Readings, Saint & News", icon: Sun },
      { href: "/mass-intention", label: "Request a Mass Intention", icon: Heart },
    ],
  },
  {
    title: "Faith Formation",
    items: [
      { href: "/faith-formation", label: "Overview", icon: GraduationCap },
      { href: "/calendar?filter=ccd", label: "CCD Calendar", icon: Calendar },
      { href: "/ccd-registration", label: "CCD Registration", icon: FileText },
      { href: "/ccd-permissions", label: "CCD Permission Forms", icon: FileText },
    ],
  },
  {
    title: "Parish Life",
    items: [
      { href: "/news", label: "News", icon: Newspaper },
      { href: "/calendar", label: "Calendar", icon: Calendar },
      { href: "/gallery", label: "Photo Gallery", icon: Church },
      { href: "/bulletins", label: "Bulletins & Homilies", icon: BookOpen },
      { href: "/calendar?filter=cyo", label: "CYO Schedule", icon: Calendar },
      { href: "/ministries", label: "Ministries & Devotions", icon: HandHeart },
      { href: "/serve", label: "Serve & Volunteer", icon: Users },
    ],
  },
  {
    title: "About & Connect",
    items: [
      { href: "/about", label: "Our Parish", icon: Church },
      { href: "/staff", label: "Staff & Leadership", icon: Users },
      { href: "/contact", label: "Contact Us", icon: Phone },
      { href: "/new-here", label: "I'm New — Plan Your Visit", icon: UserPlus },
      { href: "/parish-registration", label: "Register as a Parishioner", icon: UserPlus },
    ],
  },
  {
    title: "Give",
    items: [
      { href: "/giving", label: "Give Online", icon: Heart },
    ],
  },
];

// Re-export Search icon for use in MobileMenu
export { Search };
