import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  CircleAlert,
  Database,
  Loader2,
  MessageSquareText,
  SendHorizonal,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui-system/Button';
import { PageHeader } from '../components/ui-system/PageHeader';
import { StatusBadge } from '../components/ui-system/StatusBadge';
import {
  type BusinessAssistantResponse,
  askBusinessAssistant,
} from '../services/aiAssistantApi';
import { ApiClientError } from '../services/apiClient';
import { useAuthSession } from '../services/authSession';

type ChatMessage = {
  role: 'user' | 'assistant';
  title: string;
  text: string;
  meta: string;
};

const initialConversation: ChatMessage[] = [
  {
    role: 'assistant',
    title: 'AI бизнес асистент',
    text: 'Задай ми въпрос за курсисти, инструктори, плащания, разходи, фактури, документи, теория, практика, автомобили или оперативни рискове. Ще отговарям само по данните на текущата школа в базата.',
    meta: 'Read-only tenant-scoped асистент',
  },
];

const quickPrompts = [
  'Обобщи текущите курсисти, оставащите им часове и кой не е карал над 30 дни.',
  'Какви са приходите от плащания, разходите и ДДС от разходи от приятели?',
  'Кои документи, фактури или автомобили изискват внимание скоро?',
  'Как е натоварването по теория, практика и инструктори според базата?',
];

const insightCards = [
  {
    title: 'Какви данни ползва',
    text: 'Чете tenant-scoped данни от PostgreSQL за курсисти, плащания, разходи, фактури, документи, теория, практика и автомобили.',
    icon: <Database size={18} />,
  },
  {
    title: 'Как помага',
    text: 'Дава оперативни обобщения, рискове, приоритети за действие и конкретни проверки върху бизнес данните.',
    icon: <TrendingUp size={18} />,
  },
  {
    title: 'Какво не прави',
    text: 'Не променя записи, не излиза извън текущия tenant и отказва въпроси извън бизнеса и базата на школата.',
    icon: <ShieldCheck size={18} />,
  },
];

const initialAssistantContext: BusinessAssistantResponse = {
  answer: '',
  generatedAt: new Date('2026-04-04T00:00:00.000Z').toISOString(),
  model: 'idle',
  sourceModules: [
    'students',
    'payments',
    'expenses',
    'documents',
    'invoices',
    'theory',
    'practice',
    'vehicles',
  ],
  stats: {
    studentsCount: 0,
    activeStudentsCount: 0,
    inactivePracticeStudentsCount: 0,
    paymentsTotalAmount: 0,
    expensesTotalAmount: 0,
    friendVatTotalAmount: 0,
    invoicesCount: 0,
    documentsExpiringSoonCount: 0,
    vehiclesCount: 0,
    vehiclesNeedingAttentionCount: 0,
    practicalLessonsCount: 0,
    theoryGroupsCount: 0,
  },
};

