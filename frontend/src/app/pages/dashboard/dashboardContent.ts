import { Calendar, DollarSign, FileText, Plus, Users, type LucideIcon } from 'lucide-react';
import { dashboardContent } from '../../content/staticContent';

const iconMap = {
  calendar: Calendar,
  currency: DollarSign,
  file: FileText,
  plus: Plus,
  users: Users,
} satisfies Record<string, LucideIcon>;

export const dashboardHeader = dashboardContent.header;
export const dashboardAlerts = dashboardContent.alerts;
export const dashboardStats = dashboardContent.stats;
export const dashboardSections = dashboardContent.sections;
export const dashboardQuickActions = dashboardContent.quickActions;
export const dashboardLessons = dashboardContent.todayLessons;
export const dashboardOverduePayments = dashboardContent.overduePayments;
export const dashboardExpiringDocuments = dashboardContent.expiringDocuments;
export const dashboardFinanceContent = dashboardContent.finance;

export function getDashboardIcon(iconKey: keyof typeof iconMap) {
  return iconMap[iconKey];
}
