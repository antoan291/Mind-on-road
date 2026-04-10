import { Outlet, useLocation, Link } from "react-router";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  Bell,
  Menu,
  X,
  Wallet,
  Bot,
  FileSignature,
  FileCheck2,
  BrainCircuit,
  Receipt,
  Car,
  BookOpen,
  FolderOpen,
  ClipboardList,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useAuthSession } from "../../services/authSession";
import type { TenantFeatureKey } from "../../services/featureSettings";
import { useFeatureSettings } from "../../services/featureSettings";
import {
  hasAiCenterAccessRole,
  getPrimaryRoleLabel,
  hasDeterminatorAccessRole,
  hasDeveloperRole,
  hasFullAccessRole,
  hasInstructorsAccessRole,
  hasPersonnelAccessRole,
} from "../../services/roleUtils";

type MobileMenuItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
  section: "finance" | "training" | "operations" | "system";
  shortLabel?: string;
  featureKey?: TenantFeatureKey;
  permissionKey?: string;
  ownerOnly?: boolean;
  developerOnly?: boolean;
  visible?: boolean;
};

export function MobileLayout() {
  const { session, logout } = useAuthSession();
  const { isFeatureEnabled } = useFeatureSettings();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = session?.user.displayName ?? "Потребител";
  const roleLabel = getPrimaryRoleLabel(session?.user.roleKeys ?? []);
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase();

  const bottomNavItems = [
    { path: "/", icon: LayoutDashboard, label: "Табло" },
    {
      path: "/students",
      icon: Users,
      label: "Курсисти",
      permissionKey: "students.read",
    },
    {
      path: "/schedule",
      icon: Calendar,
      label: "График",
      featureKey: "practical",
      permissionKey: "scheduling.read",
    },
    {
      path: "/notifications",
      icon: Bell,
      label: "Известия",
      permissionKey: "students.read",
    },
    {
      path: "/menu",
      icon: Menu,
      label: "Меню",
      action: () => setMenuOpen(true),
    },
  ];
  const menuItems: MobileMenuItem[] = [
    {
      path: "/payments",
      label: "Плащания",
      icon: <CreditCard size={20} />,
      shortLabel: "Плащания",
      section: "finance",
      featureKey: "payments",
      permissionKey: "payments.read",
    },
    {
      path: "/expenses",
      label: "Разходи",
      icon: <Wallet size={20} />,
      shortLabel: "Разходи",
      section: "finance",
      featureKey: "payments",
      permissionKey: "payments.read",
    },
    {
      path: "/invoices",
      label: "Фактури",
      icon: <Receipt size={20} />,
      shortLabel: "Фактури",
      section: "finance",
      featureKey: "invoices",
      permissionKey: "invoices.read",
    },
    {
      path: "/practical-lessons",
      label: "Практика",
      icon: <Car size={20} />,
      shortLabel: "Практика",
      section: "training",
      featureKey: "practical",
      permissionKey: "scheduling.read",
    },
    {
      path: "/theory",
      label: "Теория",
      icon: <BookOpen size={20} />,
      shortLabel: "Теория",
      section: "training",
      featureKey: "theory",
      permissionKey: "scheduling.read",
    },
    {
      path: "/instructors",
      label: "Инструктори",
      icon: <UserCircle size={20} />,
      shortLabel: "Инструктори",
      section: "training",
      permissionKey: "students.read",
      visible: hasInstructorsAccessRole(session?.user.roleKeys ?? []),
    },
    {
      path: "/personnel",
      label: "Персонал",
      icon: <UserCircle size={20} />,
      shortLabel: "Персонал",
      section: "training",
      permissionKey: "users.manage",
      visible: hasPersonnelAccessRole(session?.user.roleKeys ?? []),
    },
    {
      path: "/vehicles",
      label: "Автомобили",
      icon: <Car size={20} />,
      shortLabel: "Автомобили",
      section: "training",
      featureKey: "practical",
      permissionKey: "vehicles.read",
    },
    {
      path: "/documents",
      label: "Документи",
      icon: <FolderOpen size={20} />,
      shortLabel: "Документи",
      section: "operations",
      featureKey: "documents",
      permissionKey: "documents.read",
    },
    {
      path: "/candidates",
      label: "Кандидати",
      icon: <FileSignature size={20} />,
      shortLabel: "Кандидати",
      section: "operations",
      featureKey: "documents",
      permissionKey: "documents.manage",
    },
    {
      path: "/determinator",
      label: "Детерминатор",
      icon: <BrainCircuit size={20} />,
      shortLabel: "Детерминатор",
      section: "operations",
      featureKey: "practical",
      permissionKey: "students.manage_register",
      visible: hasDeterminatorAccessRole(session?.user.roleKeys ?? []),
    },
    {
      path: "/exam-applications",
      label: "Заявления за изпит",
      icon: <FileCheck2 size={20} />,
      shortLabel: "Изпити",
      section: "operations",
      featureKey: "documents",
      permissionKey: "students.manage_register",
    },
    {
      path: "/road-sheets",
      label: "Пътни листове",
      icon: <ClipboardList size={20} />,
      shortLabel: "Пътни листове",
      section: "operations",
      featureKey: "practical",
      permissionKey: "scheduling.read",
    },
    {
      path: "/reports",
      label: "Отчети",
      icon: <BarChart3 size={20} />,
      shortLabel: "Отчети",
      section: "finance",
      featureKey: "reports",
      permissionKey: "reports.read",
    },
    {
      path: "/ai",
      label: "AI Център",
      icon: <Bot size={20} />,
      shortLabel: "AI Център",
      section: "system",
      featureKey: "ai",
      permissionKey: "reports.read",
      visible: hasAiCenterAccessRole(session?.user.roleKeys ?? []),
    },
    {
      path: "/settings",
      label: "Настройки",
      icon: <Settings size={20} />,
      shortLabel: "Настройки",
      section: "system",
      developerOnly: true,
    },
  ].filter(
    (item) =>
      (!item.featureKey || isFeatureEnabled(item.featureKey)) &&
      (!item.permissionKey ||
        session?.user.permissionKeys.includes(item.permissionKey) ||
        hasFullAccessRole(session?.user.roleKeys ?? [])) &&
      item.visible !== false &&
      (!item.ownerOnly || hasFullAccessRole(session?.user.roleKeys ?? [])) &&
      (!item.developerOnly || hasDeveloperRole(session?.user.roleKeys ?? [])),
  );

  const visibleBottomNavItems = bottomNavItems.filter(
    (item) =>
      (!('featureKey' in item) ||
        !item.featureKey ||
        isFeatureEnabled(item.featureKey)) &&
      (!('permissionKey' in item) ||
        !item.permissionKey ||
        session?.user.permissionKeys.includes(item.permissionKey) ||
        hasFullAccessRole(session?.user.roleKeys ?? [])),
  );
  const currentPageLabel =
    [...visibleBottomNavItems, ...menuItems].find((item) =>
      item.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(item.path),
    )?.label ?? "MindOnRoad";
  const quickMenuItems = menuItems.slice(0, 4);
  const menuSections = [
    {
      key: "finance",
      label: "Финанси",
      items: menuItems.filter((item) => item.section === "finance"),
    },
    {
      key: "training",
      label: "Обучение",
      items: menuItems.filter((item) => item.section === "training"),
    },
    {
      key: "operations",
      label: "Операции",
      items: menuItems.filter((item) => item.section === "operations"),
    },
    {
      key: "system",
      label: "Система",
      items: menuItems.filter((item) => item.section === "system"),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-page)" }}
    >
      <header
        className="h-14 flex items-center justify-between px-4 border-b sticky top-0 z-40"
        style={{
          background: "var(--bg-panel)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))",
            }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: "#ffffff" }}
            >
              KA
            </span>
          </div>
          <div className="min-w-0">
            <div
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--text-tertiary)" }}
            >
              MindOnRoad
            </div>
            <div
              className="text-sm font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
            </div>
          </div>
        </div>

      
      </header>

      <main className="flex-1 overflow-auto pb-24">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 border-t z-50 pb-[env(safe-area-inset-bottom)]"
        style={{
          background: "var(--bg-panel)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <div className="h-16 flex items-center justify-around px-2">
          {visibleBottomNavItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            if (item.action) {
              return (
                <button
                  key={item.path}
                  onClick={item.action}
                  className="flex flex-col items-center justify-center min-w-[64px] h-12 rounded-lg transition-all"
                  style={{
                    background: isActive
                      ? "rgba(99, 102, 241, 0.1)"
                      : "transparent",
                  }}
                >
                  <item.icon
                    size={20}
                    style={{
                      color: isActive
                        ? "var(--primary-accent)"
                        : "var(--text-secondary)",
                    }}
                  />
                  <span
                    className="text-xs mt-1 font-medium"
                    style={{
                      color: isActive
                        ? "var(--primary-accent)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link key={item.path} to={item.path}>
                <button
                  className="flex flex-col items-center justify-center min-w-[64px] h-12 rounded-lg transition-all"
                  style={{
                    background: isActive
                      ? "rgba(99, 102, 241, 0.1)"
                      : "transparent",
                  }}
                >
                  <item.icon
                    size={20}
                    style={{
                      color: isActive
                        ? "var(--primary-accent)"
                        : "var(--text-secondary)",
                    }}
                  />
                  <span
                    className="text-xs mt-1 font-medium"
                    style={{
                      color: isActive
                        ? "var(--primary-accent)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Затвори менюто"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 w-full"
            style={{ background: "rgba(6, 11, 20, 0.72)" }}
          />
          <div
            className="absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col border-l shadow-2xl"
            style={{
              background: "var(--bg-panel)",
              borderColor: "var(--ghost-border)",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-4"
              style={{ borderColor: "var(--ghost-border)" }}
            >
              <div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Навигация
                </p>
                <h2 className="mt-1 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  Меню
                </h2>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-secondary)",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 pb-6 space-y-5">
              <div
                className="rounded-2xl p-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.16), rgba(15,23,42,0.9))",
                  border: "1px solid var(--ghost-border-medium)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))",
                      color: "#ffffff",
                    }}
                  >
                    {initials || "U"}
                  </div>
                  <div
                    className="min-w-0"
                  >
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {displayName}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: "rgba(255,255,255,0.72)" }}
                    >
                      {roleLabel}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {quickMenuItems.map((item) => (
                    <MenuShortcut
                      key={item.path}
                      to={item.path}
                      label={item.shortLabel ?? item.label}
                      icon={item.icon}
                      active={matchesPath(location.pathname, item.path)}
                      onClick={() => setMenuOpen(false)}
                    />
                  ))}
                </div>
              </div>

              {menuSections.map((section) => (
                <div key={section.key}>
                  <p
                    className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {section.label}
                  </p>
                  <div
                    className="overflow-hidden rounded-2xl"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--ghost-border)",
                    }}
                  >
                    {section.items.map((item, index) => (
                      <MenuRow
                        key={item.path}
                        to={item.path}
                        label={item.label}
                        icon={item.icon}
                        active={matchesPath(location.pathname, item.path)}
                        bordered={index < section.items.length - 1}
                        onClick={() => setMenuOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
                className="h-12 w-full rounded-2xl font-medium flex items-center justify-center gap-2"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--ghost-border-medium)",
                }}
              >
                <LogOut size={18} />
                Излез
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuShortcut({
  to,
  label,
  icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link to={to} onClick={onClick}>
      <button
        className="w-full rounded-2xl px-3 py-3 text-left"
        style={{
          background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
          color: "#ffffff",
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: "#ffffff" }}>{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
      </button>
    </Link>
  );
}

function MenuRow({
  to,
  label,
  icon,
  active,
  bordered,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  bordered: boolean;
  onClick: () => void;
}) {
  return (
    <Link to={to} onClick={onClick}>
      <button
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
        style={{
          background: active ? "rgba(99, 102, 241, 0.1)" : "transparent",
          borderBottom: bordered ? "1px solid var(--ghost-border)" : "none",
        }}
      >
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: active ? "rgba(99, 102, 241, 0.16)" : "var(--bg-panel)",
            color: active ? "var(--primary-accent)" : "var(--text-secondary)",
          }}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
        <ChevronRight
          size={16}
          style={{ color: active ? "var(--primary-accent)" : "var(--text-dim)" }}
        />
      </button>
    </Link>
  );
}

function matchesPath(currentPath: string, itemPath: string) {
  return itemPath === "/" ? currentPath === "/" : currentPath.startsWith(itemPath);
}
