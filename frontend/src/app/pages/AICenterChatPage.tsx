import { Link } from 'react-router';
import { ArrowLeft, Bot, BrainCircuit, CircleAlert, Database, FileSearch, MessageSquareText, SendHorizonal, ShieldCheck, TrendingUp } from 'lucide-react';
import { PageHeader } from '../components/ui-system/PageHeader';
import { Button } from '../components/ui-system/Button';
import { StatusBadge } from '../components/ui-system/StatusBadge';

const conversation = [
  {
    role: 'user',
    title: 'Администратор',
    text: 'Кои са най-рисковите курсисти тази седмица и какво трябва да направим първо?',
    meta: 'Запитване към AI върху данните на школата'
  },
  {
    role: 'assistant',
    title: 'AI асистент',
    text: 'Откривам 3 приоритета: 1) 6 курсиста с просрочени плащания над 7 дни, 2) 4 курсиста с две поредни отсъствия по теория, 3) инструктор Иван Петров е с натоварване над нормата и има 2 часа с риск от закъснение утре. Препоръка: първо пуснете напомняния за плащане, после насрочете възстановяване за теория и преместете един практичен час към свободен инструктор.',
    meta: 'Анализирани модули: плащания, теория, график, инструктори'
  },
  {
    role: 'user',
    title: 'Администратор',
    text: 'Кажи ми кои плащания са най-спешни и какъв текст да изпратя на родителите.',
    meta: 'Фокус върху финанси и автоматични съобщения'
  },
  {
    role: 'assistant',
    title: 'AI асистент',
    text: 'Най-спешни са 4 плащания с обща стойност 1 240 лв. Два от случаите вече блокират бъдещи практически часове. Предлагам кратък текст: „Здравейте, напомняме Ви за просрочено плащане по обучението на курсиста. За да не се прекъсва графикът на часовете, моля плащането да бъде уредено до 24 часа. При нужда от справка се свържете с администрацията.“',
    meta: 'Изводът е базиран само на текущия tenant и не включва други школи'
  }
];

const quickPrompts = [
  'Покажи ми най-рисковите курсисти за отпадане.',
  'Обобщи просрочените плащания и кои родители да уведомим първо.',
  'Кои инструктори са най-натоварени тази седмица?',
  'Има ли документи, които трябва да бъдат прегледани ръчно днес?'
];

const insightCards = [
  { title: 'Данни, които AI използва', text: 'Плащания, фактури, теория, практика, документи, график, инструктори, автомобили, известия.', icon: <Database size={18} /> },
  { title: 'Какво може да съветва', text: 'Приоритети за администрацията, риск от отпадане, действия по плащания, натоварване на ресурсите и следващи оперативни стъпки.', icon: <TrendingUp size={18} /> },
  { title: 'Какво не може да прави сам', text: 'Да променя официални документи, да вижда други школи или да запазва чувствителни полета без човешки преглед.', icon: <ShieldCheck size={18} /> },
];

const rightRail = [
  { label: 'AI статус', value: 'Активен за текущата школа', tone: 'success' as const },
  { label: 'Последен sync', value: 'Днес, 15:20', tone: 'info' as const },
  { label: 'OCR чакащи', value: '7 документа', tone: 'warning' as const },
  { label: 'Изискват review', value: '3 документа', tone: 'warning' as const },
];

