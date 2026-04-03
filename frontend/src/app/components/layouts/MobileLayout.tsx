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

export function MobileLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const bottomNavItems = [
    { path: "/", icon: LayoutDashboard, label: "Табло" },
    { path: "/students", icon: Users, label: "Курсисти" },
    { path: "/schedule", icon: Calendar, label: "График" },
    { path: "/notifications", icon: Bell, label: "Известия" },
    {
      path: "/menu",
      icon: Menu,
      label: "Меню",
      action: () => setMenuOpen(true),
    },
  ];

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
          {bottomNavItems.map((item) => {
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
            <MenuLink
              to="/payments"
              label="Плащания"
              icon={<CreditCard size={20} />}
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/expenses"
              label="Разходи"
              icon={<Wallet size={20} />}
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/invoices"
              label="Фактури"
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/practical-lessons"
              label="Практика"
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/theory"
              label="Теория"
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/instructors"
              label="Инструктори"
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/vehicles"
              label="Автомобили"
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/documents"
              label="Документи"
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/candidates"
              label="Кандидати"
              icon={<FileSignature size={20} />}
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/determinator"
              label="Детерминатор"
              icon={<BrainCircuit size={20} />}
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/road-sheets"
              label="Пътни листове"
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/reports"
              label="Отчети"
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/ai"
              label="AI Център"
              icon={<Bot size={20} />}
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              to="/settings"
              label="Настройки"
              onClick={() => setMenuOpen(false)}
            />

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
                  МИ
                </div>
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Мария Иванова
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Администратор
                  </div>
                </div>
              </div>
            </div>
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
