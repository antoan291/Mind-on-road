import { Suspense, lazy, type ComponentType, type ReactNode } from "react";
import { createBrowserRouter } from "react-router";
import { FeatureRouteGuard } from "./components/FeatureRouteGuard";
import { ResponsiveLayout } from "./components/layouts/ResponsiveLayout";

function lazyNamed<TModule extends Record<string, unknown>, TExport extends keyof TModule & string>(
  loader: () => Promise<TModule>,
  exportName: TExport,
) {
  return lazy(async () => {
    const module = await loader();

    return {
      default: module[exportName] as ComponentType,
    };
  });
}

function RouteLoader() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      style={{ color: "var(--text-secondary)" }}
    >
      Зареждане...
    </div>
  );
}

function renderRoute(node: ReactNode) {
  return <Suspense fallback={<RouteLoader />}>{node}</Suspense>;
}

const LoginPage = lazyNamed(() => import("./pages/LoginPage"), "LoginPage");
const DashboardResponsivePage = lazyNamed(
  () => import("./pages/DashboardResponsivePage"),
  "DashboardResponsivePage",
);
const ResponsiveStudentsPage = lazyNamed(
  () => import("./pages/ResponsiveStudentsPage"),
  "ResponsiveStudentsPage",
);
const ResponsiveStudentDetailPage = lazyNamed(
  () => import("./pages/ResponsiveStudentDetailPage"),
  "ResponsiveStudentDetailPage",
);
const ResponsiveStudentFormPage = lazyNamed(
  () => import("./pages/ResponsiveStudentFormPage"),
  "ResponsiveStudentFormPage",
);
const ResponsiveSchedulePage = lazyNamed(
  () => import("./pages/ResponsiveSchedulePage"),
  "ResponsiveSchedulePage",
);
const ResponsivePracticalLessonsPage = lazyNamed(
  () => import("./pages/ResponsivePracticalLessonsPage"),
  "ResponsivePracticalLessonsPage",
);
const ResponsiveTheoryPage = lazyNamed(
  () => import("./pages/ResponsiveTheoryPage"),
  "ResponsiveTheoryPage",
);
const TheoryGroupPage = lazyNamed(
  () => import("./pages/TheoryGroupPage"),
  "TheoryGroupPage",
);
const ResponsiveDocumentsPage = lazyNamed(
  () => import("./pages/ResponsiveDocumentsPage"),
  "ResponsiveDocumentsPage",
);
const PaymentsPage = lazyNamed(() => import("./pages/PaymentsPage"), "PaymentsPage");
const ExpensesPage = lazyNamed(() => import("./pages/ExpensesPage"), "ExpensesPage");
const InvoicesPage = lazyNamed(() => import("./pages/InvoicesPage"), "InvoicesPage");
const AICenterPage = lazyNamed(() => import("./pages/AICenterPage"), "AICenterPage");
const AICenterChatPage = lazyNamed(
  () => import("./pages/AICenterChatPage"),
  "AICenterChatPage",
);
const InstructorDetailPage = lazyNamed(
  () => import("./pages/secondary/InstructorDetailPage"),
  "InstructorDetailPage",
);
const InstructorsPage = lazyNamed(
  () => import("./pages/secondary/InstructorsPage"),
  "InstructorsPage",
);
const PersonnelPage = lazyNamed(
  () => import("./pages/secondary/PersonnelPage"),
  "PersonnelPage",
);
const VehiclesPage = lazyNamed(
  () => import("./pages/secondary/VehiclesPage"),
  "VehiclesPage",
);
const RoadSheetsPage = lazyNamed(
  () => import("./pages/secondary/RoadSheetsPage"),
  "RoadSheetsPage",
);
const NotificationsPage = lazyNamed(
  () => import("./pages/secondary/NotificationsPage"),
  "NotificationsPage",
);
const ReportsPage = lazyNamed(
  () => import("./pages/secondary/ReportsPage"),
  "ReportsPage",
);
const SettingsPage = lazyNamed(
  () => import("./pages/secondary/SettingsPage"),
  "SettingsPage",
);
const CandidatePacketsPage = lazyNamed(
  () => import("./pages/secondary/CandidatePacketsPage"),
  "CandidatePacketsPage",
);
const DeterminatorPage = lazyNamed(
  () => import("./pages/secondary/DeterminatorPage"),
  "DeterminatorPage",
);
const ExamApplicationsPage = lazyNamed(
  () => import("./pages/secondary/ExamApplicationsPage"),
  "ExamApplicationsPage",
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: renderRoute(<LoginPage />),
  },
  {
    path: "/",
    Component: ResponsiveLayout,
    children: [
      { index: true, element: renderRoute(<DashboardResponsivePage />) },
      {
        path: "students",
        element: renderRoute(
          <FeatureRouteGuard permissionKey="students.read">
            <ResponsiveStudentsPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "students/new",
        element: renderRoute(
          <FeatureRouteGuard permissionKey="students.create">
            <ResponsiveStudentFormPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "students/:id",
        element: renderRoute(
          <FeatureRouteGuard permissionKey="students.read">
            <ResponsiveStudentDetailPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "students/:id/edit",
        element: renderRoute(
          <FeatureRouteGuard permissionKey="students.update">
            <ResponsiveStudentFormPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "payments",
        element: renderRoute(
          <FeatureRouteGuard featureKey="payments" permissionKey="payments.read">
            <PaymentsPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "expenses",
        element: renderRoute(
          <FeatureRouteGuard featureKey="payments" permissionKey="payments.read">
            <ExpensesPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "invoices",
        element: renderRoute(
          <FeatureRouteGuard featureKey="invoices" permissionKey="invoices.read">
            <InvoicesPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "practical-lessons",
        element: renderRoute(
          <FeatureRouteGuard featureKey="practical" permissionKey="scheduling.read">
            <ResponsivePracticalLessonsPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "theory",
        element: renderRoute(
          <FeatureRouteGuard featureKey="theory" permissionKey="scheduling.read">
            <ResponsiveTheoryPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "theory/:id",
        element: renderRoute(
          <FeatureRouteGuard featureKey="theory" permissionKey="scheduling.read">
            <TheoryGroupPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "schedule",
        element: renderRoute(
          <FeatureRouteGuard featureKey="practical" permissionKey="scheduling.read">
            <ResponsiveSchedulePage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "personnel",
        element: renderRoute(
          <FeatureRouteGuard permissionKey="users.manage" allowedRoleKeys={["owner", "developer"]}>
            <PersonnelPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "instructors",
        element: renderRoute(
          <FeatureRouteGuard permissionKey="students.read" allowedRoleKeys={["owner", "developer", "administration"]}>
            <InstructorsPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "instructors/:id",
        element: renderRoute(
          <FeatureRouteGuard featureKey="practical" permissionKey="students.read" allowedRoleKeys={["owner", "developer", "administration"]}>
            <InstructorDetailPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "vehicles",
        element: renderRoute(
          <FeatureRouteGuard featureKey="practical" permissionKey="vehicles.read">
            <VehiclesPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "documents",
        element: renderRoute(
          <FeatureRouteGuard featureKey="documents" permissionKey="documents.read">
            <ResponsiveDocumentsPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "candidates",
        element: renderRoute(
          <FeatureRouteGuard featureKey="documents" permissionKey="documents.manage">
            <CandidatePacketsPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "determinator",
        element: renderRoute(
          <FeatureRouteGuard
            featureKey="practical"
            permissionKey="students.manage_register"
            allowedRoleKeys={["owner", "developer", "administration"]}
          >
            <DeterminatorPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "exam-applications",
        element: renderRoute(
          <FeatureRouteGuard featureKey="documents" permissionKey="students.manage_register">
            <ExamApplicationsPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "road-sheets",
        element: renderRoute(
          <FeatureRouteGuard featureKey="practical" permissionKey="scheduling.read">
            <RoadSheetsPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "notifications",
        element: renderRoute(
          <FeatureRouteGuard permissionKey="students.read">
            <NotificationsPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "reports",
        element: renderRoute(
          <FeatureRouteGuard featureKey="reports" permissionKey="reports.read">
            <ReportsPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "settings",
        element: renderRoute(
          <FeatureRouteGuard developerOnly>
            <SettingsPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "ai/center",
        element: renderRoute(
          <FeatureRouteGuard featureKey="ai" permissionKey="reports.read" allowedRoleKeys={["owner", "developer"]}>
            <AICenterPage />
          </FeatureRouteGuard>,
        ),
      },
      {
        path: "ai/chat",
        element: renderRoute(
          <FeatureRouteGuard featureKey="ai" permissionKey="reports.read" allowedRoleKeys={["owner", "developer"]}>
            <AICenterChatPage />
          </FeatureRouteGuard>,
        ),
      },
    ],
  },
]);
