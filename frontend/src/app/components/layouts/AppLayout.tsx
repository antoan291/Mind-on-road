import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router';
import { 
  Menu, X, Search, Bell, Settings, 
  LayoutDashboard, Users, CreditCard, FileText, 
  Car, BookOpen, Calendar, UserCircle, 
  Wrench, FolderOpen, ClipboardList, MessageSquare,
  BarChart3, ChevronLeft, Bot
} from 'lucide-react';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navigationItems = [
    { path: '/', icon: LayoutDashboard, label: 'Табло' },
    { path: '/students', icon: Users, label: 'Курсисти' },
    { path: '/payments', icon: CreditCard, label: 'Плащания' },
    { path: '/invoices', icon: FileText, label: 'Фактури' },
    { path: '/practical-lessons', icon: Car, label: 'Практика' },
    { path: '/theory', icon: BookOpen, label: 'Теория' },
    { path: '/schedule', icon: Calendar, label: 'График' },
    { path: '/instructors', icon: UserCircle, label: 'Инструктори' },
    { path: '/vehicles', icon: Car, label: 'Автомобили' },
    { path: '/documents', icon: FolderOpen, label: 'Документи' },
    { path: '/road-sheets', icon: ClipboardList, label: 'Пътни листове' },
    { path: '/notifications', icon: MessageSquare, label: 'Известия' },
    { path: '/reports', icon: BarChart3, label: 'Отчети' },
    { path: '/settings', icon: Settings, label: 'Настройки' },
    { path: '/ai', icon: Bot, label: 'AI Център' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>
      {/* Left Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'}
        `}
        style={{ background: 'var(--bg-panel)' }}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: 'var(--ghost-border)' }}>
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                  background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))'
                }}>
                  <Car size={18} color="#ffffff" />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    KursantAI
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    DriveAdmin
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto" style={{ 
                background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))'
              }}>
                <Car size={18} color="#ffffff" />
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              
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
          <div className="p-4 border-t" style={{ borderColor: 'var(--ghost-border)' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full h-10 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
              style={{ 
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)'
              }}
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header 
          className="h-16 flex items-center justify-between px-6 border-b"
          style={{ 
            background: 'var(--bg-panel)',
            borderColor: 'var(--ghost-border)'
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)'
              }}
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 h-10 px-4 rounded-lg" style={{ background: 'var(--bg-card)' }}>
              <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Търсене..."
                className="bg-transparent border-none outline-none w-48"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            {/* Notifications */}
            <Link to="/notifications">
              <button 
                className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              >
                <Bell size={18} />
                <span 
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ background: 'var(--status-error)' }}
                />
              </button>
            </Link>

            {/* User Profile */}
            <div className="flex items-center gap-3 ml-2">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Мария Иванова
                </div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Администратор
                </div>
              </div>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                style={{ 
                  background: 'linear-gradient(135deg, var(--ai-accent), var(--ai-accent-dim))',
                  color: '#ffffff'
                }}
              >
                МИ
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
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
          ${active ? 'shadow-[var(--glow-indigo)]' : 'hover:shadow-[var(--glow-indigo)]'}
        `}
        style={{
          background: active ? 'var(--primary-accent)' : 'transparent',
          color: active ? '#ffffff' : 'var(--text-secondary)',
        }}
      >
        <span className={collapsed ? 'mx-auto' : ''}>{icon}</span>
        {!collapsed && <span className="font-medium text-sm">{label}</span>}
      </button>
    </Link>
  );
}


