import staticContentJson from './static-content.json';

export type StaticContent = typeof staticContentJson;
export type DashboardContent = StaticContent['dashboard'];
export type DashboardQuickActionKey = keyof DashboardContent['quickActions'];
export type DashboardQuickActionField = DashboardContent['quickActions'][DashboardQuickActionKey]['fields'][number];
export type AICenterContent = StaticContent['aiCenter'];

export const staticContent = staticContentJson;
export const dashboardContent = staticContent.dashboard;
export const aiCenterContent = staticContent.aiCenter;
