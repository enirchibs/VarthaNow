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
import { AboutPage, ContactPage, PrivacyPage, TermsPage, DisclaimerPage } from "@/pages/LegalPages";
import { HealthPortal } from "@/pages/health/HealthPortal";

import { MaatlaaduAIPage } from "@/pages/tutor/MaatlaaduAIPage";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/market", element: <ManaMarketPage /> },
      { path: "/mahila-market", element: <MahilaMarketPage /> },
      { path: "/services", element: <ServicesRentalPage /> },
      { path: "/raitu-bazar", element: <RaituBazarPage /> },
      { path: "/prakatanalu", element: <PrakatanaluPage /> },
      { path: "/maatlaadu-ai", element: <MaatlaaduAIPage /> },
      { path: "/category/health", element: <Navigate to="/health" replace /> },
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
      { path: "/disclaimer", element: <DisclaimerPage /> }
    ]
  }
]);

export function App() {
  return <RouterProvider router={router} />;
}
