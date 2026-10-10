import { lazy } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { CategoryPage } from "@/pages/CategoryPage";
import { HomePage } from "@/pages/HomePage";
import { NewsPage } from "@/pages/NewsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Route-level code splitting: only the feed, article and category pages ship in the main bundle.
function lazyNamed<M extends Record<string, unknown>, K extends keyof M & string>(load: () => Promise<M>, name: K) {
  return lazy(async () => ({ default: (await load())[name] as React.ComponentType }));
}

const AdminPage = lazyNamed(() => import("@/pages/AdminPage"), "AdminPage");
const DiagnosticsPage = lazyNamed(() => import("@/pages/DiagnosticsPage"), "DiagnosticsPage");
const SearchPage = lazyNamed(() => import("@/pages/SearchPage"), "SearchPage");
const LoginPage = lazyNamed(() => import("@/pages/LoginPage"), "LoginPage");
const BookmarksPage = lazyNamed(() => import("@/pages/BookmarksPage"), "BookmarksPage");
const ManaMarketPage = lazyNamed(() => import("@/pages/ManaMarketPage"), "ManaMarketPage");
const ServicesRentalPage = lazyNamed(() => import("@/pages/ServicesRentalPage"), "ServicesRentalPage");
const PrakatanaluPage = lazyNamed(() => import("@/pages/PrakatanaluPage"), "PrakatanaluPage");
const JobsMainPage = lazyNamed(() => import("@/pages/jobs/JobsPages"), "JobsMainPage");
const JobsWFHPage = lazyNamed(() => import("@/pages/jobs/JobsPages"), "JobsWFHPage");
const JobsFresherPage = lazyNamed(() => import("@/pages/jobs/JobsPages"), "JobsFresherPage");
const JobsExperiencedPage = lazyNamed(() => import("@/pages/jobs/JobsPages"), "JobsExperiencedPage");
const JobsFreelancePage = lazyNamed(() => import("@/pages/jobs/JobsPages"), "JobsFreelancePage");
const JobsInternshipPage = lazyNamed(() => import("@/pages/jobs/JobsPages"), "JobsInternshipPage");
const JobsGovernmentPage = lazyNamed(() => import("@/pages/jobs/JobsPages"), "JobsGovernmentPage");
const JobsStartupPage = lazyNamed(() => import("@/pages/jobs/JobsPages"), "JobsStartupPage");
const JobsRemoteITPage = lazyNamed(() => import("@/pages/jobs/JobsPages"), "JobsRemoteITPage");
const JobsAdminPage = lazyNamed(() => import("@/pages/jobs/JobsPages"), "JobsAdminPage");
const AboutPage = lazyNamed(() => import("@/pages/LegalPages"), "AboutPage");
const ContactPage = lazyNamed(() => import("@/pages/LegalPages"), "ContactPage");
const PrivacyPage = lazyNamed(() => import("@/pages/LegalPages"), "PrivacyPage");
const TermsPage = lazyNamed(() => import("@/pages/LegalPages"), "TermsPage");
const DisclaimerPage = lazyNamed(() => import("@/pages/LegalPages"), "DisclaimerPage");
const CustomerTermsPage = lazyNamed(() => import("@/pages/LegalPages"), "CustomerTermsPage");
const ProviderTermsPage = lazyNamed(() => import("@/pages/LegalPages"), "ProviderTermsPage");
const ProviderCodeOfConductPage = lazyNamed(() => import("@/pages/LegalPages"), "ProviderCodeOfConductPage");
const SafetyTipsPage = lazyNamed(() => import("@/pages/LegalPages"), "SafetyTipsPage");
const GrievancePage = lazyNamed(() => import("@/pages/LegalPages"), "GrievancePage");
const LegalAgreementsPage = lazyNamed(() => import("@/pages/LegalAgreementsPage"), "LegalAgreementsPage");
const ReportAbusePage = lazyNamed(() => import("@/components/ReportAbuseModal"), "ReportAbusePage");
const HealthPortal = lazyNamed(() => import("@/pages/health/HealthPortal"), "HealthPortal");
const MaatlaaduAIPage = lazyNamed(() => import("@/pages/tutor/MaatlaaduAIPage"), "MaatlaaduAIPage");
const DailySharePage = lazyNamed(() => import("@/pages/DailySharePage"), "DailySharePage");
const DealsPage = lazyNamed(() => import("@/pages/DealsPage"), "DealsPage");
const VideoPage = lazyNamed(() => import("@/pages/VideoPage"), "VideoPage");

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/daily-share", element: <DailySharePage /> },
      { path: "/market", element: <ManaMarketPage /> },
      { path: "/deals", element: <DealsPage /> },
      { path: "/deals/admin", element: <DealsPage /> },
      // Mahila Market & Raitu Bazar are hidden until listings are stored server-side (they only lived in each browser).
      { path: "/mahila-market", element: <Navigate to="/" replace /> },
      { path: "/matrimony", element: <Navigate to="/" replace /> },
      { path: "/services", element: <ServicesRentalPage /> },
      { path: "/services-rental", element: <Navigate to="/services" replace /> },
      { path: "/sevalu-addelu", element: <Navigate to="/services" replace /> },
      { path: "/raitu-bazar", element: <Navigate to="/" replace /> },
      { path: "/rythu-bazar", element: <Navigate to="/" replace /> },
      { path: "/raitu", element: <Navigate to="/" replace /> },
      { path: "/prakatanalu", element: <PrakatanaluPage /> },
      { path: "/maatlaadu-ai", element: <MaatlaaduAIPage /> },
      { path: "/category/health", element: <Navigate to="/health" replace /> },
      { path: "/category/daily-share", element: <Navigate to="/daily-share" replace /> },
      { path: "/category/whatsapp-status", element: <Navigate to="/daily-share" replace /> },
      { path: "/health", element: <HealthPortal /> },
      { path: "/health/:subpage", element: <HealthPortal /> },
      { path: "/bookmarks", element: <BookmarksPage /> },
      { path: "/category/:category", element: <CategoryPage /> },
      { path: "/news/:slug", element: <NewsPage /> },
      { path: "/videos/:id", element: <VideoPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/admin", element: <AdminPage /> },
      { path: "/admin/diagnostics", element: <DiagnosticsPage /> },
      { path: "/jobs", element: <JobsMainPage /> },
      { path: "/jobs/work-from-home", element: <JobsWFHPage /> },
      { path: "/jobs/fresher-jobs", element: <JobsFresherPage /> },
      { path: "/jobs/experienced-jobs", element: <JobsExperiencedPage /> },
      { path: "/jobs/freelance", element: <JobsFreelancePage /> },
      { path: "/jobs/internships", element: <JobsInternshipPage /> },
      { path: "/jobs/government", element: <JobsGovernmentPage /> },
      { path: "/jobs/startup", element: <JobsStartupPage /> },
      { path: "/jobs/remote-it", element: <JobsRemoteITPage /> },
      { path: "/jobs/admin", element: <JobsAdminPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/privacy", element: <PrivacyPage /> },
      { path: "/terms", element: <TermsPage /> },
      { path: "/disclaimer", element: <DisclaimerPage /> },
      { path: "/customer-terms", element: <CustomerTermsPage /> },
      { path: "/provider-terms", element: <ProviderTermsPage /> },
      { path: "/seller-terms", element: <ProviderTermsPage /> },
      { path: "/provider-code-of-conduct", element: <ProviderCodeOfConductPage /> },
      { path: "/safety", element: <SafetyTipsPage /> },
      { path: "/report-abuse", element: <ReportAbusePage /> },
      { path: "/grievance", element: <GrievancePage /> },
      { path: "/legal-agreements", element: <LegalAgreementsPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);

export function App() {
  return <RouterProvider router={router} />;
}
