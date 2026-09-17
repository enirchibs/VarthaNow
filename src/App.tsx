import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AdminPage } from "@/pages/AdminPage";
import { DiagnosticsPage } from "@/pages/DiagnosticsPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { HomePage } from "@/pages/HomePage";
import { NewsPage } from "@/pages/NewsPage";
import { SearchPage } from "@/pages/SearchPage";
import { LoginPage } from "@/pages/LoginPage";
import { BookmarksPage } from "@/pages/BookmarksPage";
import { ManaMarketPage } from "@/pages/ManaMarketPage";
import { MahilaMarketPage } from "@/pages/MahilaMarketPage";
import { ServicesRentalPage } from "@/pages/ServicesRentalPage";
import { RaituBazarPage } from "@/pages/RaituBazarPage";
import { PrakatanaluPage } from "@/pages/PrakatanaluPage";
import {
  JobsMainPage,
  JobsWFHPage,
  JobsFresherPage,
  JobsExperiencedPage,
  JobsFreelancePage,
  JobsInternshipPage,
  JobsGovernmentPage,
  JobsStartupPage,
  JobsRemoteITPage,
  JobsAdminPage
} from "@/pages/jobs/JobsPages";
import { 
  AboutPage, 
  ContactPage, 
  PrivacyPage, 
  TermsPage, 
  DisclaimerPage,
  CustomerTermsPage,
  ProviderTermsPage,
  ProviderCodeOfConductPage,
  SafetyTipsPage,
  GrievancePage
} from "@/pages/LegalPages";
import { LegalAgreementsPage } from "@/pages/LegalAgreementsPage";
import { ReportAbusePage } from "@/components/ReportAbuseModal";
import { HealthPortal } from "@/pages/health/HealthPortal";

import { MaatlaaduAIPage } from "@/pages/tutor/MaatlaaduAIPage";
import { DailySharePage } from "@/pages/DailySharePage";
import { DealsPage } from "@/pages/DealsPage";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/daily-share", element: <DailySharePage /> },
      { path: "/market", element: <ManaMarketPage /> },
      { path: "/deals", element: <DealsPage /> },
      { path: "/deals/admin", element: <DealsPage /> },
      { path: "/mahila-market", element: <MahilaMarketPage /> },
      { path: "/matrimony", element: <Navigate to="/" replace /> },
      { path: "/services", element: <ServicesRentalPage /> },
      { path: "/services-rental", element: <Navigate to="/services" replace /> },
      { path: "/sevalu-addelu", element: <Navigate to="/services" replace /> },
      { path: "/raitu-bazar", element: <RaituBazarPage /> },
      { path: "/rythu-bazar", element: <Navigate to="/raitu-bazar" replace /> },
      { path: "/raitu", element: <Navigate to="/raitu-bazar" replace /> },
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
      { path: "/legal-agreements", element: <LegalAgreementsPage /> }
    ]
  }
]);

export function App() {
  return <RouterProvider router={router} />;
}