export function AICenterChatPage() {
  return (
    <div>
      <PageHeader
        title="Чат с AI"
        description="AI асистент за собственика и администрацията, който анализира само данните на текущата школа."
        breadcrumbs={[{ label: 'Начало' }, { label: 'AI Център' }, { label: 'Чат с AI' }]}
        actions={
          <>
            <Link to="/ai">
              <Button variant="secondary" icon={<ArrowLeft size={18} />}>Назад към AI Център</Button>
            </Link>
            <Button variant="primary" icon={<Bot size={18} />}>Нова тема</Button>
          </>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-8">
        <section className="space-y-6">
          <div className="rounded-3xl p-5 lg:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <StatusBadge status="info">Owner chat</StatusBadge>
                <h2 className="mt-3 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>AI анализатор за целия бизнес на школата</h2>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  Този чат комбинира контекст от базата данни на текущата школа и връща управленски съвети, оперативни предупреждения и препоръчани действия.
                </p>
              </div>
              <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(167, 139, 250, 0.1)', border: '1px solid var(--ghost-border)' }}>
                <p className="text-xs uppercase tracking-[0.08em]" style={{ color: 'var(--text-tertiary)' }}>Обхват</p>
                <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Само данните на тази автошкола</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-5 lg:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Разговор</h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>Статичен пример за администраторски чат върху бизнес данните</p>
              </div>
              <StatusBadge status="success">Tenant scoped</StatusBadge>
            </div>

            <div className="mt-5 space-y-4">
              {conversation.map((message, index) => (
                <ChatBubble key={index} {...message} />
              ))}
            </div>

            <div className="mt-5 rounded-2xl p-4" style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--ghost-border)' }}>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    className="rounded-full px-3 py-2 text-sm transition-all hover:shadow-[var(--glow-indigo)]"
                    style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--text-secondary)', border: '1px solid var(--ghost-border)' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 lg:flex-row">
                <div className="min-h-14 flex-1 rounded-2xl px-4 py-4" style={{ background: 'rgba(6, 14, 32, 0.7)', border: '1px solid var(--ghost-border)', color: 'var(--text-tertiary)' }}>
                  Напиши въпрос към AI за плащания, график, документи, инструктори, риск от отпадане или административни приоритети...
                </div>
                <Button variant="primary" icon={<SendHorizonal size={18} />}>Изпрати</Button>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl p-5 lg:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Какво анализира AI</h3>
            <div className="mt-5 space-y-3">
              {insightCards.map((card) => (
                <div key={card.title} className="rounded-2xl p-4" style={{ background: 'var(--bg-card-elevated)', border: '1px solid var(--ghost-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(167, 139, 250, 0.12)', color: 'var(--ai-accent)' }}>
                      {card.icon}
                    </div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{card.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{card.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl p-5 lg:p-6" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(25, 37, 64, 0.94))', border: '1px solid var(--ghost-border)' }}>
            <div className="flex items-center gap-3">
              <BrainCircuit size={18} style={{ color: 'var(--ai-accent)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Текущ AI контекст</h3>
            </div>
            <div className="mt-5 space-y-3">
              {rightRail.map((item) => (
                <div key={item.label} className="rounded-2xl p-4" style={{ background: 'rgba(6, 14, 32, 0.56)', border: '1px solid var(--ghost-border)' }}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                    <StatusBadge status={item.tone === 'success' ? 'success' : item.tone === 'warning' ? 'warning' : 'info'}>{item.tone === 'success' ? 'OK' : item.tone === 'warning' ? 'Внимание' : 'Инфо'}</StatusBadge>
                  </div>
                  <p className="mt-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl p-5 lg:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}>
            <div className="flex items-center gap-3">
              <CircleAlert size={18} style={{ color: 'var(--status-warning)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Guardrails</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
              <p>AI използва само tenant-scoped данни и няма достъп до информация за други автошколи.</p>
              <p>Чатът може да предлага действия, но не трябва да редактира официални документи или чувствителни полета без човешки review.</p>
              <p>Всички AI заявки трябва да се метрират по tenant, feature и токени за вътрешен контрол и отчетност.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ChatBubble({ role, title, text, meta }: { role: 'user' | 'assistant'; title: string; text: string; meta: string }) {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className="max-w-3xl rounded-3xl p-4 lg:p-5"
        style={{
          background: isAssistant ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.12), rgba(25, 37, 64, 0.96))' : 'var(--bg-card-elevated)',
          border: '1px solid var(--ghost-border)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: isAssistant ? 'rgba(167, 139, 250, 0.16)' : 'rgba(99, 102, 241, 0.12)', color: isAssistant ? 'var(--ai-accent)' : 'var(--primary-accent)' }}>
            {isAssistant ? <Bot size={18} /> : <MessageSquareText size={18} />}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{meta}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>{text}</p>
      </div>
    </div>
  );
}

