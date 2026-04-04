import { createBrowserRouter } from "react-router";
import { FeatureRouteGuard } from "./components/FeatureRouteGuard";
import { ResponsiveLayout } from "./components/layouts/ResponsiveLayout";
import { DashboardResponsivePage } from "./pages/DashboardResponsivePage";
import { ResponsiveStudentsPage } from "./pages/ResponsiveStudentsPage";
import { ResponsiveStudentDetailPage } from "./pages/ResponsiveStudentDetailPage";
import { ResponsiveStudentFormPage } from "./pages/ResponsiveStudentFormPage";
import { ResponsiveSchedulePage } from "./pages/ResponsiveSchedulePage";
import { ResponsivePracticalLessonsPage } from "./pages/ResponsivePracticalLessonsPage";
import { ResponsiveTheoryPage } from "./pages/ResponsiveTheoryPage";
import { TheoryGroupPage } from "./pages/TheoryGroupPage";
import { ResponsiveDocumentsPage } from "./pages/ResponsiveDocumentsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { AICenterPage } from "./pages/AICenterPage";
import { AICenterChatPage } from "./pages/AICenterChatPage";
import { InstructorsPage } from "./pages/secondary/InstructorsPage";
import { InstructorDetailPage } from "./pages/secondary/InstructorDetailPage";
import { VehiclesPage } from "./pages/secondary/VehiclesPage";
import { RoadSheetsPage } from "./pages/secondary/RoadSheetsPage";
import { NotificationsPage } from "./pages/secondary/NotificationsPage";
import { ReportsPage } from "./pages/secondary/ReportsPage";
import { SettingsPage } from "./pages/secondary/SettingsPage";
import { CandidatePacketsPage } from "./pages/secondary/CandidatePacketsPage";
import { DeterminatorPage } from "./pages/secondary/DeterminatorPage";
import { ExamApplicationsPage } from "./pages/secondary/ExamApplicationsPage";
import { LoginPage } from "./pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: ResponsiveLayout,
    children: [
      { index: true, Component: DashboardResponsivePage },
      {
        path: "students",
        element: (
          <FeatureRouteGuard permissionKey="students.read">
            <ResponsiveStudentsPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "students/new",
        element: (
          <FeatureRouteGuard permissionKey="students.create">
            <ResponsiveStudentFormPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "students/:id",
        element: (
          <FeatureRouteGuard permissionKey="students.read">
            <ResponsiveStudentDetailPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "students/:id/edit",
        element: (
          <FeatureRouteGuard permissionKey="students.update">
            <ResponsiveStudentFormPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "payments",
        element: (
          <FeatureRouteGuard featureKey="payments" permissionKey="payments.read">
            <PaymentsPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "expenses",
        element: (
          <FeatureRouteGuard featureKey="payments" permissionKey="payments.read">
            <ExpensesPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "invoices",
        element: (
          <FeatureRouteGuard featureKey="invoices" permissionKey="invoices.read">
            <InvoicesPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "practical-lessons",
        element: (
          <FeatureRouteGuard featureKey="practical" permissionKey="scheduling.read">
            <ResponsivePracticalLessonsPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "theory",
        element: (
          <FeatureRouteGuard featureKey="theory" permissionKey="scheduling.read">
            <ResponsiveTheoryPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "theory/:id",
        element: (
          <FeatureRouteGuard featureKey="theory" permissionKey="scheduling.read">
            <TheoryGroupPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "schedule",
        element: (
          <FeatureRouteGuard featureKey="practical" permissionKey="scheduling.read">
            <ResponsiveSchedulePage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "instructors",
        element: (
          <FeatureRouteGuard featureKey="practical" permissionKey="scheduling.read">
            <InstructorsPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "instructors/:id",
        element: (
          <FeatureRouteGuard featureKey="practical" permissionKey="scheduling.read">
            <InstructorDetailPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "vehicles",
        element: (
          <FeatureRouteGuard featureKey="practical" permissionKey="vehicles.read">
            <VehiclesPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "documents",
        element: (
          <FeatureRouteGuard featureKey="documents" permissionKey="documents.read">
            <ResponsiveDocumentsPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "candidates",
        element: (
          <FeatureRouteGuard featureKey="documents" permissionKey="documents.manage">
            <CandidatePacketsPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "determinator",
        element: (
          <FeatureRouteGuard featureKey="practical" permissionKey="students.manage_register">
            <DeterminatorPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "exam-applications",
        element: (
          <FeatureRouteGuard featureKey="documents" permissionKey="students.manage_register">
            <ExamApplicationsPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "road-sheets",
        element: (
          <FeatureRouteGuard featureKey="practical" permissionKey="scheduling.read">
            <RoadSheetsPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "notifications",
        element: (
          <FeatureRouteGuard permissionKey="students.read">
            <NotificationsPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "reports",
        element: (
          <FeatureRouteGuard featureKey="reports" permissionKey="reports.read">
            <ReportsPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "settings",
        element: (
          <FeatureRouteGuard ownerOnly>
            <SettingsPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "ai",
        element: (
          <FeatureRouteGuard featureKey="ai" permissionKey="reports.read">
            <AICenterChatPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "ai/center",
        element: (
          <FeatureRouteGuard featureKey="ai" permissionKey="reports.read">
            <AICenterPage />
          </FeatureRouteGuard>
        ),
      },
      {
        path: "ai/chat",
        element: (
          <FeatureRouteGuard featureKey="ai" permissionKey="reports.read">
            <AICenterChatPage />
          </FeatureRouteGuard>
        ),
      },
    ],
  },
]);
