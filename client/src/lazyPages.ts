/**
 * Lazy-loaded page imports for route-based code splitting.
 * Each page is loaded on demand, reducing initial bundle size.
 */
import { lazy } from "react";

// Core pages (loaded eagerly since they're most visited)
export { default as Home } from "./pages/Home";

// Lazy-loaded pages
export const MassTimes = lazy(() => import("./pages/MassTimes"));
export const NewsEvents = lazy(() => import("./pages/NewsEvents"));
export const Bulletins = lazy(() => import("./pages/Bulletins"));
export const FaithFormation = lazy(() => import("./pages/FaithFormation"));
export const Ministries = lazy(() => import("./pages/Ministries"));
export const Giving = lazy(() => import("./pages/Giving"));
export const Contact = lazy(() => import("./pages/Contact"));
export const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
export const CcdRegistration = lazy(() => import("./pages/CcdRegistration"));
export const CcdUnsubscribe = lazy(() => import("./pages/CcdUnsubscribe"));
export const Sacraments = lazy(() => import("./pages/Sacraments"));
export const AllCalendars = lazy(() => import("./pages/AllCalendars"));
export const FormsDocuments = lazy(() => import("./pages/FormsDocuments"));
export const BaptismForm = lazy(() => import("./pages/BaptismForm"));
export const SponsorForm = lazy(() => import("./pages/SponsorForm"));
export const MarriageForm = lazy(() => import("./pages/MarriageForm"));
export const FuneralForm = lazy(() => import("./pages/FuneralForm"));
export const About = lazy(() => import("./pages/About"));
export const Staff = lazy(() => import("./pages/Staff"));
export const ParishRegistration = lazy(() => import("./pages/ParishRegistration"));
export const CcdPermissions = lazy(() => import("./pages/CcdPermissions"));
export const NewHere = lazy(() => import("./pages/NewHere"));
export const PhotoGallery = lazy(() => import("./pages/PhotoGallery"));
export const Prayers = lazy(() => import("./pages/Prayers"));
export const SacramentProgress = lazy(() => import("./pages/SacramentProgress"));
export const HomilyArchive = lazy(() => import("./pages/HomilyArchive"));
export const Serve = lazy(() => import("./pages/Serve"));
export const WorshipToday = lazy(() => import("./pages/WorshipToday"));
export const MassIntentionForm = lazy(() => import("./pages/MassIntentionForm"));
export const Watch = lazy(() => import("./pages/Watch"));
export const AdminRouter = lazy(() => import("./pages/AdminRouter"));
