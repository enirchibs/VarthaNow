import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AdminPage } from "@/pages/AdminPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { HomePage } from "@/pages/HomePage";
import { NewsPage } from "@/pages/NewsPage";
import { SearchPage } from "@/pages/SearchPage";
import { LoginPage } from "@/pages/LoginPage";
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

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/category/:category", element: <CategoryPage /> },
      { path: "/news/:slug", element: <NewsPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/admin", element: <AdminPage /> },
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
