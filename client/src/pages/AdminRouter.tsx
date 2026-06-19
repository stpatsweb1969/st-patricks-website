import { Route, Switch, Redirect } from "wouter";
import { lazy, Suspense } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { hasAccess, type AdminSection, type UserRole } from "../../../shared/roles";

// Lazy-load admin pages for better code splitting
const DashboardHome = lazy(() => import("./admin/DashboardHome"));
const GalleryManager = lazy(() => import("./admin/GalleryManager"));
const UserManager = lazy(() => import("./admin/UserManager"));
const SettingsManager = lazy(() => import("./admin/SettingsManager"));

const FormExport = lazy(() => import("./admin/FormExport").then(m => ({ default: m.FormExport })));
const FaqManager = lazy(() => import("./admin/FaqManager"));
const VolunteerNeedsManager = lazy(() => import("./admin/VolunteerNeedsManager"));
const NeedsAttention = lazy(() => import("./admin/NeedsAttention"));
const ClosureManager = lazy(() => import("./admin/ClosureManager").then(m => ({ default: m.ClosureManager })));
const ScheduleManager = lazy(() => import("./admin/ScheduleManager"));
const MassIntentionsManager = lazy(() => import("./admin/MassIntentionsManager").then(m => ({ default: m.MassIntentionsManager })));
const AnnouncementComposer = lazy(() => import("./admin/AnnouncementComposer"));
const AuditLog = lazy(() => import("./admin/AuditLog"));
const StaffManager = lazy(() => import("./admin/StaffManager"));
const HolyDaysManager = lazy(() => import("./admin/HolyDaysManager"));

// Legacy managers — lazy-loaded from individual files for proper code splitting
const NewsManager = lazy(() => import("./admin/NewsManager").then(m => ({ default: m.NewsManager })));
const BulletinManager = lazy(() => import("./admin/BulletinManager").then(m => ({ default: m.BulletinManager })));
const EventManager = lazy(() => import("./admin/EventManager").then(m => ({ default: m.EventManager })));
const SubscriberList = lazy(() => import("./admin/SubscriberList").then(m => ({ default: m.SubscriberList })));
const CcdManager = lazy(() => import("./admin/CcdManager").then(m => ({ default: m.CcdManager })));
const CyoManager = lazy(() => import("./admin/CyoManager").then(m => ({ default: m.CyoManager })));
const VolunteerManager = lazy(() => import("./admin/VolunteerManager").then(m => ({ default: m.VolunteerManager })));
const DocumentsManager = lazy(() => import("./admin/DocumentsManager").then(m => ({ default: m.DocumentsManager })));
const SacramentsManager = lazy(() => import("./admin/SacramentsManager").then(m => ({ default: m.SacramentsManager })));
const ParishRegistrationsManager = lazy(() => import("./admin/ParishRegistrationsManager").then(m => ({ default: m.ParishRegistrationsManager })));
const CcdPermissionsManager = lazy(() => import("./admin/CcdPermissionsManager").then(m => ({ default: m.CcdPermissionsManager })));
const KeyDatesManager = lazy(() => import("./admin/KeyDatesManager").then(m => ({ default: m.KeyDatesManager })));

function AdminFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

/** Route guard: renders children only if user's role has access to the given section */
function SectionGuard({ section, children }: { section: AdminSection; children: React.ReactNode }) {
  const { user } = useAuth();
  const role = (user?.role ?? "user") as UserRole;
  if (role === "admin" || hasAccess(role, section)) {
    return <>{children}</>;
  }
  return <Redirect to="/admin" />;
}

export default function AdminRouter() {
  return (
    <AdminLayout>
      <Suspense fallback={<AdminFallback />}>
        <Switch>
          <Route path="/" component={() => <DashboardHome />} />
          <Route path="/news" component={() => <SectionGuard section="news"><NewsManager /></SectionGuard>} />
          <Route path="/bulletins" component={() => <SectionGuard section="bulletins"><BulletinManager /></SectionGuard>} />
          <Route path="/gallery" component={() => <SectionGuard section="gallery"><GalleryManager /></SectionGuard>} />
          <Route path="/subscribers" component={() => <SectionGuard section="subscribers"><SubscriberList /></SectionGuard>} />
          <Route path="/events" component={() => <SectionGuard section="events"><EventManager /></SectionGuard>} />
          <Route path="/key-dates" component={() => <SectionGuard section="key_dates"><KeyDatesManager /></SectionGuard>} />
          <Route path="/volunteers" component={() => <SectionGuard section="volunteers"><VolunteerManager /></SectionGuard>} />
          <Route path="/volunteer-needs" component={() => <SectionGuard section="volunteers"><VolunteerNeedsManager /></SectionGuard>} />
          <Route path="/needs-attention" component={() => <NeedsAttention />} />
          <Route path="/registrations" component={() => <SectionGuard section="registrations"><ParishRegistrationsManager /></SectionGuard>} />
          <Route path="/ccd" component={() => <SectionGuard section="ccd_registrations"><CcdManager /></SectionGuard>} />
          <Route path="/ccd-calendar" component={() => <SectionGuard section="ccd_calendar"><CcdManager /></SectionGuard>} />
          <Route path="/ccd-permissions" component={() => <SectionGuard section="ccd_permissions"><CcdPermissionsManager /></SectionGuard>} />
          <Route path="/documents" component={() => <SectionGuard section="documents"><DocumentsManager /></SectionGuard>} />
          <Route path="/cyo" component={() => <SectionGuard section="cyo"><CyoManager /></SectionGuard>} />
          <Route path="/teen-life" component={() => <SectionGuard section="teen_life"><CyoManager /></SectionGuard>} />
          <Route path="/sacraments" component={() => <SectionGuard section="sacraments"><SacramentsManager /></SectionGuard>} />
          <Route path="/users" component={() => <SectionGuard section="users"><UserManager /></SectionGuard>} />
          <Route path="/settings" component={() => <SectionGuard section="settings"><SettingsManager /></SectionGuard>} />
          <Route path="/form-export" component={() => <SectionGuard section="form_export"><FormExport /></SectionGuard>} />
          <Route path="/faq" component={() => <SectionGuard section="faq"><FaqManager /></SectionGuard>} />
          <Route path="/closure" component={() => <ClosureManager />} />
          <Route path="/schedule" component={() => <ScheduleManager />} />
          <Route path="/mass-intentions" component={() => <MassIntentionsManager />} />
          <Route path="/announcements" component={() => <AnnouncementComposer />} />
          <Route path="/audit-log" component={() => <AuditLog />} />
          <Route path="/staff" component={() => <StaffManager />} />
          <Route path="/holy-days" component={() => <SectionGuard section="sacraments"><HolyDaysManager /></SectionGuard>} />
          {/* Fallback to dashboard */}
          <Route component={() => <DashboardHome />} />
        </Switch>
      </Suspense>
    </AdminLayout>
  );
}
