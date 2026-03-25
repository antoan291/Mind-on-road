import { Link } from 'react-router';
import { Bot, BrainCircuit, FileSearch, MessageSquareText, ScanLine, ShieldCheck, TrendingUp } from 'lucide-react';
import { PageHeader } from '../components/ui-system/PageHeader';
import { Button } from '../components/ui-system/Button';
import { StatusBadge } from '../components/ui-system/StatusBadge';

export function AIPage() {
  return (
    <div>
      <PageHeader
        title="AI Център"
        description="Owner chat, OCR, прогнози и tenant-scoped AI операции за школата."
        breadcrumbs={[{ label: 'Начало' }, { label: 'AI Център' }]}
        actions={
          <>
            <Button variant="secondary" icon={<ShieldCheck size={18} />}>Политики</Button>
            <Link to="/ai/chat">
              <Button variant="primary" icon={<Bot size={18} />}>Чат с AI</Button>
            </Link>
          </>
        }
      />
      <div className="space-y-6 p-6 lg:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card icon={<MessageSquareText size={18} />} title="Owner chat сесии" value="18" detail="Само за текущия tenant" />
          <Card icon={<ScanLine size={18} />} title="OCR чакащи" value="7" detail="5 лични карти · 2 книжки" tone="warning" />
          <Card icon={<TrendingUp size={18} />} title="AI прогнози" value="24" detail="Плащания, отпадане, допълнителни часове" tone="info" />
          <Card icon={<ShieldCheck size={18} />} title="Проверени записи" value="96%" detail="След human review" tone="success" />
        </div>

        <section className="rounded-3xl p-5 lg:p-6" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(25, 37, 64, 0.94))', border: '1px solid var(--ghost-border)' }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <StatusBadge status="info">Owner chat</StatusBadge>
              <h2 className="mt-3 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>AI асистент за собственика и администратора</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                Чатът анализира само данните на текущата школа: плащания, фактури, документи, теория, практика, инструктори, автомобили и оперативни сигнали.
                Отговорите са под формата на съвети, обобщения, рискове и предложени действия.
              </p>
            </div>
            <Link to="/ai/chat" className="shrink-0">
              <Button variant="primary" icon={<MessageSquareText size={18} />}>Отвори чат</Button>
            </Link>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            <MiniInfo title="Какво анализира" text="Финанси, документи, курсисти, присъствие, натоварване, графици и AI сигнали само за текущия tenant." />
            <MiniInfo title="Как отговаря" text="С кратки оперативни изводи, препоръчани действия и ясни причини защо е стигнал до тях." />
            <MiniInfo title="Какво не прави" text="Не вижда други автошколи и не променя официални данни без човешки контрол." />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl p-5 lg:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>AI модули в първа версия</h2>
            <div className="mt-5 space-y-3">
              <Module icon={<MessageSquareText size={18} />} title="Owner chat" body="Отговори върху финансови, документни и оперативни данни само в рамките на текущата школа." tone="info" />
              <Module icon={<FileSearch size={18} />} title="OCR и документно извличане" body="Лични карти, книжки и подписи се обработват автоматично, но чувствителните полета не се записват окончателно без човешки преглед." tone="success" />
              <Module icon={<BrainCircuit size={18} />} title="Предиктивни сигнали" body="Просрочени плащания, риск от отпадане, нужда от допълнителни часове и натоварване на инструктори/автомобили." tone="warning" />
            </div>
          </section>
          <section className="rounded-3xl p-5 lg:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>AI guardrails</h2>
            <div className="mt-5 space-y-3">
              <Guard title="Tenant scoped" text="Няма достъп до данни на други автошколи." />
              <Guard title="Human review" text="Официални документи не се презаписват автоматично." />
              <Guard title="Usage metering" text="Разходът се следи по tenant вътре в системата." />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, value, detail, tone = 'neutral' }: { icon: React.ReactNode; title: string; value: string; detail: string; tone?: 'success' | 'warning' | 'info' | 'neutral' }) {
  const color = tone === 'warning' ? 'var(--status-warning)' : tone === 'success' ? 'var(--status-success)' : tone === 'info' ? 'var(--ai-accent)' : 'var(--primary-accent)';
  return <div className="rounded-3xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}><div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'var(--bg-card-elevated)', color }}>{icon}</div><p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{title}</p><p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p><p className="mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>{detail}</p></div>;
}

function Module({ icon, title, body, tone }: { icon: React.ReactNode; title: string; body: string; tone: 'success' | 'warning' | 'info' }) {
  const color = tone === 'warning' ? 'var(--status-warning)' : tone === 'success' ? 'var(--status-success)' : 'var(--ai-accent)';
  return <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(25, 37, 64, 0.92))', border: '1px solid var(--ghost-border)' }}><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', color }}>{icon}</div><h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3></div><p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{body}</p></div>;
}

function Guard({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--ghost-border)' }}><StatusBadge status="info">{title}</StatusBadge><p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{text}</p></div>;
}

function MiniInfo({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl p-4" style={{ background: 'rgba(6, 14, 32, 0.56)', border: '1px solid var(--ghost-border)' }}><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p><p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{text}</p></div>;
}
