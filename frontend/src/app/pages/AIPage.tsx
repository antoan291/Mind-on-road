
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Bot, BrainCircuit, CheckCircle2, MessageSquareText, Search, SendHorizonal, ShieldCheck, TrendingUp, TriangleAlert } from 'lucide-react';
import { PageHeader } from '../components/ui-system/PageHeader';
import { Button } from '../components/ui-system/Button';
import { StatusBadge } from '../components/ui-system/StatusBadge';
import { AICenterTabs } from './ai-center/AICenterTabs';

export function AIPage() {
  const [activeTab, setActiveTab] = useState<'risk' | 'assistant' | 'documents'>('documents');

  return (
    <div>
      <PageHeader
        title="AI Център"
        description="AI workspace за риск от отпадане, бизнес асистент и документна проверка в рамките на текущата школа."
        breadcrumbs={[{ label: 'Начало' }, { label: 'AI Център' }]}
        actions={<>
          <Button variant="secondary" icon={<ShieldCheck size={18} />}>Guardrails</Button>
          <Link to="/ai/chat"><Button variant="primary" icon={<Bot size={18} />}>Пълен AI чат</Button></Link>
        </>}
      />
      <div className="space-y-6 p-6 lg:p-8">
        <AICenterTabs activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === 'risk' && <RiskWorkspace />}
        {activeTab === 'assistant' && <AssistantWorkspace />}
        {activeTab === 'documents' && <DocumentsWorkspace />}
      </div>
    </div>
  );
}
function RiskWorkspace() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Висок риск" value="3" color="#ff6b8b" icon={<TrendingUp size={18} />} />
        <SummaryCard title="Среден" value="7" color="#f59e0b" icon={<BrainCircuit size={18} />} />
        <SummaryCard title="Нисък" value="37" color="#b8f7d4" icon={<CheckCircle2 size={18} />} />
      </div>
      <section className="rounded-[30px] p-5 lg:p-6" style={{ background: 'rgba(11, 19, 39, 0.96)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Анализ на курсисти в риск</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>Сортирани по приоритет за действие.</p>
          </div>
          <button className="rounded-2xl px-4 py-2.5 text-sm font-medium" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--text-secondary)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>Филтър: всички категории</button>
        </div>
        <div className="mt-5 overflow-hidden rounded-[24px] border" style={{ borderColor: 'rgba(148, 163, 184, 0.12)' }}>
          <div className="grid grid-cols-[1.25fr_0.6fr_0.8fr_1.1fr_0.7fr_0.8fr] gap-3 px-5 py-4 text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.02)' }}>
            <span>Курсист</span><span>Категория</span><span>Риск</span><span>Фактори</span><span>+часове</span><span className="text-right">Действие</span>
          </div>
          <RiskRow initials="МГ" name="М. Георгиева" category="B" score="7.2" width="72%" color="#ff6b8b" factors="Пропуснати 3 урока" extraHours="+5ч" action="Обади се" highlight />
          <RiskRow initials="СВ" name="С. Василев" category="B" score="6.8" width="68%" color="#ff8aa0" factors="Без урок 28 дни" extraHours="+3ч" action="Обади се" />
          <RiskRow initials="КГ" name="К. Георгиев" category="C" score="5.1" width="51%" color="#f59e0b" factors="Намалена честота" extraHours="+2ч" action="Наблюдавай" />
        </div>
      </section>
      <section className="rounded-[30px] p-5 lg:p-6" style={{ background: 'rgba(11, 19, 39, 0.96)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
        <div className="flex items-end justify-between gap-3">
          <div><h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Тренд на риска</h3><p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>Последните 30 дни</p></div>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}><LegendDot color="#ff6b8b" label="Висок" /><LegendDot color="#f59e0b" label="Среден" /><LegendDot color="#86efac" label="Нисък" /></div>
        </div>
        <div className="mt-6 overflow-hidden rounded-[26px] p-4" style={{ background: 'rgba(6, 14, 32, 0.7)' }}><svg viewBox="0 0 760 220" className="w-full"><defs><linearGradient id="riskLine" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#c084fc" /></linearGradient></defs><path d="M20 170 C90 160, 90 190, 150 150 S250 160, 290 120 S360 190, 430 95 S520 200, 590 80 S680 210, 740 70" fill="none" stroke="url(#riskLine)" strokeWidth="4" strokeLinecap="round" /></svg></div>
      </section>
    </div>
  );
}
function AssistantWorkspace() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="rounded-[30px] border" style={{ background: 'rgba(11, 19, 39, 0.96)', borderColor: 'rgba(148, 163, 184, 0.12)' }}>
        <div className="border-b px-6 py-5" style={{ borderColor: 'rgba(148, 163, 184, 0.08)' }}>
          <div className="flex justify-end"><span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em]" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-tertiary)' }}>Вие</span></div>
          <div className="mt-4 ml-auto max-w-2xl rounded-[24px] px-5 py-4" style={{ background: 'rgba(99, 102, 241, 0.16)', color: 'var(--text-primary)' }}>Защо имам толкова много отменени часове от инструктор П. Стоянов?</div>
        </div>
        <div className="p-6">
          <div className="rounded-[26px] p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(139, 92, 246, 0.18)', color: '#c4b5fd' }}><Bot size={18} /></div><p className="text-sm font-semibold tracking-[0.14em] uppercase" style={{ color: '#c4b5fd' }}>Бизнес асистент</p></div>
            <p className="mt-4 text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>Анализирах данните за последните 30 дни. П. Стоянов е отменил 12 часа, като основната причина е техническа неизправност на VW Golf #1. Това засяга директно графика и преразпределението на курсистите.</p>
            <div className="mt-4 overflow-hidden rounded-[20px] border" style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}>
              <div className="grid grid-cols-3 gap-3 px-4 py-3 text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.03)' }}><span>Дата</span><span>Причина</span><span>Статус</span></div>
              <AssistantRow date="12.05.2024" reason="Техн. неизправност" />
              <AssistantRow date="14.05.2024" reason="Техн. неизправност" />
              <AssistantRow date="15.05.2024" reason="Техн. неизправност" />
            </div>
            <div className="mt-4 rounded-[20px] p-4" style={{ background: 'rgba(99, 102, 241, 0.14)', borderLeft: '3px solid #8b5cf6' }}><p className="text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>Препоръчвам преглед на автомобила и временно пренасочване на курсистите към С. Димитров през следващите 3 дни.</p></div>
          </div>
        </div>
        <div className="border-t px-6 py-5" style={{ borderColor: 'rgba(148, 163, 184, 0.08)' }}>
          <div className="flex items-center gap-3 rounded-[22px] px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148, 163, 184, 0.12)' }}><Search size={16} style={{ color: 'var(--text-tertiary)' }} /><span className="flex-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>Попитайте нещо...</span><button className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.94), rgba(99, 102, 241, 0.94))', color: 'white' }}><SendHorizonal size={18} /></button></div>
        </div>
      </section>
      <aside className="space-y-6">
        <section className="rounded-[30px] p-5" style={{ background: 'rgba(19, 28, 49, 0.98)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Предложени въпроси</h3>
          <div className="mt-4 space-y-3"><PromptCard text="Какъв е очакваният приход за април?" /><PromptCard text="Кои документи изтичат тази седмица?" /><PromptCard text="Анализирай натовареността на автопарка" /></div>
        </section>
        <section className="rounded-[30px] p-5" style={{ background: 'rgba(19, 28, 49, 0.98)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
          <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Седмичен отчет</h3><MessageSquareText size={18} style={{ color: '#a78bfa' }} /></div>
          <div className="mt-4 rounded-[22px] p-4" style={{ background: 'linear-gradient(135deg, rgba(91, 33, 182, 0.18), rgba(30, 41, 59, 0.94))' }}><p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Нови записвания</p><p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>+24%</p><p className="mt-3 text-sm" style={{ color: '#b8f7d4' }}>Оптимално представяне</p></div>
        </section>
      </aside>
    </div>
  );
}

function DocumentsWorkspace() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.85fr]">
        <section className="rounded-[30px] p-5 lg:p-6" style={{ background: 'rgba(11, 19, 39, 0.96)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
          <div className="flex h-full min-h-[540px] items-center justify-center rounded-[26px]" style={{ background: 'linear-gradient(180deg, rgba(2, 6, 23, 0.96), rgba(9, 14, 28, 0.98))' }}>
            <div className="w-full max-w-[340px] rounded-[8px] bg-white p-8 shadow-[0_24px_70px_rgba(0,0,0,0.38)]"><div className="space-y-6"><div className="h-4 w-28 rounded-full" style={{ background: '#e5e7eb' }} /><div className="space-y-3"><div className="h-3 w-full rounded-full" style={{ background: '#e5e7eb' }} /><div className="h-3 w-3/4 rounded-full" style={{ background: '#e5e7eb' }} /></div><div className="space-y-3"><div className="h-3 w-2/3 rounded-full" style={{ background: '#e5e7eb' }} /><div className="flex items-center gap-3"><div className="h-3 flex-1 rounded-full" style={{ background: '#fda4af' }} /><div className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: '#fb7185', color: 'white' }}>×</div></div></div><div className="flex items-center justify-between gap-3 pt-6"><div className="h-5 w-28 rounded-full" style={{ background: '#e5e7eb' }} /><div className="h-7 w-24 rounded-lg" style={{ background: '#1f2a44' }} /></div></div></div>
          </div>
        </section>

        <section className="rounded-[30px] p-5 lg:p-6" style={{ background: 'rgba(19, 28, 49, 0.98)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><TriangleAlert size={18} style={{ color: '#ff6b8b' }} /><h2 className="text-xl font-semibold" style={{ color: '#ff95a8' }}>Блокирана</h2></div><span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]" style={{ background: 'rgba(255, 107, 139, 0.12)', color: '#ff95a8' }}>Критична грешка</span></div>
          <div className="mt-5 space-y-4"><FindingCard tone="critical" title="Липсва ДДС №" badge="Задължително" description="В документа не е намерен валиден идентификационен номер по ДДС за доставчика." suggestion="BG204857193" action="Поправи" /><FindingCard tone="warning" title="Необичайна сума" badge="Предупреждение" description="Общата сума се отклонява с над 45% от средната за този тип фактури през последните 3 месеца." suggestion="Проверете за правописна грешка в десетичната запетая или грешна валута." action="Прегледай" /></div>
          <div className="mt-6 flex items-center gap-3 text-sm font-medium" style={{ color: '#c4b5fd' }}><BrainCircuit size={16} />AI анализ завършен</div>
          <div className="mt-6 flex gap-3"><button className="flex-1 rounded-2xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>Поправи грешките</button><button className="flex-1 rounded-2xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-tertiary)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>Изпрати</button></div>
        </section>
      </div>
      <section className="rounded-[30px] p-5 lg:p-6" style={{ background: 'rgba(11, 19, 39, 0.96)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
        <div className="flex items-center justify-between gap-3"><div><h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Последни проверки</h3><p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>Последните автоматични проверки от AI модула за документи.</p></div><button className="text-sm font-medium" style={{ color: '#8b5cf6' }}>Виж всички</button></div>
        <div className="mt-5 overflow-hidden rounded-[22px] border" style={{ borderColor: 'rgba(148, 163, 184, 0.12)' }}>
          <div className="grid grid-cols-[1fr_0.8fr_1.4fr_0.9fr_0.8fr] gap-3 px-5 py-4 text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.03)' }}><span>Документ ID</span><span>Дата</span><span>Курсист / фирма</span><span>Статус</span><span className="text-right">Сума</span></div>
          <DocumentRow id="#DOC-8472" date="12.10.2023" owner="Петър Иванов" status="Потвърден" amount="450,00 лв" />
          <DocumentRow id="#DOC-8469" date="12.10.2023" owner="Авто-Мобил ООД" status="Блокиран" amount="1 240,00 лв" />
          <DocumentRow id="#DOC-8461" date="11.10.2023" owner="Мария Стойчева" status="Потвърден" amount="85,00 лв" />
        </div>
      </section>
    </div>
  );
}

function AssistantRow({ date, reason }: { date: string; reason: string }) {
  return <div className="grid grid-cols-3 gap-3 px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)', borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}><span>{date}</span><span>{reason}</span><span style={{ color: '#ff6b8b', fontWeight: 600 }}>Отменен</span></div>;
}
function PromptCard({ text }: { text: string }) {
  return <button className="w-full rounded-[18px] px-4 py-4 text-left text-sm" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>{text}</button>;
}
function LegendDot({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} /><span>{label}</span></span>;
}
function DocumentRow({ id, date, owner, status, amount }: { id: string; date: string; owner: string; status: string; amount: string }) {
  return <div className="grid grid-cols-[1fr_0.8fr_1.4fr_0.9fr_0.8fr] gap-3 px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)', borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}><span>{id}</span><span>{date}</span><span style={{ color: 'var(--text-primary)' }}>{owner}</span><span><StatusBadge status={status === 'Блокиран' ? 'warning' : 'success'}>{status}</StatusBadge></span><span className="text-right font-semibold" style={{ color: 'var(--text-primary)' }}>{amount}</span></div>;
}
function SummaryCard({ title, value, color, icon }: { title: string; value: string; color: string; icon: ReactNode }) {
  return <div className="rounded-[28px] p-5" style={{ background: 'rgba(11, 19, 39, 0.96)', border: '1px solid rgba(148, 163, 184, 0.12)' }}><div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>{title}</p><p className="mt-3 text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', color }}>{icon}</div></div></div>;
}
function FindingCard({ tone, title, badge, description, suggestion, action }: { tone: 'critical' | 'warning'; title: string; badge: string; description: string; suggestion: string; action: string }) {
  const accent = tone === 'critical' ? '#ff6b8b' : '#fbbf24';
  return <div className="rounded-[24px] p-4" style={{ background: 'rgba(11, 19, 39, 0.9)', border: '1px solid rgba(148, 163, 184, 0.12)' }}><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3><p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{description}</p></div><span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]" style={{ background: 'rgba(255,255,255,0.06)', color: accent }}>{badge}</span></div><div className="mt-4 rounded-[18px] p-4" style={{ background: 'rgba(255,255,255,0.03)' }}><p className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>{tone === 'critical' ? 'Предложение' : 'AI препоръка'}</p><p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-primary)' }}>{suggestion}</p></div><div className="mt-4 flex justify-end"><button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium" style={{ background: 'rgba(99, 102, 241, 0.14)', color: 'white', border: '1px solid rgba(139, 92, 246, 0.26)' }}>{action}<ArrowRight size={16} /></button></div></div>;
}
function RiskRow({ initials, name, category, score, width, color, factors, extraHours, action, highlight = false }: { initials: string; name: string; category: string; score: string; width: string; color: string; factors: string; extraHours: string; action: string; highlight?: boolean }) {
  return <div className="px-5 py-4" style={{ background: highlight ? 'rgba(255,255,255,0.015)' : 'transparent', borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}><div className="grid grid-cols-[1.25fr_0.6fr_0.8fr_1.1fr_0.7fr_0.8fr] items-center gap-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold" style={{ background: 'rgba(99, 102, 241, 0.18)', color: 'var(--text-primary)' }}>{initials}</div><p className="font-medium" style={{ color: 'var(--text-primary)' }}>{name}</p></div><span className="inline-flex w-fit rounded-xl px-2.5 py-1 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{category}</span><div><p className="text-sm font-semibold" style={{ color }}>{score}</p><div className="mt-2 h-2 rounded-full" style={{ background: 'rgba(148, 163, 184, 0.18)' }}><div className="h-2 rounded-full" style={{ width, background: color }} /></div></div><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{factors}</p><p className="text-sm font-semibold" style={{ color: 'var(--ai-accent)' }}>{extraHours}</p><div className="flex justify-end"><button className="rounded-xl px-3 py-2 text-sm font-medium" style={{ background: action === 'Обади се' ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.94), rgba(99, 102, 241, 0.94))' : 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>{action}</button></div></div>{highlight && <div className="mt-4 rounded-[22px] p-4" style={{ background: 'linear-gradient(135deg, rgba(91, 33, 182, 0.28), rgba(30, 41, 59, 0.94))', border: '1px solid rgba(139, 92, 246, 0.2)' }}><p className="text-sm font-semibold tracking-[0.14em] uppercase" style={{ color: '#c4b5fd' }}>AI анализ на риска</p><div className="mt-4 grid gap-5 lg:grid-cols-2"><div><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Открити фактори</p><ul className="mt-3 space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}><li>• Спад в мотивацията след теория</li><li>• 3 поредни отказа от учебни часове</li><li>• Географска дистанция от полигона</li></ul></div><div><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Препоръка</p><p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>Предложете преместване в група с по-ясен час или 1 бонус час за наваксване, за да стабилизирате ангажираността през следващите 7 дни.</p></div></div></div>}</div>;
}
