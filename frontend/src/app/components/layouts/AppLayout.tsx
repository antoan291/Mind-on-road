import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, Link } from "react-router";
import {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Car,
  BookOpen,
  Calendar,
  UserCircle,
  Wrench,
  FolderOpen,
  ClipboardList,
  MessageSquare,
  BarChart3,
  ChevronLeft,
  Wallet,
  Bot,
  FileSignature,
  FileCheck2,
  BrainCircuit,
} from "lucide-react";
import { useAuthSession } from "../../services/authSession";
import type { TenantFeatureKey } from "../../services/featureSettings";
import { useFeatureSettings } from "../../services/featureSettings";

type NavigationItem = {
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  featureKey?: TenantFeatureKey;
  permissionKey?: string;
  ownerOnly?: boolean;
};

export function AppLayout() {
  const { session, logout } = useAuthSession();
  const { isFeatureEnabled } = useFeatureSettings();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const navigationItems: NavigationItem[] = [
    { path: "/", icon: LayoutDashboard, label: "Табло" },
    {
      path: "/payments",
      icon: CreditCard,
      label: "Плащания",
      featureKey: "payments",
      permissionKey: "payments.read",
    },
    {
      path: "/expenses",
      icon: Wallet,
      label: "Разходи",
      featureKey: "payments",
      permissionKey: "payments.read",
    },
    {
      path: "/students",
      icon: Users,
      label: "Курсисти",
      permissionKey: "students.read",
    },
    {
      path: "/invoices",
      icon: FileText,
      label: "Фактури",
      featureKey: "invoices",
      permissionKey: "invoices.read",
    },
    {
      path: "/practical-lessons",
      icon: Car,
      label: "Практика",
      featureKey: "practical",
      permissionKey: "scheduling.read",
    },
    {
      path: "/theory",
      icon: BookOpen,
      label: "Теория",
      featureKey: "theory",
      permissionKey: "scheduling.read",
    },
    {
      path: "/schedule",
      icon: Calendar,
      label: "График",
      featureKey: "practical",
      permissionKey: "scheduling.read",
    },
    {
      path: "/instructors",
      icon: UserCircle,
      label: "Инструктори",
      featureKey: "practical",
      permissionKey: "scheduling.read",
    },
    {
      path: "/vehicles",
      icon: Car,
      label: "Автомобили",
      featureKey: "practical",
      permissionKey: "vehicles.read",
    },
    {
      path: "/documents",
      icon: FolderOpen,
      label: "Документи",
      featureKey: "documents",
      permissionKey: "documents.read",
    },
    {
      path: "/candidates",
      icon: FileSignature,
      label: "Кандидати",
      featureKey: "documents",
      permissionKey: "documents.manage",
    },
    {
      path: "/determinator",
      icon: BrainCircuit,
      label: "Детерминатор",
      featureKey: "practical",
      permissionKey: "students.manage_register",
    },
    {
      path: "/exam-applications",
      icon: FileCheck2,
      label: "Заявления за изпит",
      featureKey: "documents",
      permissionKey: "students.manage_register",
    },
    {
      path: "/road-sheets",
      icon: ClipboardList,
      label: "Пътни листове",
      featureKey: "practical",
      permissionKey: "scheduling.read",
    },
    {
      path: "/notifications",
      icon: MessageSquare,
      label: "Известия",
      permissionKey: "students.read",
    },
    {
      path: "/reports",
      icon: BarChart3,
      label: "Отчети",
      featureKey: "reports",
      permissionKey: "reports.read",
    },
    {
      path: "/settings",
      icon: Settings,
      label: "Настройки",
      ownerOnly: true,
    },
    {
      path: "/ai",
      icon: Bot,
      label: "AI Център",
      featureKey: "ai",
      permissionKey: "reports.read",
    },
  ].filter(
    (item) =>
      (!item.featureKey || isFeatureEnabled(item.featureKey)) &&
      (!item.permissionKey ||
        session?.user.permissionKeys.includes(item.permissionKey) ||
        session?.user.roleKeys.includes("owner")) &&
      (!item.ownerOnly || session?.user.roleKeys.includes("owner")),
  );
  const displayName = session?.user.displayName ?? "Потребител";
  const roleLabel = session?.user.roleKeys.includes("owner")
    ? "Owner"
    : session?.user.roleKeys[0] ?? "Потребител";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-page)" }}
    >
      {/* Left Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-64" : "w-0 lg:w-20"}
        `}
        style={{ background: "var(--bg-panel)" }}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div
            className="h-16 flex items-center px-6 border-b"
            style={{ borderColor: "var(--ghost-border)" }}
          >
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))",
                  }}
                >
                  <Car size={18} color="#ffffff" />
                </div>
                <div>
                  <div
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    MindOnRoad
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    MindOnRoad
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))",
                }}
              >
                <Car size={18} color="#ffffff" />
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-6">
            {navigationItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path));

              return (
                <NavItem
                  key={item.path}
                  to={item.path}
                  icon={<item.icon size={20} />}
                  label={item.label}
                  active={isActive}
                  collapsed={!sidebarOpen}
                />
              );
            })}
          </nav>

          {/* Sidebar Toggle */}
          <div
            className="p-4 border-t"
            style={{ borderColor: "var(--ghost-border)" }}
          >
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full h-10 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-secondary)",
              }}
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 flex-col overflow-hidden">
        {/* Top Bar */}
        <header
          className="flex h-16 flex-none items-center justify-between px-6 border-b"
          style={{
            background: "var(--bg-panel)",
            borderColor: "var(--ghost-border)",
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-secondary)",
              }}
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className="hidden md:flex items-center gap-2 h-10 px-4 rounded-lg"
              style={{ background: "var(--bg-card)" }}
            >
              <Search size={16} style={{ color: "var(--text-tertiary)" }} />
              <input
                type="text"
                placeholder={"\u0422\u044A\u0440\u0441\u0435\u043D\u0435..."}
                className="bg-transparent border-none outline-none w-48"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            {/* Notifications */}
            <Link to="/notifications">
              <button
                className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-secondary)",
                }}
              >
                <Bell size={18} />
                <span
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ background: "var(--status-error)" }}
                />
              </button>
            </Link>

            {/* User Profile */}
            <div className="relative ml-2" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((current) => !current)}
                className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all"
                style={{
                  background: profileOpen ? "var(--bg-card)" : "transparent",
                }}
              >
                <div className="hidden md:block text-right">
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {displayName}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {roleLabel}
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--ai-accent), var(--ai-accent-dim))",
                    color: "#ffffff",
                  }}
                >
                  {initials || "U"}
                </div>
                <ChevronDown
                  size={16}
                  style={{ color: "var(--text-tertiary)" }}
                />
              </button>
              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-3 w-48 rounded-2xl p-2"
                  style={{
                    background: "rgba(15, 23, 42, 0.96)",
                    border: "1px solid var(--ghost-border)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      void logout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm"
                    style={{
                      color: "var(--text-secondary)",
                      background: "transparent",
                    }}
                  >
                    <LogOut size={16} />
                    {"\u0418\u0437\u043B\u0435\u0437"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function NavItem({
  to,
  icon,
  label,
  active = false,
  collapsed = false,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}) {
  return (
    <Link to={to}>
      <button
        className={`
          w-full h-11 rounded-lg flex items-center gap-3 px-3
          transition-all duration-200
          ${active ? "shadow-[var(--glow-indigo)]" : "hover:shadow-[var(--glow-indigo)]"}
        `}
        style={{
          background: active ? "var(--primary-accent)" : "transparent",
          color: active ? "#ffffff" : "var(--text-secondary)",
        }}
      >
        <span className={collapsed ? "mx-auto" : ""}>{icon}</span>
        {!collapsed && <span className="font-medium text-sm">{label}</span>}
      </button>
    </Link>
  );
}
