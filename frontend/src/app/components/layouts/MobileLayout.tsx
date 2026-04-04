import { Outlet, useLocation, Link } from "react-router";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  Bell,
  Menu,
  Search,
  X,
  Wallet,
  Bot,
  FileSignature,
  BrainCircuit,
} from "lucide-react";
import { useState } from "react";
import { useAuthSession } from "../../services/authSession";
import type { TenantFeatureKey } from "../../services/featureSettings";
import { useFeatureSettings } from "../../services/featureSettings";

type MobileMenuItem = {
  path: string;
  label: string;
  icon?: React.ReactNode;
  featureKey?: TenantFeatureKey;
  permissionKey?: string;
  ownerOnly?: boolean;
};

export function MobileLayout() {
  const { session, logout } = useAuthSession();
  const { isFeatureEnabled } = useFeatureSettings();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
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
      featureKey: "payments",
      permissionKey: "payments.read",
    },
    {
      path: "/expenses",
      label: "Разходи",
      icon: <Wallet size={20} />,
      featureKey: "payments",
      permissionKey: "payments.read",
    },
    {
      path: "/invoices",
      label: "Фактури",
      featureKey: "invoices",
      permissionKey: "invoices.read",
    },
    {
      path: "/practical-lessons",
      label: "Практика",
      featureKey: "practical",
      permissionKey: "scheduling.read",
    },
    {
      path: "/theory",
      label: "Теория",
      featureKey: "theory",
      permissionKey: "scheduling.read",
    },
    {
      path: "/instructors",
      label: "Инструктори",
      featureKey: "practical",
      permissionKey: "scheduling.read",
    },
    {
      path: "/vehicles",
      label: "Автомобили",
      featureKey: "practical",
      permissionKey: "vehicles.read",
    },
    {
      path: "/documents",
      label: "Документи",
      featureKey: "documents",
      permissionKey: "documents.read",
    },
    {
      path: "/candidates",
      label: "Кандидати",
      icon: <FileSignature size={20} />,
      featureKey: "documents",
      permissionKey: "documents.manage",
    },
    {
      path: "/determinator",
      label: "Детерминатор",
      icon: <BrainCircuit size={20} />,
      featureKey: "practical",
      permissionKey: "students.manage_register",
    },
    {
      path: "/road-sheets",
      label: "Пътни листове",
      featureKey: "practical",
      permissionKey: "scheduling.read",
    },
    {
      path: "/reports",
      label: "Отчети",
      featureKey: "reports",
      permissionKey: "reports.read",
    },
    {
      path: "/ai",
      label: "AI Център",
      icon: <Bot size={20} />,
      featureKey: "ai",
      permissionKey: "reports.read",
    },
    {
      path: "/settings",
      label: "Настройки",
      ownerOnly: true,
    },
  ].filter(
    (item) =>
      (!item.featureKey || isFeatureEnabled(item.featureKey)) &&
      (!item.permissionKey ||
        session?.user.permissionKeys.includes(item.permissionKey) ||
        session?.user.roleKeys.includes("owner")) &&
      (!item.ownerOnly || session?.user.roleKeys.includes("owner")),
  );

  const visibleBottomNavItems = bottomNavItems.filter(
    (item) =>
      (!('featureKey' in item) ||
        !item.featureKey ||
        isFeatureEnabled(item.featureKey)) &&
      (!('permissionKey' in item) ||
        !item.permissionKey ||
        session?.user.permissionKeys.includes(item.permissionKey) ||
        session?.user.roleKeys.includes("owner")),
  );

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
          <div>
            <div
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              MindOnRoad
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
            }}
          >
            <Search size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 h-16 border-t z-50"
        style={{
          background: "var(--bg-panel)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <div className="h-full flex items-center justify-around px-2">
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
        <div
          className="fixed inset-0 z-50"
          style={{ background: "var(--bg-page)" }}
        >
          <div
            className="h-14 flex items-center justify-between px-4 border-b"
            style={{
              background: "var(--bg-panel)",
              borderColor: "var(--ghost-border)",
            }}
          >
            <h2 style={{ color: "var(--text-primary)" }}>Меню</h2>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-secondary)",
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-2">
            {menuItems.map((item) => (
              <MenuLink
                key={item.path}
                to={item.path}
                label={item.label}
                icon={item.icon}
                onClick={() => setMenuOpen(false)}
              />
            ))}

            <div className="pt-6">
              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: "var(--bg-card)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--ai-accent), var(--ai-accent-dim))",
                    color: "#ffffff",
                  }}
                >
                  {initials || "U"}
                </div>
                <div>
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
              </div>
            </div>

            <button
              onClick={() => {
                setMenuOpen(false);
                void logout();
              }}
              className="h-12 w-full rounded-xl font-medium"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--ghost-border-medium)",
              }}
            >
              Излез
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  to,
  label,
  icon,
  onClick,
}: {
  to: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link to={to} onClick={onClick}>
      <button
        className="w-full h-12 px-4 rounded-lg flex items-center gap-3 transition-all"
        style={{
          background: "var(--bg-card)",
          color: "var(--text-primary)",
        }}
      >
        {icon && <span style={{ color: "var(--text-secondary)" }}>{icon}</span>}
        <span className="font-medium">{label}</span>
      </button>
    </Link>
  );
}