export function AICenterChatPage() {
  const { session } = useAuthSession();
  const [conversation, setConversation] =
    useState<ChatMessage[]>(initialConversation);
  const [draftPrompt, setDraftPrompt] = useState(quickPrompts[0] ?? '');
  const [assistantContext, setAssistantContext] =
    useState<BusinessAssistantResponse>(initialAssistantContext);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSendPrompt = async () => {
    const question = draftPrompt.trim();

    if (!question || isSending) {
      return;
    }

    setIsSending(true);
    setAssistantError(null);
    setConversation((current) => [
      ...current,
      {
        role: 'user',
        title: session?.user.displayName ?? 'Администратор',
        text: question,
        meta: 'Въпрос към AI върху текущия tenant',
      },
    ]);

    try {
      const aiResponse = await askBusinessAssistant(
        question,
        session?.csrfToken,
      );

      setAssistantContext(aiResponse);
      setConversation((current) => [
        ...current,
        {
          role: 'assistant',
          title: 'AI бизнес асистент',
          text: aiResponse.answer,
          meta: `Модел: ${aiResponse.model} · ${new Date(
            aiResponse.generatedAt,
          ).toLocaleString('bg-BG')}`,
        },
      ]);
      setDraftPrompt('');
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'AI заявката не можа да бъде изпълнена.';

      setAssistantError(message);
      setConversation((current) => [
        ...current,
        {
          role: 'assistant',
          title: 'AI бизнес асистент',
          text: `Не успях да върна отговор от backend-а. Причина: ${message}`,
          meta: `Грешка · ${new Date().toLocaleString('bg-BG')}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetConversation = () => {
    setConversation(initialConversation);
    setAssistantContext(initialAssistantContext);
    setAssistantError(null);
    setDraftPrompt(quickPrompts[0] ?? '');
  };

  const rightRail = buildRightRail(assistantContext);

  return (
    <div>
      <PageHeader
        title="AI чат асистент"
        description="Read-only бизнес асистент, който отговаря само по текущата база данни и операциите на школата."
        breadcrumbs={[
          { label: 'Начало' },
          { label: 'AI чат асистент' },
        ]}
        actions={
          <>
            <Link to="/ai/center">
              <Button variant="secondary" icon={<ArrowLeft size={18} />}>
                AI Център
              </Button>
            </Link>
            <Button
              variant="primary"
              icon={<Bot size={18} />}
              onClick={handleResetConversation}
              disabled={isSending}
            >
              Нова тема
            </Button>
          </>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-8">
        <section className="space-y-6">
          <div
            className="rounded-3xl p-5 lg:p-6"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--ghost-border)',
            }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <StatusBadge status="info">
                  PostgreSQL + Redis + OpenAI
                </StatusBadge>
                <h2
                  className="mt-3 text-xl font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Асистент за управление на автошколата
                </h2>
                <p
                  className="mt-2 text-sm leading-6"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Питай само за бизнеса и данните на школата. Endpoint-ът е
                  tenant-scoped, CSRF protected и не прави write операции.
                </p>
              </div>
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  background: 'rgba(167, 139, 250, 0.1)',
                  border: '1px solid var(--ghost-border)',
                }}
              >
                <p
                  className="text-xs uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Данни от snapshot
                </p>
                <p
                  className="mt-1 text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {assistantContext.stats.studentsCount} курсисти ·{' '}
                  {assistantContext.stats.practicalLessonsCount} практики ·{' '}
                  {assistantContext.stats.theoryGroupsCount} теории
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-3xl p-5 lg:p-6"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--ghost-border)',
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Разговор
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Всеки отговор се генерира само от текущите tenant данни.
                </p>
              </div>
              <StatusBadge status={assistantError ? 'warning' : 'success'}>
                {assistantError ? 'Fallback/error' : 'Tenant scoped'}
              </StatusBadge>
            </div>

            <div className="mt-5 space-y-4">
              {conversation.map((message, index) => (
                <ChatBubble key={`${message.role}-${index}`} {...message} />
              ))}
              {isSending ? (
                <div className="flex justify-start">
                  <div
                    className="rounded-3xl p-4 lg:p-5"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(167, 139, 250, 0.12), rgba(25, 37, 64, 0.96))',
                      border: '1px solid var(--ghost-border)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Loader2
                        size={18}
                        className="animate-spin"
                        style={{ color: 'var(--ai-accent)' }}
                      />
                      <p
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Анализирам базата...
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div
              className="mt-5 rounded-2xl p-4"
              style={{
                background: 'var(--bg-card-elevated)',
                border: '1px solid var(--ghost-border)',
              }}
            >
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setDraftPrompt(prompt)}
                    className="rounded-full px-3 py-2 text-sm transition-all hover:shadow-[var(--glow-indigo)]"
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--ghost-border)',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 lg:flex-row">
                <textarea
                  value={draftPrompt}
                  onChange={(event) => setDraftPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                      event.preventDefault();
                      void handleSendPrompt();
                    }
                  }}
                  rows={2}
                  className="min-h-14 flex-1 resize-none rounded-2xl px-4 py-4 text-sm outline-none"
                  style={{
                    background: 'rgba(6, 14, 32, 0.7)',
                    border: '1px solid var(--ghost-border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Задай въпрос за курсисти, плащания, разходи, документи, график, автомобили..."
                />
                <Button
                  variant="primary"
                  icon={<SendHorizonal size={18} />}
                  onClick={() => void handleSendPrompt()}
                  disabled={isSending || !draftPrompt.trim()}
                >
                  {isSending ? 'Изпращам...' : 'Изпрати'}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section
            className="rounded-3xl p-5 lg:p-6"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--ghost-border)',
            }}
          >
            <h3
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Какво анализира AI
            </h3>
            <div className="mt-5 space-y-3">
              {insightCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl p-4"
                  style={{
                    background: 'var(--bg-card-elevated)',
                    border: '1px solid var(--ghost-border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-2xl"
                      style={{
                        background: 'rgba(167, 139, 250, 0.12)',
                        color: 'var(--ai-accent)',
                      }}
                    >
                      {card.icon}
                    </div>
                    <p
                      className="font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {card.title}
                    </p>
                  </div>
                  <p
                    className="mt-3 text-sm leading-6"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            className="rounded-3xl p-5 lg:p-6"
            style={{
              background:
                'linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(25, 37, 64, 0.94))',
              border: '1px solid var(--ghost-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <BrainCircuit size={18} style={{ color: 'var(--ai-accent)' }} />
              <h3
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Текущ AI контекст
              </h3>
            </div>
            <div className="mt-5 space-y-3">
              {rightRail.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-4"
                  style={{
                    background: 'rgba(6, 14, 32, 0.56)',
                    border: '1px solid var(--ghost-border)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {item.label}
                    </p>
                    <StatusBadge status={item.tone}>
                      {item.tone === 'success'
                        ? 'OK'
                        : item.tone === 'warning'
                          ? 'Внимание'
                          : 'Инфо'}
                    </StatusBadge>
                  </div>
                  <p
                    className="mt-2 text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            className="rounded-3xl p-5 lg:p-6"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--ghost-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <CircleAlert size={18} style={{ color: 'var(--status-warning)' }} />
              <h3
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Guardrails
              </h3>
            </div>
            <div
              className="mt-4 space-y-3 text-sm leading-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              <p>
                AI вижда само данните на текущия tenant и няма route за write
                операции.
              </p>
              <p>
                Въпроси извън курса, плащанията, документите, графика,
                автопарка и бизнес операциите се отказват от backend guardrail.
              </p>
              <p>
                OpenAI се използва само ако backend `.env` има
                `OPENAI_API_KEY`; иначе системата връща локален fallback
                анализ.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function buildRightRail(response: BusinessAssistantResponse) {
  return [
    {
      label: 'AI модел',
      value: response.model,
      tone:
        response.model === 'gpt-4o-mini'
          ? ('success' as const)
          : ('warning' as const),
    },
    {
      label: 'Последен snapshot',
      value: new Date(response.generatedAt).toLocaleString('bg-BG'),
      tone: 'info' as const,
    },
    {
      label: 'Курсисти без практика над 30 дни',
      value: `${response.stats.inactivePracticeStudentsCount}`,
      tone:
        response.stats.inactivePracticeStudentsCount > 0
          ? ('warning' as const)
          : ('success' as const),
    },
    {
      label: 'Документи с изтичащ срок до 30 дни',
      value: `${response.stats.documentsExpiringSoonCount}`,
      tone:
        response.stats.documentsExpiringSoonCount > 0
          ? ('warning' as const)
          : ('success' as const),
    },
    {
      label: 'Оперативни разходи / ДДС приятели',
      value: `${response.stats.expensesTotalAmount} лв / ${response.stats.friendVatTotalAmount} лв`,
      tone: 'info' as const,
    },
  ];
}

function ChatBubble({ role, title, text, meta }: ChatMessage) {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className="max-w-3xl rounded-3xl p-4 lg:p-5"
        style={{
          background: isAssistant
            ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.12), rgba(25, 37, 64, 0.96))'
            : 'var(--bg-card-elevated)',
          border: '1px solid var(--ghost-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: isAssistant
                ? 'rgba(167, 139, 250, 0.16)'
                : 'rgba(99, 102, 241, 0.12)',
              color: isAssistant
                ? 'var(--ai-accent)'
                : 'var(--primary-accent)',
            }}
          >
            {isAssistant ? <Bot size={18} /> : <MessageSquareText size={18} />}
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {meta}
            </p>
          </div>
        </div>
        <p
          className="mt-4 whitespace-pre-wrap text-sm leading-7"
          style={{ color: 'var(--text-secondary)' }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
