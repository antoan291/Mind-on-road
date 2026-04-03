import { createBrowserRouter } from "react-router";
import { ResponsiveLayout } from "./components/layouts/ResponsiveLayout";
import { DashboardResponsivePage } from "./pages/DashboardResponsivePage";
import { LoginPage } from "./pages/LoginPage";
import { ResponsiveStudentsPage } from "./pages/ResponsiveStudentsPage";
import { ResponsiveStudentDetailPage } from "./pages/ResponsiveStudentDetailPage";
import { ResponsiveStudentFormPage } from "./pages/ResponsiveStudentFormPage";
import { ResponsiveSchedulePage } from "./pages/ResponsiveSchedulePage";
import { ResponsivePracticalLessonsPage } from "./pages/ResponsivePracticalLessonsPage";
import { ResponsiveTheoryPage } from "./pages/ResponsiveTheoryPage";
import { TheoryGroupPage } from "./pages/TheoryGroupPage";
import { ResponsiveDocumentsPage } from "./pages/ResponsiveDocumentsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { AICenterPage } from "./pages/AICenterPage";
import { AICenterChatPage } from "./pages/AICenterChatPage";
import { InstructorsPage } from "./pages/secondary/InstructorsPage";
import { VehiclesPage } from "./pages/secondary/VehiclesPage";
import { RoadSheetsPage } from "./pages/secondary/RoadSheetsPage";
import { NotificationsPage } from "./pages/secondary/NotificationsPage";
import { ReportsPage } from "./pages/secondary/ReportsPage";
import { SettingsPage } from "./pages/secondary/SettingsPage";

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
      { path: "students", Component: ResponsiveStudentsPage },
      { path: "students/new", Component: ResponsiveStudentFormPage },
      { path: "students/:id", Component: ResponsiveStudentDetailPage },
      { path: "students/:id/edit", Component: ResponsiveStudentFormPage },
      { path: "payments", Component: PaymentsPage },
      { path: "invoices", Component: InvoicesPage },
      { path: "practical-lessons", Component: ResponsivePracticalLessonsPage },
      { path: "theory", Component: ResponsiveTheoryPage },
      { path: "theory/:id", Component: TheoryGroupPage },
      { path: "schedule", Component: ResponsiveSchedulePage },
      { path: "instructors", Component: InstructorsPage },
      { path: "vehicles", Component: VehiclesPage },
      { path: "documents", Component: ResponsiveDocumentsPage },
      { path: "road-sheets", Component: RoadSheetsPage },
      { path: "notifications", Component: NotificationsPage },
      { path: "reports", Component: ReportsPage },
      { path: "settings", Component: SettingsPage },
      { path: "ai", Component: AICenterPage },
      { path: "ai/chat", Component: AICenterChatPage },
    ],
  },
]);
