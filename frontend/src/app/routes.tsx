import { createBrowserRouter } from "react-router";
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

export const router = createBrowserRouter([
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
      { path: "expenses", Component: ExpensesPage },
      { path: "invoices", Component: InvoicesPage },
      { path: "practical-lessons", Component: ResponsivePracticalLessonsPage },
      { path: "theory", Component: ResponsiveTheoryPage },
      { path: "theory/:id", Component: TheoryGroupPage },
      { path: "schedule", Component: ResponsiveSchedulePage },
      { path: "instructors", Component: InstructorsPage },
      { path: "instructors/:id", Component: InstructorDetailPage },
      { path: "vehicles", Component: VehiclesPage },
      { path: "documents", Component: ResponsiveDocumentsPage },
      { path: "candidates", Component: CandidatePacketsPage },
      { path: "determinator", Component: DeterminatorPage },
      { path: "road-sheets", Component: RoadSheetsPage },
      { path: "notifications", Component: NotificationsPage },
      { path: "reports", Component: ReportsPage },
      { path: "settings", Component: SettingsPage },
      { path: "ai", Component: AICenterPage },
      { path: "ai/chat", Component: AICenterChatPage },
    ],
  },
]);

