import { createBrowserRouter } from "react-router";
import { ResponsiveLayout } from "./components/layouts/ResponsiveLayout";
import { ResponsiveDashboardPage } from "./pages/ResponsiveDashboardPage";
import { ResponsiveStudentsPage } from "./pages/ResponsiveStudentsPage";
import { ResponsiveStudentDetailPage } from "./pages/ResponsiveStudentDetailPage";
import { ResponsiveStudentFormPage } from "./pages/ResponsiveStudentFormPage";
import { ResponsiveSchedulePage } from "./pages/ResponsiveSchedulePage";
import { ResponsiveNotificationsPage } from "./pages/ResponsiveNotificationsPage";
import { ResponsivePracticalLessonsPage } from "./pages/ResponsivePracticalLessonsPage";
import { ResponsiveTheoryPage } from "./pages/ResponsiveTheoryPage";
import { TheoryGroupPage } from "./pages/TheoryGroupPage";
import { ResponsiveDocumentsPage } from "./pages/ResponsiveDocumentsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { PracticalLessonsPage } from "./pages/PracticalLessonsPage";
import { AIPage } from "./pages/AIPage";
import { AIChatPage } from "./pages/AIChatPage";
import { 
  InstructorsPage, 
  VehiclesPage, 
  RoadSheetsPage, 
  ReportsPage, 
  SettingsPage 
} from "./pages/OtherPages";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ResponsiveLayout,
    children: [
      { index: true, Component: ResponsiveDashboardPage },
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
      { path: "notifications", Component: ResponsiveNotificationsPage },
      { path: "reports", Component: ReportsPage },
      { path: "settings", Component: SettingsPage },
      { path: "ai", Component: AIPage },
      { path: "ai/chat", Component: AIChatPage },
    ],
  },
]);
