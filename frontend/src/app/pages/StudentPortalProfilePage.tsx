import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import {
  CalendarDays,
  Car,
  LogOut,
  Star,
  UserRound,
  Wallet,
} from 'lucide-react';
import {
  fetchPaymentRecords,
  type PaymentRecordView,
} from '../services/paymentsApi';
import {
  fetchPracticalLessonRecords,
  submitPracticalLessonStudentFeedback,
  type PracticalLessonView,
} from '../services/practicalLessonsApi';
import { useAuthSession } from '../services/authSession';
import {
  fetchStudentOperations,
  fetchStudentOperationalDetail,
} from '../services/studentsApi';
import type { StudentOperationalRecord } from '../content/studentOperations';

type StudentPortalProfileState = StudentOperationalRecord & {
  firstName?: string;
  lastName?: string;
};

export function StudentPortalProfilePage() {
  const { id } = useParams();
  const { logout, session } = useAuthSession();
  const [student, setStudent] = useState<StudentPortalProfileState | null>(
    null,
  );
  const [lessons, setLessons] = useState<PracticalLessonView[]>([]);
  const [payments, setPayments] = useState<PaymentRecordView[]>([]);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const resolveStudentProfile = async () => {
      if (id) {
        return fetchStudentOperationalDetail(id);
      }

      const studentRows = await fetchStudentOperations();
      const firstStudentId = studentRows[0]?.id;

      return firstStudentId
        ? fetchStudentOperationalDetail(String(firstStudentId))
        : null;
    };

    Promise.all([
      resolveStudentProfile(),
      fetchPracticalLessonRecords(),
      fetchPaymentRecords(),
    ])
      .then(([studentDetail, lessonRows, paymentRows]) => {
        if (!isMounted) {
          return;
        }

        setStudent(studentDetail);
        setLessons(lessonRows);
        setPayments(paymentRows);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setStudent(null);
        setLessons([]);
        setPayments([]);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const nextLesson = useMemo(
    () =>
      lessons
        .filter((lesson) =>
          ['scheduled', 'in-progress', 'late'].includes(lesson.status),
        )
        .sort((left, right) =>
          `${left.date} ${left.time}`.localeCompare(
            `${right.date} ${right.time}`,
          ),
        )[0] ?? null,
    [lessons],
  );

  const lastLesson = useMemo(
    () =>
      lessons
        .filter((lesson) => lesson.status === 'completed')
        .sort((left, right) =>
          `${right.date} ${right.time}`.localeCompare(
            `${left.date} ${left.time}`,
          ),
        )[0] ?? null,
    [lessons],
  );

  useEffect(() => {
    setFeedbackRating(lastLesson?.studentFeedbackRating ?? 0);
    setFeedbackComment(lastLesson?.studentFeedbackComment ?? '');
    setFeedbackStatus('idle');
    setFeedbackMessage('');
  }, [lastLesson?.id, lastLesson?.studentFeedbackComment, lastLesson?.studentFeedbackRating]);

  const totalHours = student?.maxTrainingHours ?? student?.total ?? 0;
  const usedHours = student?.used ?? 0;
  const remainingHours = student?.remaining ?? Math.max(totalHours - usedHours, 0);
  const progressPercent =
    totalHours > 0 ? Math.min(100, Math.round((usedHours / totalHours) * 100)) : 0;
  const circumference = 2 * Math.PI * 76;
  const strokeOffset = circumference * (1 - progressPercent / 100);
  const studentPayments = payments.filter(
    (payment) => String(payment.studentId) === String(student?.id ?? ''),
  );
  const paidAmount = studentPayments.reduce(
    (sum, payment) => sum + payment.paidAmount,
    0,
  );
  const remainingAmount = studentPayments.reduce(
    (sum, payment) => sum + payment.remainingAmount,
    0,
  );
  const paymentTotal = paidAmount + remainingAmount;
  const paymentProgress =
    paymentTotal > 0
      ? Math.min(100, Math.round((paidAmount / paymentTotal) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-[#060e20] pb-12 text-[#dee5ff]">
      <nav className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between bg-[#060e20]/95 px-6 shadow-2xl shadow-black/40 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black tracking-[-0.04em] text-slate-100">
            Obsidian Student
          </span>
        </div>

        <button
          type="button"
          onClick={() => void logout()}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] text-slate-400 transition-all hover:bg-white/5 hover:text-slate-100"
          aria-label="Изход"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Изход</span>
        </button>
      </nav>

      <main className="mx-auto max-w-[800px] space-y-10 px-6 pt-24">
        <section
          id="student-overview"
          className="relative overflow-hidden rounded-xl border border-[#40485d]/20 bg-[#192540] p-10 shadow-xl"
        >
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#a3a6ff]/10 blur-[80px]" />

          <div className="relative flex justify-center">
            <div className="relative h-44 w-44">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 176 176">
                <circle
                  cx="88"
                  cy="88"
                  r="76"
                  fill="transparent"
                  stroke="#091328"
                  strokeWidth="12"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="76"
                  fill="transparent"
                  stroke="#5af0b4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  strokeWidth="12"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold tracking-[-0.04em] text-slate-100">
                  {remainingHours}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Оставащи
                </span>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 w-full max-w-md">
            <div className="mb-2 flex items-end justify-between">
              <span className="text-lg font-semibold text-slate-100">
                Прогрес на курса
              </span>
              <span className="text-sm font-medium text-slate-400">
                {usedHours}/{totalHours} закупени
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#091328]">
              <div
                className="h-full rounded-full bg-[#6063ee] shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xl font-semibold tracking-[-0.03em] text-slate-100">
              {student?.name ?? session?.user.displayName ?? 'Студентски профил'}
            </p>
            <p className="mt-1 text-sm font-medium uppercase tracking-[0.12em] text-slate-400">
              {student?.category ?? 'B'} · {student?.nationalId ?? 'Без рег. номер'}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section
            id="next-lesson"
            className="rounded-xl border border-[#40485d]/30 bg-[#141f38] p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#a3a6ff]">
                Следващ урок
              </span>
              <CalendarDays size={20} className="text-slate-500" />
            </div>

            {nextLesson ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-100">
                    {formatPortalDate(nextLesson.date)}
                  </span>
                  <span className="font-medium text-slate-400">
                    {nextLesson.time}
                  </span>
                </div>
                <div className="space-y-2 border-t border-[#40485d]/20 pt-4">
                  <div className="flex items-center gap-3 text-slate-300">
                    <UserRound size={16} className="text-slate-500" />
                    <span>{nextLesson.instructor}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Car size={16} className="text-slate-500" />
                    <span>{nextLesson.vehicle}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-400">
                Няма насрочен следващ урок.
              </p>
            )}
          </section>

          <section
            id="payments"
            className="rounded-xl border border-[#40485d]/30 bg-[#141f38] p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#a3a6ff]">
                Плащания
              </span>
              <Wallet size={20} className="text-slate-500" />
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Платено
                </span>
                <span className="text-2xl font-bold text-slate-100">
                  {paidAmount.toLocaleString('bg-BG', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  €
                </span>
              </div>

              <div className="space-y-2">
                <div className="h-1.5 w-full rounded-full bg-[#091328]">
                  <div
                    className="h-full rounded-full bg-[#5af0b4]"
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">
                    {paymentProgress}% от общата сума
                  </span>
                  <span className="font-semibold text-[#ff6e84]">
                    Остават: {remainingAmount.toLocaleString('bg-BG')} €
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section
          id="feedback"
          className="rounded-xl border border-[#40485d]/20 bg-[#192540] p-8"
        >
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-100">
              Вашият последен урок
            </h3>
            <p className="text-sm font-medium text-slate-400">
              Дата на провеждане:{' '}
              {lastLesson ? formatPortalDate(lastLesson.date) : 'Няма завършен урок'}
            </p>
          </div>

          <div className="mt-6 flex gap-2">
            {[1, 2, 3, 4, 5].map((ratingValue) => (
              <button
                key={ratingValue}
                type="button"
                onClick={() => {
                  if (!lastLesson) return;
                  setFeedbackRating(ratingValue);
                  setFeedbackStatus('idle');
                  setFeedbackMessage('');
                }}
                disabled={!lastLesson}
                className="transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`${ratingValue} звезди`}
              >
                <Star
                  size={40}
                  fill={feedbackRating >= ratingValue ? '#facc15' : 'none'}
                  className={
                    feedbackRating >= ratingValue
                      ? 'text-[#facc15]'
                      : 'text-slate-700'
                  }
                />
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <textarea
              value={feedbackComment}
              onChange={(event) => {
                setFeedbackComment(event.target.value);
                setFeedbackStatus('idle');
                setFeedbackMessage('');
              }}
              disabled={!lastLesson}
              className="h-32 w-full resize-none rounded-xl border border-[#40485d] bg-black p-4 text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-[#a3a6ff] focus:ring-1 focus:ring-[#a3a6ff] disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={
                lastLesson
                  ? 'Вашият отзив...'
                  : 'Няма завършен урок за отзив.'
              }
            />
            <button
              type="button"
              disabled={
                !lastLesson || feedbackStatus === 'saving' || feedbackRating === 0
              }
              onClick={async () => {
                if (!lastLesson || feedbackRating === 0) return;

                setFeedbackStatus('saving');
                setFeedbackMessage('Записване на отзива...');

                try {
                  const updatedLesson =
                    await submitPracticalLessonStudentFeedback(
                      lastLesson.id,
                      {
                        studentFeedbackRating: feedbackRating,
                        studentFeedbackComment: feedbackComment.trim(),
                      },
                      session?.csrfToken ?? '',
                    );

                  setLessons((current) =>
                    current.map((lesson) =>
                      lesson.id === updatedLesson.id ? updatedLesson : lesson,
                    ),
                  );
                  setFeedbackStatus('saved');
                  setFeedbackMessage('Отзивът е записан успешно.');
                } catch (error) {
                  setFeedbackStatus('error');
                  setFeedbackMessage(
                    error instanceof Error
                      ? error.message
                      : 'Неуспешно записване на отзива.',
                  );
                }
              }}
              className="h-12 w-full rounded-xl bg-gradient-to-br from-[#6366F1] to-[#6063ee] text-sm font-bold uppercase tracking-[0.2em] text-slate-100 shadow-lg shadow-[#a3a6ff]/20 transition-all duration-200 hover:shadow-[#a3a6ff]/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {feedbackStatus === 'saving' ? 'Изпращане...' : 'Изпрати отзив'}
            </button>
            {feedbackMessage && (
              <p
                className={`text-sm ${
                  feedbackStatus === 'error'
                    ? 'text-[#ff6e84]'
                    : feedbackStatus === 'saved'
                      ? 'text-[#5af0b4]'
                      : 'text-slate-400'
                }`}
              >
                {feedbackMessage}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function formatPortalDate(dateValue: string) {
  const [year, month, day] = dateValue.slice(0, 10).split('-');

  return `${day}.${month}.${year}`;
}
