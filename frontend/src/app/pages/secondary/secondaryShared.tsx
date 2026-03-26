import type { StatusTone } from './secondaryData';
export type { StatusTone } from './secondaryData';
import { StatusBadge } from '../../components/ui-system/StatusBadge';

export function PageSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 p-6 lg:space-y-8 lg:p-8">{children}</div>;
}

export function MetricGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function TwoColumnGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">{children}</div>;
}

export function ThreeColumnGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 xl:grid-cols-3">{children}</div>;
}

export function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-3xl p-5 lg:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}><div className="mb-5"><h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2><p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p></div>{children}</section>;
}

export function MetricCard({ icon, label, value, detail, tone = 'neutral' }: { icon: React.ReactNode; label: string; value: string; detail: string; tone?: StatusTone }) {
  const accent = tone === 'warning' ? 'var(--status-warning)' : tone === 'error' ? 'var(--status-error)' : tone === 'success' ? 'var(--status-success)' : tone === 'info' ? 'var(--status-info)' : 'var(--primary-accent)';
  return <div className="rounded-3xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}><div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'var(--bg-card-elevated)', color: accent }}>{icon}</div></div><p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p><p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p><p className="mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>{detail}</p></div>;
}

export function InsightCard({ icon, title, body, tone = 'neutral' }: { icon: React.ReactNode; title: string; body: string; tone?: StatusTone }) {
  const color = tone === 'warning' ? 'var(--status-warning)' : tone === 'error' ? 'var(--status-error)' : tone === 'info' ? 'var(--ai-accent)' : 'var(--primary-accent)';
  return <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(25, 37, 64, 0.92))', border: '1px solid var(--ghost-border)' }}><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', color }}>{icon}</div><h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3></div><p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{body}</p></div>;
}

export function InfoLine({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>{label}</p><p className="mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p></div>;
}

export function DataTableLayout({ columns, rows }: { columns: string[]; rows: React.ReactNode[][] }) {
  return <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid var(--ghost-border)' }}><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead style={{ background: 'var(--bg-card-elevated)' }}><tr>{columns.map((column) => <th key={column} className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-medium" style={{ color: 'var(--text-tertiary)' }}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index} style={{ background: index % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-card-elevated)' }}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-4 align-top" style={{ color: cellIndex === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{cell}</td>)}</tr>)}</tbody></table></div></div>;
}

export function ChecklistItem({ title, description, tone = 'neutral' }: { title: string; description: string; tone?: StatusTone }) {
  return <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--ghost-border)' }}><div className="flex items-center gap-3"><StatusBadge status={tone}>{statusLabel(tone)}</StatusBadge><h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3></div><p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{description}</p></div>;
}

export function ProgressRow({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: StatusTone }) {
  const numeric = Number.parseInt(value, 10);
  const barColor = tone === 'warning' ? 'var(--status-warning)' : tone === 'info' ? 'var(--ai-accent)' : 'var(--primary-accent)';
  return <div className="space-y-2"><div className="flex items-center justify-between text-sm"><span style={{ color: 'var(--text-primary)' }}>{label}</span><span style={{ color: 'var(--text-secondary)' }}>{value}</span></div><div className="h-2 rounded-full" style={{ background: 'var(--bg-card-elevated)' }}><div className="h-2 rounded-full" style={{ width: `${Number.isNaN(numeric) ? 0 : numeric}%`, background: barColor }} /></div></div>;
}

export function InfoStack({ items }: { items: [string, string][] }) {
  return <div className="space-y-4">{items.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 rounded-2xl p-4" style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--ghost-border)' }}><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span><span className="text-sm text-right font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span></div>)}</div>;
}

export function ToggleLine({ label, state, tone = 'neutral' }: { label: string; state: string; tone?: StatusTone }) {
  return <div className="flex items-center justify-between gap-4 rounded-2xl p-4" style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--ghost-border)' }}><span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span><StatusBadge status={tone}>{state}</StatusBadge></div>;
}

export function statusLabel(status: StatusTone) {
  switch (status) {
    case 'success': return 'Изрядно';
    case 'warning': return 'Внимание';
    case 'error': return 'Критично';
    case 'info': return 'Инфо';
    case 'overdue': return 'Просрочено';
    default: return 'Нормално';
  }
}
