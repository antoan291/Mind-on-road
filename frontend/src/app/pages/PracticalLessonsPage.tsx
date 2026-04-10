import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMemo } from 'react';
import {
  PageHeader, Badge, Button, Modal, Input, Select, Textarea
} from '../components/shared';
import { 
  Plus, Download, Calendar as CalendarIcon, AlertTriangle, 
  Clock, Users, Car, CheckCircle, XCircle, AlertCircle,
  Search, X, Filter, MoreVertical, Eye, Edit2, Trash2,
  MapPin, Phone, Mail, FileText, CreditCard, StarOff,
  Ban, UserX, DollarSign, ClipboardCheck, Navigation,
  User, Timer, Hash, ChevronRight, Fuel, Settings,
  ChevronDown, ChevronUp, Bell, BellOff, Send, Activity
} from 'lucide-react';
import {
  createPracticalLessonRecord,
  deletePracticalLessonRecord,
  fetchPracticalLessonRecords,
  submitPracticalLessonParentFeedback,
  submitPracticalLessonStudentFeedback,
  updatePracticalLessonRecord,
} from '../services/practicalLessonsApi';
import { useAuthSession } from '../services/authSession';
import { hasFullAccessRole } from '../services/roleUtils';
import {
  type StudentOperationalRecord,
  studentOperationalRecords,
} from '../content/studentOperations';
import { fetchStudentOperations } from '../services/studentsApi';

type LessonStatus = 'scheduled' | 'in-progress' | 'completed' | 'canceled' | 'no-show' | 'late';
type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'not-required';
type EvaluationStatus = 'pending' | 'completed' | 'not-required';
type LessonDateFilter = 'all' | 'today' | 'week' | 'month';

type PracticalLesson = {
  id: string;
  date: string;
  time: string;
  endTime: string;
  student: string;
  studentId: string;
  studentPhone: string;
  instructor: string;
  instructorId: number;
  vehicle: string;
  vehicleReg: string;
  category: string;
  duration: number; // in minutes
  status: LessonStatus;
  paymentStatus: PaymentStatus;
  evaluationStatus: EvaluationStatus;
  route?: string;
  notes?: string;
  startLocation?: string;
  endLocation?: string;
  kmDriven?: number;
  skills?: string[];
  rating?: number;
  parentNotificationSent?: boolean;
  parentPerformanceSummary?: string;
  parentFeedbackRating?: number;
  parentFeedbackComment?: string;
  parentFeedbackSubmittedAt?: string;
  studentFeedbackRating?: number;
  studentFeedbackComment?: string;
  studentFeedbackSubmittedAt?: string;
  revisionHistory: Array<{
    id: string;
    actorName: string;
    changeSummary: string;
    changedAt: string;
  }>;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

const MOCK_LESSONS: PracticalLesson[] = [
  {
    id: '00000000-0000-0000-0000-000000000201',
    date: '2026-04-04',
    time: '09:00',
    endTime: '10:30',
    student: 'Антоан Тест',
    studentId: '00000000-0000-0000-0000-000000000101',
    studentPhone: '0886612503',
    instructor: 'Георги Петров',
    instructorId: 1,
    vehicle: 'Toyota Corolla',
    vehicleReg: 'CA 1234 AB',
    category: 'B',
    duration: 90,
    status: 'completed',
    paymentStatus: 'paid',
    evaluationStatus: 'completed',
    startLocation: 'Автошкола Mind on Road',
    endLocation: 'Автошкола Mind on Road',
    route: 'Градско каране - тестов маршрут',
    kmDriven: 18,
    skills: ['Паркиране', 'Маневри'],
    rating: 5,
    parentNotificationSent: true,
    parentPerformanceSummary: 'Изпратен тестов отчет към родител: Антоан Тест се справя стабилно.',
    parentFeedbackRating: 5,
    parentFeedbackComment: 'Благодаря за обратната връзка. Моля следващия път да има още упражнения на паркиране.',
    parentFeedbackSubmittedAt: '2026-04-04T13:00:00.000Z',
    studentFeedbackRating: 5,
    studentFeedbackComment: 'Урокът беше ясен и полезен, искам още практика по паркиране.',
    studentFeedbackSubmittedAt: '2026-04-04T12:00:00.000Z',
    revisionHistory: [],
  },
];

const getStatusInfo = (status: LessonStatus) => {
  switch (status) {
    case 'scheduled':
      return { label: 'Планиран', color: 'blue' as const };
    case 'in-progress':
      return { label: 'В ход', color: 'purple' as const };
    case 'completed':
      return { label: 'Завършен', color: 'green' as const };
    case 'canceled':
      return { label: 'Отменен', color: 'gray' as const };
    case 'no-show':
      return { label: 'Неявяване', color: 'red' as const };
    case 'late':
      return { label: 'Закъснял', color: 'orange' as const };
  }
};

const getPaymentStatusInfo = (status: PaymentStatus) => {
  switch (status) {
    case 'paid':
      return { label: 'Платен', color: 'green' as const };
    case 'pending':
      return { label: 'Чака', color: 'orange' as const };
    case 'overdue':
      return { label: 'Просрочен', color: 'red' as const };
    case 'not-required':
      return { label: 'Не е нужно', color: 'gray' as const };
  }
};

const getEvaluationStatusInfo = (status: EvaluationStatus) => {
  switch (status) {
    case 'pending':
      return { label: 'Чака оценка', color: 'orange' as const };
    case 'completed':
      return { label: 'Оценен', color: 'green' as const };
    case 'not-required':
      return { label: '—', color: 'gray' as const };
  }
};

const LESSON_STATUS_OPTIONS: Array<{ value: LessonStatus; label: string }> = [
  { value: 'scheduled', label: 'Планирани' },
  { value: 'in-progress', label: 'В ход' },
  { value: 'completed', label: 'Завършени' },
  { value: 'canceled', label: 'Отменени' },
  { value: 'no-show', label: 'Неявявания' },
  { value: 'late', label: 'Закъснели' },
];

const QUICK_FILTER_LABELS: Record<string, string> = {
  today: 'Днес',
  completed: 'Завършени',
  late: 'Закъснели',
  'no-show': 'Неявявания',
  canceled: 'Отменени',
  unpaid: 'Без плащане',
  'needs-evaluation': 'Чака оценка',
  'needs-attention': 'Проблемни',
};

function calculateLessonDurationMinutes(startTime: string, endTime: string) {
  const [startHours = 0, startMinutes = 0] = startTime
    .split(':')
    .map(Number);
  const [endHours = 0, endMinutes = 0] = endTime.split(':').map(Number);

  return endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
}

function toBackendLessonStatus(status: LessonStatus) {
  if (status === 'in-progress') return 'IN_PROGRESS' as const;
  if (status === 'completed') return 'COMPLETED' as const;
  if (status === 'canceled') return 'CANCELED' as const;
  if (status === 'no-show') return 'NO_SHOW' as const;
  if (status === 'late') return 'LATE' as const;
  return 'SCHEDULED' as const;
}

function toBackendPaymentStatus(status: PaymentStatus) {
  if (status === 'paid') return 'PAID' as const;
  if (status === 'overdue') return 'OVERDUE' as const;
  if (status === 'not-required') return 'NOT_REQUIRED' as const;
  return 'PENDING' as const;
}

function getUniqueSortedValues(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right, 'bg'));
}

function parseLessonDate(dateValue: string) {
  const parsedDate = new Date(dateValue);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function formatLessonTimestamp(timestamp?: string) {
  if (!timestamp) {
    return '—';
  }

  const parsedDate = new Date(timestamp);

  if (Number.isNaN(parsedDate.getTime())) {
    return timestamp;
  }

  return parsedDate.toLocaleString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isLessonInDateFilter(
  lessonDate: string,
  dateFilter: LessonDateFilter,
  todayDate: Date,
) {
  if (dateFilter === 'all') {
    return true;
  }

  const parsedLessonDate = parseLessonDate(lessonDate);

  if (!parsedLessonDate) {
    return false;
  }

  if (dateFilter === 'today') {
    return lessonDate === todayDate.toISOString().slice(0, 10);
  }

  const rangeStart = new Date(todayDate);
  rangeStart.setHours(0, 0, 0, 0);

  if (dateFilter === 'week') {
    const mondayShift = (rangeStart.getDay() + 6) % 7;
    rangeStart.setDate(rangeStart.getDate() - mondayShift);

    const weekEnd = new Date(rangeStart);
    weekEnd.setDate(rangeStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return parsedLessonDate >= rangeStart && parsedLessonDate <= weekEnd;
  }

  return (
    parsedLessonDate.getFullYear() === todayDate.getFullYear() &&
    parsedLessonDate.getMonth() === todayDate.getMonth()
  );
}

function matchesQuickFilter(
  lesson: PracticalLesson,
  filter: string,
  todayDate: string,
) {
  if (filter === 'today') {
    return lesson.date === todayDate;
  }

  if (filter === 'completed') {
    return lesson.status === 'completed';
  }

  if (filter === 'late') {
    return lesson.status === 'late';
  }

  if (filter === 'no-show') {
    return lesson.status === 'no-show';
  }

  if (filter === 'canceled') {
    return lesson.status === 'canceled';
  }

  if (filter === 'unpaid') {
    return (
      lesson.paymentStatus === 'pending' || lesson.paymentStatus === 'overdue'
    );
  }

  if (filter === 'needs-evaluation') {
    return lesson.evaluationStatus === 'pending';
  }

  if (filter === 'needs-attention') {
    return (
      lesson.status === 'no-show' ||
      lesson.status === 'late' ||
      lesson.paymentStatus === 'pending' ||
      lesson.paymentStatus === 'overdue'
    );
  }

  return true;
}

export function PracticalLessonsPage() {
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const isStudentPortalUser = Boolean(
    session?.user.roleKeys.includes('student'),
  );
  const isParentPortalUser = Boolean(
    session?.user.roleKeys.includes('parent'),
  );
  const canManagePracticalLessons = Boolean(
    hasFullAccessRole(session?.user.roleKeys ?? []) ||
      session?.user.permissionKeys.includes('scheduling.manage'),
  );
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<LessonDateFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | LessonStatus>('all');
  const [instructorFilter, setInstructorFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lessons, setLessons] = useState<PracticalLesson[]>(MOCK_LESSONS);
  const [students, setStudents] = useState<StudentOperationalRecord[]>(
    studentOperationalRecords,
  );
  const [sourceStatus, setSourceStatus] = useState<
    'loading' | 'backend' | 'fallback'
  >('loading');
  const [selectedLesson, setSelectedLesson] = useState<PracticalLesson | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [evaluationLesson, setEvaluationLesson] = useState<PracticalLesson | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    student: '',
    instructor: '',
    vehicle: '',
    category: '',
    date: '',
    time: '',
    endTime: '',
    status: 'scheduled' as LessonStatus,
    paymentStatus: 'pending' as PaymentStatus,
    route: '',
    startLocation: '',
    endLocation: '',
    notes: '',
  });
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [quickRating, setQuickRating] = useState<number>(0);
  const [quickComment, setQuickComment] = useState('');
  const [needsFollowUp, setNeedsFollowUp] = useState(false);
  const [isStudentFeedbackModalOpen, setIsStudentFeedbackModalOpen] =
    useState(false);
  const [feedbackLesson, setFeedbackLesson] =
    useState<PracticalLesson | null>(null);
  const [studentFeedbackRating, setStudentFeedbackRating] = useState(0);
  const [studentFeedbackComment, setStudentFeedbackComment] = useState('');
  const [studentFeedbackError, setStudentFeedbackError] = useState<
    string | null
  >(null);
  const [isSubmittingStudentFeedback, setIsSubmittingStudentFeedback] =
    useState(false);
  const [isParentFeedbackModalOpen, setIsParentFeedbackModalOpen] =
    useState(false);
  const [parentFeedbackLesson, setParentFeedbackLesson] =
    useState<PracticalLesson | null>(null);
  const [parentFeedbackRating, setParentFeedbackRating] = useState(0);
  const [parentFeedbackComment, setParentFeedbackComment] = useState('');
  const [parentFeedbackError, setParentFeedbackError] = useState<
    string | null
  >(null);
  const [isSubmittingParentFeedback, setIsSubmittingParentFeedback] =
    useState(false);
  const [createForm, setCreateForm] = useState({
    studentId: MOCK_LESSONS[0]?.studentId ?? '',
    studentName: MOCK_LESSONS[0]?.student ?? 'Антоан Тест',
    instructor: MOCK_LESSONS[0]?.instructor ?? 'Георги Петров',
    vehicle: `${MOCK_LESSONS[0]?.vehicle ?? 'Toyota Corolla'} · ${MOCK_LESSONS[0]?.vehicleReg ?? 'CA 1234 AB'}`,
    category: MOCK_LESSONS[0]?.category ?? 'B',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00',
    endTime: '10:30',
    route: 'Градско каране',
    startLocation: 'Автошкола Mind on Road',
    endLocation: 'Автошкола Mind on Road',
    notes: '',
  });
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([fetchPracticalLessonRecords(), fetchStudentOperations()])
      .then(([records, studentRows]) => {
        if (!isMounted) {
          return;
        }

        setLessons(records);
        setStudents(studentRows);
        if (studentRows[0]) {
          setCreateForm((current) => ({
            ...current,
            studentId: studentRows[0].id,
            studentName: studentRows[0].name,
            instructor: studentRows[0].instructor || current.instructor,
            category: studentRows[0].category || current.category,
          }));
        }
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setLessons(MOCK_LESSONS);
        setStudents(studentOperationalRecords);
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate summary statistics
  const today = new Date().toISOString().slice(0, 10);
  const todayLessons = lessons.filter(l => l.date === today);
  const completedLessons = lessons.filter(l => l.status === 'completed');
  const lateLessons = lessons.filter(l => l.status === 'late');
  const noShowLessons = lessons.filter(l => l.status === 'no-show');
  const canceledLessons = lessons.filter(l => l.status === 'canceled');
  const unpaidLessons = lessons.filter(l => l.paymentStatus === 'pending' || l.paymentStatus === 'overdue');
  const needsEvaluation = lessons.filter(l => l.evaluationStatus === 'pending');

  const instructorOptions = useMemo(
    () => getUniqueSortedValues(lessons.map((lesson) => lesson.instructor)),
    [lessons],
  );

  const vehicleOptions = useMemo(
    () =>
      getUniqueSortedValues(
        lessons.map((lesson) =>
          lesson.vehicleReg
            ? `${lesson.vehicle} · ${lesson.vehicleReg}`
            : lesson.vehicle,
        ),
      ),
    [lessons],
  );

  const categoryOptions = useMemo(
    () => getUniqueSortedValues(lessons.map((lesson) => lesson.category)),
    [lessons],
  );

  const filteredLessons = useMemo(() => {
    const todayDate = new Date();
    const todayIsoDate = todayDate.toISOString().slice(0, 10);
    const normalizedSearch = searchValue.trim().toLowerCase();

    return lessons.filter((lesson) => {
      const lessonVehicle = lesson.vehicleReg
        ? `${lesson.vehicle} · ${lesson.vehicleReg}`
        : lesson.vehicle;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        lesson.student.toLowerCase().includes(normalizedSearch) ||
        lesson.instructor.toLowerCase().includes(normalizedSearch) ||
        lessonVehicle.toLowerCase().includes(normalizedSearch) ||
        lesson.category.toLowerCase().includes(normalizedSearch) ||
        lesson.studentPhone.toLowerCase().includes(normalizedSearch);

      return (
        matchesSearch &&
        isLessonInDateFilter(lesson.date, dateFilter, todayDate) &&
        (statusFilter === 'all' || lesson.status === statusFilter) &&
        (instructorFilter === 'all' ||
          lesson.instructor === instructorFilter) &&
        (vehicleFilter === 'all' || lessonVehicle === vehicleFilter) &&
        (categoryFilter === 'all' || lesson.category === categoryFilter) &&
        activeFilters.every((filter) =>
          matchesQuickFilter(lesson, filter, todayIsoDate),
        )
      );
    });
  }, [
    activeFilters,
    categoryFilter,
    dateFilter,
    instructorFilter,
    lessons,
    searchValue,
    statusFilter,
    vehicleFilter,
  ]);

  const handleRowClick = (lesson: PracticalLesson) => {
    setSelectedLesson(lesson);
    setIsDrawerOpen(true);
    setActionMenuOpen(null);
  };

  const handleQuickEvaluation = (e: React.MouseEvent, lesson: PracticalLesson) => {
    e.stopPropagation();
    setEvaluationLesson(lesson);
    setQuickRating(lesson.rating || 0);
    setQuickComment('');
    setNeedsFollowUp(false);
    setIsEvaluationModalOpen(true);
    setActionMenuOpen(null);
  };

  const handleOpenEditLesson = (lesson: PracticalLesson, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setEditingLessonId(lesson.id);
    setEditForm({
      student: lesson.student,
      instructor: lesson.instructor,
      vehicle: lesson.vehicle,
      category: lesson.category,
      date: lesson.date,
      time: lesson.time,
      endTime: lesson.endTime,
      status: lesson.status,
      paymentStatus: lesson.paymentStatus,
      route: lesson.route || '',
      startLocation: lesson.startLocation || '',
      endLocation: lesson.endLocation || '',
      notes: lesson.notes || '',
    });
    setActionMenuOpen(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditLesson = () => {
    setIsEditModalOpen(false);
    setEditingLessonId(null);
  };

  const handleEditFieldChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const applyPersistedLesson = (updatedLesson: PracticalLesson) => {
    setLessons((current) =>
      current.map((lesson) =>
        lesson.id === updatedLesson.id ? updatedLesson : lesson,
      ),
    );
    setSelectedLesson((current) =>
      current && current.id === updatedLesson.id ? updatedLesson : current,
    );
  };

  const handleSaveEditedLesson = async () => {
    if (editingLessonId === null) {
      return;
    }

    const updatedLesson = await updatePracticalLessonRecord(
      editingLessonId,
      {
        studentName: editForm.student,
        instructorName: editForm.instructor,
        vehicleLabel: editForm.vehicle,
        categoryCode: editForm.category,
        lessonDate: editForm.date,
        startTimeLabel: editForm.time,
        endTimeLabel: editForm.endTime,
        durationMinutes: Math.max(
          30,
          calculateLessonDurationMinutes(editForm.time, editForm.endTime),
        ),
        status: toBackendLessonStatus(editForm.status),
        paymentStatus: toBackendPaymentStatus(editForm.paymentStatus),
        routeLabel: editForm.route || null,
        startLocation: editForm.startLocation || null,
        endLocation: editForm.endLocation || null,
        notes: editForm.notes || null,
      },
      session?.csrfToken ?? '',
    );

    applyPersistedLesson(updatedLesson);

    handleCloseEditLesson();
  };

  const handleSubmitEvaluation = async () => {
    if (!evaluationLesson) {
      return;
    }

    const generatedParentSummary =
      quickComment.trim().length > 0
        ? `Изпратен отчет: оценка ${quickRating}/5 · ${quickComment.trim()}`
        : `Изпратен отчет: оценка ${quickRating}/5 · Урокът е приключен успешно с отбелязани ключови наблюдения.`;

    const updatedLesson = await updatePracticalLessonRecord(
      evaluationLesson.id,
      {
        rating: quickRating,
        evaluationStatus: 'COMPLETED',
        notes:
          quickComment.trim().length > 0
            ? quickComment.trim()
            : evaluationLesson.notes ?? null,
        parentNotificationSent: true,
        parentPerformanceSummary: generatedParentSummary,
      },
      session?.csrfToken ?? '',
    );

    applyPersistedLesson(updatedLesson);

    setIsEvaluationModalOpen(false);
    setQuickRating(0);
    setQuickComment('');
    setNeedsFollowUp(false);
  };

  const handleSendParentPerformanceReport = async (lessonId: string) => {
    const sentAt = new Date().toLocaleString('bg-BG');
    const targetLesson = lessons.find((lesson) => lesson.id === lessonId);

    const updatedLesson = await updatePracticalLessonRecord(
      lessonId,
      {
        parentNotificationSent: true,
        parentPerformanceSummary:
          targetLesson?.parentPerformanceSummary ??
          `Изпратен отчет към родител на ${sentAt}: ${targetLesson?.notes || 'Урокът е отчетен без критични забележки.'}`,
      },
      session?.csrfToken ?? '',
    );

    applyPersistedLesson(updatedLesson);
  };

  const handleOpenStudentFeedback = (lesson: PracticalLesson) => {
    setFeedbackLesson(lesson);
    setStudentFeedbackRating(lesson.studentFeedbackRating || 0);
    setStudentFeedbackComment(lesson.studentFeedbackComment || '');
    setStudentFeedbackError(null);
    setIsStudentFeedbackModalOpen(true);
  };

  const handleSubmitStudentFeedback = async () => {
    if (!feedbackLesson || isSubmittingStudentFeedback) {
      return;
    }

    if (studentFeedbackRating === 0) {
      setStudentFeedbackError('Избери оценка от 1 до 5.');
      return;
    }

    if (studentFeedbackComment.trim().length < 2) {
      setStudentFeedbackError('Добави кратък коментар за урока.');
      return;
    }

    setIsSubmittingStudentFeedback(true);
    setStudentFeedbackError(null);

    try {
      const updatedLesson = await submitPracticalLessonStudentFeedback(
        feedbackLesson.id,
        {
          studentFeedbackRating,
          studentFeedbackComment: studentFeedbackComment.trim(),
        },
        session?.csrfToken ?? '',
      );

      applyPersistedLesson(updatedLesson);
      setIsStudentFeedbackModalOpen(false);
      setFeedbackLesson(null);
    } catch (error) {
      setStudentFeedbackError(
        error instanceof Error
          ? error.message
          : 'Обратната връзка не беше записана.',
      );
    } finally {
      setIsSubmittingStudentFeedback(false);
    }
  };

  const handleOpenParentFeedback = (lesson: PracticalLesson) => {
    setParentFeedbackLesson(lesson);
    setParentFeedbackRating(lesson.parentFeedbackRating || 0);
    setParentFeedbackComment(lesson.parentFeedbackComment || '');
    setParentFeedbackError(null);
    setIsParentFeedbackModalOpen(true);
  };

  const handleSubmitParentFeedback = async () => {
    if (!parentFeedbackLesson || isSubmittingParentFeedback) {
      return;
    }

    if (parentFeedbackRating === 0) {
      setParentFeedbackError('Избери оценка от 1 до 5.');
      return;
    }

    if (parentFeedbackComment.trim().length < 2) {
      setParentFeedbackError('Добави кратък коментар като родител.');
      return;
    }

    setIsSubmittingParentFeedback(true);
    setParentFeedbackError(null);

    try {
      const updatedLesson = await submitPracticalLessonParentFeedback(
        parentFeedbackLesson.id,
        {
          parentFeedbackRating,
          parentFeedbackComment: parentFeedbackComment.trim(),
        },
        session?.csrfToken ?? '',
      );

      applyPersistedLesson(updatedLesson);
      setIsParentFeedbackModalOpen(false);
      setParentFeedbackLesson(null);
    } catch (error) {
      setParentFeedbackError(
        error instanceof Error
          ? error.message
          : 'Родителската обратна връзка не беше записана.',
      );
    } finally {
      setIsSubmittingParentFeedback(false);
    }
  };

  const toggleActionMenu = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    setActionMenuOpen(actionMenuOpen === lessonId ? null : lessonId);
  };

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchValue('');
    setDateFilter('all');
    setStatusFilter('all');
    setInstructorFilter('all');
    setVehicleFilter('all');
    setCategoryFilter('all');
  };

  const handleCreatePracticalLesson = async () => {
    if (isSavingLesson) {
      return;
    }

    const selectedStudent =
      students.find((student) => student.id === createForm.studentId) ??
      students[0];

    if (!selectedStudent) {
      setCreateError('Няма наличен курсист за създаване на час.');
      return;
    }

    setIsSavingLesson(true);
    setCreateError(null);

    try {
      const createdLesson = await createPracticalLessonRecord(
        {
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          instructorName:
            createForm.instructor.trim() ||
            selectedStudent.instructor ||
            'Няма зададен инструктор',
          vehicleLabel:
            createForm.vehicle.trim() || 'Toyota Corolla · CA 1234 AB',
          categoryCode: createForm.category.trim() || selectedStudent.category,
          lessonDate: createForm.date,
          startTimeLabel: createForm.time,
          endTimeLabel: createForm.endTime,
          durationMinutes: Math.max(
            30,
            calculateLessonDurationMinutes(
              createForm.time,
              createForm.endTime,
            ),
          ),
          status: 'SCHEDULED',
          paymentStatus: 'PAID',
          evaluationStatus: 'PENDING',
          routeLabel: createForm.route.trim() || null,
          startLocation: createForm.startLocation.trim() || null,
          endLocation: createForm.endLocation.trim() || null,
          notes: createForm.notes.trim() || null,
          kmDriven: null,
          rating: null,
          parentNotificationSent: false,
          parentPerformanceSummary: null,
        },
        session?.csrfToken ?? '',
      );

      setLessons((current) => [createdLesson, ...current]);
      setCreateForm((current) => ({
        ...current,
        notes: '',
      }));
      setIsCreateModalOpen(false);
      setSourceStatus('backend');
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : 'Практическият час не беше създаден.',
      );
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await deletePracticalLessonRecord(lessonId, session?.csrfToken ?? '');

      setLessons((current) =>
        current.filter((lesson) => lesson.id !== lessonId),
      );
      setSelectedLesson((current) =>
        current?.id === lessonId ? null : current,
      );
      setActionMenuOpen(null);
      setIsDrawerOpen((current) =>
        selectedLesson?.id === lessonId ? false : current,
      );
      setSourceStatus('backend');
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : 'Часът не беше изтрит от базата.',
      );
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Page Header */}
      <PageHeader
        title="Практически часове"
        description={`Управление на практическо обучение и контрол на часове · ${
          sourceStatus === 'backend'
            ? 'PostgreSQL + Redis'
            : sourceStatus === 'fallback'
              ? 'Fallback данни'
              : 'Зареждане...'
        }`}
        breadcrumbs={[
          { label: 'Начало', onClick: () => navigate('/') },
          { label: 'Практика' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={<AlertTriangle size={18} />}
              onClick={() => addFilter('needs-attention')}
            >
              Проблемни ({noShowLessons.length + lateLessons.length + unpaidLessons.length})
            </Button>
            <Button
              variant="secondary"
              icon={<CalendarIcon size={18} />}
              onClick={() => navigate('/schedule')}
            >
              Календар
            </Button>
            <Button
              variant="secondary"
              icon={<Download size={18} />}
              onClick={() => exportPracticalLessonsCsv(filteredLessons)}
            >
              Експорт
            </Button>
            {canManagePracticalLessons && (
              <Button
                variant="primary"
                icon={<Plus size={18} />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Нов час
              </Button>
            )}
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {/* Today's Lessons */}
          <button
            onClick={() => addFilter('today')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(99, 102, 241, 0.1)' }}
              >
                <Clock size={20} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {todayLessons.length}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Днес
            </p>
          </button>

          {/* Completed */}
          <button
            onClick={() => addFilter('completed')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(34, 197, 94, 0.1)' }}
              >
                <CheckCircle size={20} style={{ color: '#22c55e' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {completedLessons.length}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Завършени
            </p>
          </button>

          {/* Late */}
          <button
            onClick={() => addFilter('late')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--bg-card)',
              border: lateLessons.length > 0 ? '1px solid rgba(251, 146, 60, 0.3)' : 'none',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(251, 146, 60, 0.1)' }}
              >
                <Timer size={20} style={{ color: '#fb923c' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {lateLessons.length}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Закъснели
            </p>
          </button>

          {/* No Show */}
          <button
            onClick={() => addFilter('no-show')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--bg-card)',
              border: noShowLessons.length > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <UserX size={20} style={{ color: '#ef4444' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {noShowLessons.length}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Неявявания
            </p>
          </button>

          {/* Canceled */}
          <button
            onClick={() => addFilter('canceled')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(156, 163, 175, 0.1)' }}
              >
                <Ban size={20} style={{ color: '#9ca3af' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {canceledLessons.length}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Отменени
            </p>
          </button>

          {/* Unpaid */}
          <button
            onClick={() => addFilter('unpaid')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--bg-card)',
              border: unpaidLessons.length > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <CreditCard size={20} style={{ color: '#ef4444' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {unpaidLessons.length}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Без плащане
            </p>
          </button>

          {/* Needs Evaluation */}
          <button
            onClick={() => addFilter('needs-evaluation')}
            className="rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--bg-card)',
              border: needsEvaluation.length > 0 ? '1px solid rgba(251, 146, 60, 0.3)' : 'none',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'rgba(251, 146, 60, 0.1)' }}
              >
                <ClipboardCheck size={20} style={{ color: '#fb923c' }} />
              </div>
              <span
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {needsEvaluation.length}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Чака оценка
            </p>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 lg:px-8 pb-6">
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Search and Main Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search */}
            <div className="flex-1 min-w-[280px] relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <input
                type="text"
                placeholder="Търсене по курсист или инструктор..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all"
                style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              />
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(event.target.value as LessonDateFilter)
              }
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer transition-all min-w-[160px]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <option value="all">Всички дати</option>
              <option value="today">Днес</option>
              <option value="week">Тази седмица</option>
              <option value="month">Този месец</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as 'all' | LessonStatus)
              }
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer transition-all min-w-[160px]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <option value="all">Всички статуси</option>
              {LESSON_STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>

            {/* Instructor Filter */}
            <select
              value={instructorFilter}
              onChange={(event) => setInstructorFilter(event.target.value)}
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer transition-all min-w-[180px]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <option value="all">Всички инструктори</option>
              {instructorOptions.map((instructorOption) => (
                <option key={instructorOption} value={instructorOption}>
                  {instructorOption}
                </option>
              ))}
            </select>

            {/* Vehicle Filter */}
            <select
              value={vehicleFilter}
              onChange={(event) => setVehicleFilter(event.target.value)}
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer transition-all min-w-[160px]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <option value="all">Всички автомобили</option>
              {vehicleOptions.map((vehicleOption) => (
                <option key={vehicleOption} value={vehicleOption}>
                  {vehicleOption}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="px-4 py-2.5 rounded-lg outline-none cursor-pointer transition-all min-w-[140px]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <option value="all">Всички категории</option>
              {categoryOptions.map((categoryOption) => (
                <option key={categoryOption} value={categoryOption}>
                  Категория {categoryOption}
                </option>
              ))}
            </select>

            {/* More Filters Button */}
            <Button
              variant="secondary"
              icon={<Filter size={16} />}
              onClick={clearAllFilters}
            >
              Изчисти
            </Button>
          </div>

          {/* Active Filters Pills */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                Активни филтри:
              </span>
              {activeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => removeFilter(filter)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: 'var(--accent-primary)',
                    fontSize: '0.875rem',
                  }}
                >
                  {QUICK_FILTER_LABELS[filter] ?? filter}
                  <X size={14} />
                </button>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm transition-all hover:opacity-80"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Изчисти всички
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="px-6 lg:px-8 pb-8">
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <th
                    className="text-left px-6 py-4"
                    style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.875rem' }}
                  >
                    Дата и час
                  </th>
                  <th
                    className="text-left px-6 py-4"
                    style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.875rem' }}
                  >
                    Курсист
                  </th>
                  <th
                    className="text-left px-6 py-4"
                    style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.875rem' }}
                  >
                    Инструктор
                  </th>
                  <th
                    className="text-left px-6 py-4"
                    style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.875rem' }}
                  >
                    Автомобил
                  </th>
                  <th
                    className="text-left px-6 py-4"
                    style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.875rem' }}
                  >
                    Кат.
                  </th>
                  <th
                    className="text-left px-6 py-4"
                    style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.875rem' }}
                  >
                    Време
                  </th>
                  <th
                    className="text-left px-6 py-4"
                    style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.875rem' }}
                  >
                    Статус
                  </th>
                  <th
                    className="text-left px-6 py-4"
                    style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.875rem' }}
                  >
                    Плащане
                  </th>
                  <th
                    className="text-left px-6 py-4"
                    style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.875rem' }}
                  >
                    Оценка
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson) => {
                  const statusInfo = getStatusInfo(lesson.status);
                  const paymentInfo = getPaymentStatusInfo(lesson.paymentStatus);
                  const evaluationInfo = getEvaluationStatusInfo(lesson.evaluationStatus);

                  // Determine row background for problem states
                  const hasPaymentIssue = lesson.paymentStatus === 'pending' || lesson.paymentStatus === 'overdue';
                  const hasAttendanceIssue = lesson.status === 'no-show' || lesson.status === 'late';
                  
                  let rowStyle: React.CSSProperties = { 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)' 
                  };
                  
                  if (lesson.status === 'no-show') {
                    rowStyle.background = 'rgba(239, 68, 68, 0.03)';
                  } else if (hasPaymentIssue) {
                    rowStyle.background = 'rgba(251, 146, 60, 0.03)';
                  } else if (lesson.status === 'late') {
                    rowStyle.background = 'rgba(251, 146, 60, 0.02)';
                  }

                  return (
                    <tr
                      key={lesson.id}
                      onClick={() => handleRowClick(lesson)}
                      className="cursor-pointer transition-all hover:bg-white/[0.03]"
                      style={rowStyle}
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                            {new Date(lesson.date).toLocaleDateString('bg-BG', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: '2px' }}>
                            {lesson.time} - {lesson.endTime}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                          >
                            <User size={16} style={{ color: 'var(--accent-primary)' }} />
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                              {lesson.student}
                            </p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: '2px' }}>
                              ID: {lesson.studentId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                          {lesson.instructor}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                            {lesson.vehicle}
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: '2px' }}>
                            {lesson.vehicleReg}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg font-medium"
                          style={{
                            background: 'rgba(167, 139, 250, 0.1)',
                            color: 'var(--accent-ai)',
                            fontSize: '0.875rem',
                          }}
                        >
                          {lesson.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                          {lesson.duration} мин
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Badge variant={paymentInfo.color}>
                            {paymentInfo.label}
                          </Badge>
                          {lesson.parentNotificationSent && hasPaymentIssue && (
                            <div
                              className="p-1.5 rounded"
                              style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                              title="Родител е уведомен"
                            >
                              <Bell size={14} style={{ color: 'var(--accent-primary)' }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Badge variant={evaluationInfo.color}>
                            {evaluationInfo.label}
                          </Badge>
                          {canManagePracticalLessons &&
                            lesson.status === 'completed' &&
                            lesson.evaluationStatus === 'pending' && (
                            <button
                              onClick={(e) => handleQuickEvaluation(e, lesson)}
                              className="p-1.5 rounded-lg transition-all hover:bg-white/[0.08]"
                              style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                              title="Бърза оценка"
                            >
                              <ClipboardCheck size={14} style={{ color: 'var(--accent-primary)' }} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="relative">
                          <button
                            onClick={(e) => toggleActionMenu(e, lesson.id)}
                            className="p-2 rounded-lg transition-all hover:bg-white/[0.05]"
                          >
                            <MoreVertical size={18} style={{ color: 'var(--text-tertiary)' }} />
                          </button>
                          {actionMenuOpen === lesson.id && (
                            <div
                              className="absolute right-0 top-full mt-1 w-48 rounded-xl shadow-xl z-10 py-2"
                              style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(lesson);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 transition-all hover:bg-white/[0.05]"
                              >
                                <Eye size={16} style={{ color: 'var(--text-tertiary)' }} />
                                <span style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                                  Преглед
                                </span>
                              </button>
                              {canManagePracticalLessons && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditLesson(lesson, e);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-all hover:bg-white/[0.05]"
                                >
                                  <Edit2 size={16} style={{ color: 'var(--text-tertiary)' }} />
                                  <span style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                                    Редактиране
                                  </span>
                                </button>
                              )}
                              {canManagePracticalLessons &&
                                lesson.status === 'completed' &&
                                lesson.evaluationStatus === 'pending' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickEvaluation(e, lesson);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-all hover:bg-white/[0.05]"
                                >
                                  <ClipboardCheck size={16} style={{ color: 'var(--accent-primary)' }} />
                                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.9375rem' }}>
                                    Добави оценка
                                  </span>
                                </button>
                              )}
                              {canManagePracticalLessons && (
                                <>
                                  <div
                                    className="my-2"
                                    style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void handleDeleteLesson(lesson.id);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-all hover:bg-white/[0.05]"
                                  >
                                    <Trash2 size={16} style={{ color: '#ef4444' }} />
                                    <span style={{ color: '#ef4444', fontSize: '0.9375rem' }}>
                                      Изтриване
                                    </span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredLessons.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-10 text-center"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Няма намерени практически часове по избраните филтри.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {isDrawerOpen && selectedLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.6)' }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl h-full overflow-y-auto"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Drawer Header */}
            <div
              className="sticky top-0 z-10 px-8 py-6 flex items-start justify-between"
              style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div>
                <h2
                  className="text-xl font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Детайли на часа
                </h2>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                  {new Date(selectedLesson.date).toLocaleDateString('bg-BG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })} в {selectedLesson.time}
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg transition-all hover:bg-white/[0.05]"
              >
                <X size={24} style={{ color: 'var(--text-tertiary)' }} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="px-8 py-6 space-y-6">
              {/* Status Overview */}
              <div
                className="rounded-xl p-5"
                style={{ background: 'var(--bg-primary)' }}
              >
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p
                      className="mb-2"
                      style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}
                    >
                      Статус на часа
                    </p>
                    <Badge variant={getStatusInfo(selectedLesson.status).color} size="lg">
                      {getStatusInfo(selectedLesson.status).label}
                    </Badge>
                  </div>
                  <div>
                    <p
                      className="mb-2"
                      style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}
                    >
                      Плащане
                    </p>
                    <Badge variant={getPaymentStatusInfo(selectedLesson.paymentStatus).color} size="lg">
                      {getPaymentStatusInfo(selectedLesson.paymentStatus).label}
                    </Badge>
                  </div>
                  <div>
                    <p
                      className="mb-2"
                      style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}
                    >
                      Оценка
                    </p>
                    <Badge variant={getEvaluationStatusInfo(selectedLesson.evaluationStatus).color} size="lg">
                      {getEvaluationStatusInfo(selectedLesson.evaluationStatus).label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Student Info */}
              <div>
                <h3
                  className="font-medium mb-4"
                  style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                >
                  Информация за курсиста
                </h3>
                <div
                  className="rounded-xl p-5 space-y-4"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                    >
                      <User size={24} style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div>
                      <p
                        className="font-medium mb-0.5"
                        style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                      >
                        {selectedLesson.student}
                      </p>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        ID: {selectedLesson.studentId}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Phone size={16} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        {selectedLesson.studentPhone}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/students/${selectedLesson.studentId}`)}
                      className="flex items-center gap-2 justify-end text-sm transition-all hover:opacity-80"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      Виж профил
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructor & Vehicle */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3
                    className="font-medium mb-3"
                    style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                  >
                    Инструктор
                  </h3>
                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} style={{ color: 'var(--accent-primary)' }} />
                      <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                        {selectedLesson.instructor}
                      </p>
                    </div>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                      ID: {selectedLesson.instructorId}
                    </p>
                  </div>
                </div>
                <div>
                  <h3
                    className="font-medium mb-3"
                    style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                  >
                    Автомобил
                  </h3>
                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Car size={16} style={{ color: 'var(--accent-primary)' }} />
                      <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                        {selectedLesson.vehicle}
                      </p>
                    </div>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                      {selectedLesson.vehicleReg}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lesson Details */}
              <div>
                <h3
                  className="font-medium mb-4"
                  style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                >
                  Детайли на урока
                </h3>
                <div
                  className="rounded-xl p-5 space-y-3"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash size={16} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                        Категория
                      </span>
                    </div>
                    <span
                      className="font-medium"
                      style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                    >
                      {selectedLesson.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer size={16} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                        Продължителност
                      </span>
                    </div>
                    <span
                      className="font-medium"
                      style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                    >
                      {selectedLesson.duration} минути
                    </span>
                  </div>
                  {selectedLesson.route && (
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Navigation size={16} style={{ color: 'var(--text-tertiary)' }} />
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                          Маршрут
                        </span>
                      </div>
                      <span
                        className="font-medium text-right"
                        style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                      >
                        {selectedLesson.route}
                      </span>
                    </div>
                  )}
                  {selectedLesson.startLocation && (
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} style={{ color: 'var(--text-tertiary)' }} />
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                          Начална точка
                        </span>
                      </div>
                      <span
                        className="font-medium text-right max-w-[60%]"
                        style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                      >
                        {selectedLesson.startLocation}
                      </span>
                    </div>
                  )}
                  {selectedLesson.kmDriven && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Fuel size={16} style={{ color: 'var(--text-tertiary)' }} />
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                          Изминати км
                        </span>
                      </div>
                      <span
                        className="font-medium"
                        style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                      >
                        {selectedLesson.kmDriven} км
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills & Rating */}
              {selectedLesson.skills && selectedLesson.skills.length > 0 && (
                <div>
                  <h3
                    className="font-medium mb-3"
                    style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                  >
                    Обучени умения
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-lg"
                        style={{
                          background: 'rgba(167, 139, 250, 0.1)',
                          border: '1px solid rgba(167, 139, 250, 0.2)',
                          color: 'var(--accent-ai)',
                          fontSize: '0.875rem',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedLesson.rating && (
                <div>
                  <h3
                    className="font-medium mb-3"
                    style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                  >
                    Оценка от инструктора
                  </h3>
                  <div
                    className="rounded-xl p-4 flex items-center gap-3"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className="w-6 h-6 rounded"
                          style={{
                            background:
                              star <= selectedLesson.rating!
                                ? 'var(--accent-primary)'
                                : 'rgba(255, 255, 255, 0.1)',
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="font-medium"
                      style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                    >
                      {selectedLesson.rating} от 5
                    </span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3
                    className="font-medium"
                    style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                  >
                    Обратна връзка от курсиста
                  </h3>
                  {isStudentPortalUser && selectedLesson.status === 'completed' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<StarOff size={16} />}
                      onClick={() => handleOpenStudentFeedback(selectedLesson)}
                    >
                      {selectedLesson.studentFeedbackRating
                        ? 'Обнови обратна връзка'
                        : 'Дай обратна връзка'}
                    </Button>
                  )}
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  {selectedLesson.studentFeedbackRating ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((ratingValue) => (
                            <div
                              key={ratingValue}
                              className="w-5 h-5 rounded"
                              style={{
                                background:
                                  ratingValue <=
                                  selectedLesson.studentFeedbackRating!
                                    ? 'rgba(34, 197, 94, 0.95)'
                                    : 'rgba(255, 255, 255, 0.1)',
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="font-medium"
                          style={{
                            color: 'var(--text-primary)',
                            fontSize: '0.9375rem',
                          }}
                        >
                          {selectedLesson.studentFeedbackRating} от 5
                        </span>
                      </div>
                      <p
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.9375rem',
                          lineHeight: 1.6,
                        }}
                      >
                        {selectedLesson.studentFeedbackComment}
                      </p>
                      <p
                        style={{
                          color: 'var(--text-tertiary)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        Подадена на{' '}
                        {formatLessonTimestamp(
                          selectedLesson.studentFeedbackSubmittedAt,
                        )}
                      </p>
                    </div>
                  ) : (
                    <p
                      style={{
                        color: 'var(--text-tertiary)',
                        fontSize: '0.9375rem',
                        lineHeight: 1.6,
                      }}
                    >
                      Все още няма въведена обратна връзка от курсиста за този урок.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3
                    className="font-medium"
                    style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                  >
                    Обратна връзка от родител
                  </h3>
                  {isParentPortalUser && selectedLesson.status === 'completed' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Send size={16} />}
                      onClick={() => handleOpenParentFeedback(selectedLesson)}
                    >
                      {selectedLesson.parentFeedbackRating
                        ? 'Обнови родителски коментар'
                        : 'Дай родителски коментар'}
                    </Button>
                  )}
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  {selectedLesson.parentFeedbackRating ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((ratingValue) => (
                            <div
                              key={ratingValue}
                              className="w-5 h-5 rounded"
                              style={{
                                background:
                                  ratingValue <=
                                  selectedLesson.parentFeedbackRating!
                                    ? 'var(--accent-primary)'
                                    : 'rgba(255, 255, 255, 0.1)',
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="font-medium"
                          style={{
                            color: 'var(--text-primary)',
                            fontSize: '0.9375rem',
                          }}
                        >
                          {selectedLesson.parentFeedbackRating} от 5
                        </span>
                      </div>
                      <p
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.9375rem',
                          lineHeight: 1.6,
                        }}
                      >
                        {selectedLesson.parentFeedbackComment}
                      </p>
                      <p
                        style={{
                          color: 'var(--text-tertiary)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        Подадена на{' '}
                        {formatLessonTimestamp(
                          selectedLesson.parentFeedbackSubmittedAt,
                        )}
                      </p>
                    </div>
                  ) : (
                    <p
                      style={{
                        color: 'var(--text-tertiary)',
                        fontSize: '0.9375rem',
                        lineHeight: 1.6,
                      }}
                    >
                      Все още няма въведена родителска обратна връзка за този урок.
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedLesson.notes && (
                <div>
                  <h3
                    className="font-medium mb-3"
                    style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                  >
                    Бележки
                  </h3>
                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                      {selectedLesson.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Activity Timeline */}
              <div>
                <h3
                  className="font-medium mb-4"
                  style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                >
                  История на активност
                </h3>
                <div
                  className="rounded-xl p-5"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <div className="space-y-4">
                    {/* Latest Activity */}
                    {selectedLesson.revisionHistory.map((revision) => (
                      <div key={revision.id} className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                        >
                          <Settings size={14} style={{ color: '#60a5fa' }} />
                        </div>
                        <div className="flex-1">
                          <p
                            style={{
                              color: 'var(--text-primary)',
                              fontSize: '0.9375rem',
                              marginBottom: '2px',
                            }}
                          >
                            {revision.changeSummary}
                          </p>
                          <p
                            style={{
                              color: 'var(--text-tertiary)',
                              fontSize: '0.8125rem',
                            }}
                          >
                            {revision.actorName} • {formatLessonTimestamp(revision.changedAt)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {selectedLesson.status === 'completed' && selectedLesson.rating && (
                      <div className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                        >
                          <ClipboardCheck size={14} style={{ color: '#22c55e' }} />
                        </div>
                        <div className="flex-1">
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }}>
                            Добавена оценка
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                            {selectedLesson.updatedBy} • {formatLessonTimestamp(selectedLesson.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Completion */}
                    {selectedLesson.status === 'completed' && (
                      <div className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                        >
                          <CheckCircle size={14} style={{ color: '#22c55e' }} />
                        </div>
                        <div className="flex-1">
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }}>
                            Часът завършен
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                            {selectedLesson.updatedBy} • {formatLessonTimestamp(selectedLesson.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* No Show */}
                    {selectedLesson.status === 'no-show' && (
                      <div className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <UserX size={14} style={{ color: '#ef4444' }} />
                        </div>
                        <div className="flex-1">
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }}>
                            Маркиран като неявяване
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                            {selectedLesson.updatedBy} • {formatLessonTimestamp(selectedLesson.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Late */}
                    {selectedLesson.status === 'late' && (
                      <div className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(251, 146, 60, 0.1)' }}
                        >
                          <Timer size={14} style={{ color: '#fb923c' }} />
                        </div>
                        <div className="flex-1">
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }}>
                            Маркиран като закъснял
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                            {selectedLesson.updatedBy} • {formatLessonTimestamp(selectedLesson.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Canceled */}
                    {selectedLesson.status === 'canceled' && (
                      <div className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(156, 163, 175, 0.1)' }}
                        >
                          <Ban size={14} style={{ color: '#9ca3af' }} />
                        </div>
                        <div className="flex-1">
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }}>
                            Часът отменен
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                            {selectedLesson.updatedBy} • {formatLessonTimestamp(selectedLesson.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* In Progress */}
                    {selectedLesson.status === 'in-progress' && (
                      <div className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(167, 139, 250, 0.1)' }}
                        >
                          <Activity size={14} style={{ color: 'var(--accent-ai)' }} />
                        </div>
                        <div className="flex-1">
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }}>
                            Часът стартиран
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                            {selectedLesson.updatedBy} • {formatLessonTimestamp(selectedLesson.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Parent Notification */}
                    {selectedLesson.parentNotificationSent && (
                      <div className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                        >
                          <Send size={14} style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <div className="flex-1">
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }}>
                            Изпратено известие до родител
                          </p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2px' }}>
                            {selectedLesson.parentPerformanceSummary || 'Изпратен е кратък отчет за представянето след урока.'}
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                            Система • {formatLessonTimestamp(selectedLesson.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Payment Checked */}
                    {selectedLesson.paymentStatus === 'paid' && (
                      <div className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                        >
                          <CreditCard size={14} style={{ color: '#22c55e' }} />
                        </div>
                        <div className="flex-1">
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }}>
                            Плащане потвърдено
                          </p>
                          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                            Система • {formatLessonTimestamp(selectedLesson.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Created */}
                    <div className="flex gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                      >
                        <Plus size={14} style={{ color: 'var(--accent-primary)' }} />
                      </div>
                      <div className="flex-1">
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '2px' }}>
                          Часът създаден
                        </p>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                          {selectedLesson.createdBy} • {formatLessonTimestamp(selectedLesson.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div>
                <h3
                  className="font-medium mb-4"
                  style={{ color: 'var(--text-primary)', fontSize: '1rem' }}
                >
                  Системна информация
                </h3>
                <div
                  className="rounded-xl p-5 space-y-3"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                      Създаден от
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                      {selectedLesson.createdBy || 'Система'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                      Последна промяна от
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                      {selectedLesson.updatedBy || 'Система'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                      Създаден на
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                      {formatLessonTimestamp(selectedLesson.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                      Обновен на
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                      {formatLessonTimestamp(selectedLesson.updatedAt)}
                    </span>
                  </div>
                  {selectedLesson.parentNotificationSent && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg mt-3"
                      style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)' }}
                    >
                      <Bell size={16} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}>
                        Родител е известен за представянето след урока
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {canManagePracticalLessons &&
                  selectedLesson.evaluationStatus === 'pending' && (
                  <Button
                    variant="primary"
                    icon={<ClipboardCheck size={18} />}
                    fullWidth
                    onClick={(e) => {
                      handleQuickEvaluation(e as any, selectedLesson);
                      setIsDrawerOpen(false);
                    }}
                  >
                    Добави оценка
                  </Button>
                )}
                {canManagePracticalLessons &&
                  selectedLesson.status === 'completed' && (
                  <Button
                    variant={selectedLesson.parentNotificationSent ? 'secondary' : 'primary'}
                    icon={<Send size={18} />}
                    fullWidth
                    onClick={() => void handleSendParentPerformanceReport(selectedLesson.id)}
                  >
                    {selectedLesson.parentNotificationSent ? 'Изпрати отново към родител' : 'Изпрати отчет към родител'}
                  </Button>
                )}
                {canManagePracticalLessons && (
                  <Button
                    variant="secondary"
                    icon={<Edit2 size={18} />}
                    fullWidth
                    onClick={() => selectedLesson && handleOpenEditLesson(selectedLesson)}
                  >
                    {'Редактиране'}
                  </Button>
                )}
                {isStudentPortalUser && selectedLesson.status === 'completed' && (
                  <Button
                    variant="primary"
                    icon={<StarOff size={18} />}
                    fullWidth
                    onClick={() => handleOpenStudentFeedback(selectedLesson)}
                  >
                    {'Моята обратна връзка'}
                  </Button>
                )}
                {isParentPortalUser && selectedLesson.status === 'completed' && (
                  <Button
                    variant="primary"
                    icon={<Send size={18} />}
                    fullWidth
                    onClick={() => handleOpenParentFeedback(selectedLesson)}
                  >
                    {'Родителски коментар'}
                  </Button>
                )}
                <Button variant="secondary" icon={<FileText size={18} />}>
                  Протокол
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingLessonId !== null && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditLesson}
          title={'\u0420\u0435\u0434\u0430\u043a\u0446\u0438\u044f \u043d\u0430 \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0430\u0442\u0430'}
          maxWidth="2xl"
        >
          <div className="space-y-6 p-6">
            <div
              className="rounded-2xl p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
                {'\u041f\u043e\u043f\u044a\u043b\u043d\u0435\u0442\u0435 \u0430\u043a\u0442\u0443\u0430\u043b\u043d\u0438\u0442\u0435 \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u043f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0442\u043e \u0437\u0430\u043d\u044f\u0442\u0438\u0435'}
              </p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                {'\u0422\u0443\u043a \u0430\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u044a\u0442 \u043c\u043e\u0436\u0435 \u0434\u0430 \u043a\u043e\u0440\u0438\u0433\u0438\u0440\u0430 \u0443\u0447\u0430\u0441\u0442\u043d\u0438\u0446\u0438\u0442\u0435, \u0447\u0430\u0441\u0430, \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u0430, \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0438 \u0431\u0435\u043b\u0435\u0436\u043a\u0438\u0442\u0435 \u043f\u043e \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0430\u0442\u0430.'}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={'\u041a\u0443\u0440\u0441\u0438\u0441\u0442'}
                value={editForm.student}
                onChange={(value) => handleEditFieldChange('student', value)}
                placeholder={'\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u0438\u043c\u0435 \u043d\u0430 \u043a\u0443\u0440\u0441\u0438\u0441\u0442'}
              />
              <Input
                label={'\u0418\u043d\u0441\u0442\u0440\u0443\u043a\u0442\u043e\u0440'}
                value={editForm.instructor}
                onChange={(value) => handleEditFieldChange('instructor', value)}
                placeholder={'\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u0438\u043c\u0435 \u043d\u0430 \u0438\u043d\u0441\u0442\u0440\u0443\u043a\u0442\u043e\u0440'}
              />
              <Input
                label={'\u0410\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b'}
                value={editForm.vehicle}
                onChange={(value) => handleEditFieldChange('vehicle', value)}
                placeholder={'\u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 Toyota Yaris'}
              />
              <Input
                label={'\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f'}
                value={editForm.category}
                onChange={(value) => handleEditFieldChange('category', value)}
                placeholder={'\u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 B'}
              />
              <Input
                label={'\u0414\u0430\u0442\u0430'}
                type="date"
                value={editForm.date}
                onChange={(value) => handleEditFieldChange('date', value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={'\u041d\u0430\u0447\u0430\u043b\u0435\u043d \u0447\u0430\u0441'}
                  type="time"
                  value={editForm.time}
                  onChange={(value) => handleEditFieldChange('time', value)}
                />
                <Input
                  label={'\u041a\u0440\u0430\u0435\u043d \u0447\u0430\u0441'}
                  type="time"
                  value={editForm.endTime}
                  onChange={(value) => handleEditFieldChange('endTime', value)}
                />
              </div>
              <Select
                label={'\u0421\u0442\u0430\u0442\u0443\u0441 \u043d\u0430 \u0447\u0430\u0441\u0430'}
                value={editForm.status}
                onChange={(value) => handleEditFieldChange('status', value)}
                options={[
                  { value: 'scheduled', label: '\u041f\u043b\u0430\u043d\u0438\u0440\u0430\u043d' },
                  { value: 'in-progress', label: '\u0412 \u0445\u043e\u0434' },
                  { value: 'completed', label: '\u0417\u0430\u0432\u044a\u0440\u0448\u0435\u043d' },
                  { value: 'late', label: '\u0417\u0430\u043a\u044a\u0441\u043d\u044f\u043b' },
                  { value: 'no-show', label: '\u041d\u0435\u044f\u0432\u044f\u0432\u0430\u043d\u0435' },
                  { value: 'canceled', label: '\u041e\u0442\u043c\u0435\u043d\u0435\u043d' },
                ]}
              />
              <Select
                label={'\u0421\u0442\u0430\u0442\u0443\u0441 \u043d\u0430 \u043f\u043b\u0430\u0449\u0430\u043d\u0435'}
                value={editForm.paymentStatus}
                onChange={(value) => handleEditFieldChange('paymentStatus', value)}
                options={[
                  { value: 'paid', label: '\u041f\u043b\u0430\u0442\u0435\u043d\u043e' },
                  { value: 'pending', label: '\u0427\u0430\u043a\u0430 \u043f\u043b\u0430\u0449\u0430\u043d\u0435' },
                  { value: 'overdue', label: '\u041f\u0440\u043e\u0441\u0440\u043e\u0447\u0435\u043d\u043e' },
                  { value: 'not-required', label: '\u041d\u0435 \u0441\u0435 \u0438\u0437\u0438\u0441\u043a\u0432\u0430' },
                ]}
              />
              <Input
                label={'\u041c\u0430\u0440\u0448\u0440\u0443\u0442'}
                value={editForm.route}
                onChange={(value) => handleEditFieldChange('route', value)}
                placeholder={'\u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 \u0426\u0435\u043d\u0442\u044a\u0440 - \u041b\u0435\u0432\u0441\u043a\u0438'}
              />
              <Input
                label={'\u041d\u0430\u0447\u0430\u043b\u043d\u0430 \u0442\u043e\u0447\u043a\u0430'}
                value={editForm.startLocation}
                onChange={(value) => handleEditFieldChange('startLocation', value)}
                placeholder={'\u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 \u0410\u0432\u0442\u043e\u043f\u043e\u043b\u0438\u0433\u043e\u043d'}
              />
              <Input
                label={'\u041a\u0440\u0430\u0439\u043d\u0430 \u0442\u043e\u0447\u043a\u0430'}
                value={editForm.endLocation}
                onChange={(value) => handleEditFieldChange('endLocation', value)}
                placeholder={'\u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 \u041a\u0410\u0422 \u0412\u0430\u0440\u043d\u0430'}
              />
            </div>

            <Textarea
              label={'\u0411\u0435\u043b\u0435\u0436\u043a\u0438'}
              value={editForm.notes}
              onChange={(value) => handleEditFieldChange('notes', value)}
              placeholder={'\u0414\u043e\u0431\u0430\u0432\u0435\u0442\u0435 \u0432\u0430\u0436\u043d\u0438 \u0434\u0435\u0442\u0430\u0439\u043b\u0438 \u0437\u0430 \u0447\u0430\u0441\u0430, \u043f\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u043a\u0443\u0440\u0441\u0438\u0441\u0442\u0430 \u0438\u043b\u0438 \u043d\u0443\u0436\u043d\u0438\u0442\u0435 \u043f\u043e\u0441\u043b\u0435\u0434\u0432\u0430\u0449\u0438 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f.'}
              rows={4}
            />

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={handleCloseEditLesson}>
                {'\u041e\u0442\u043a\u0430\u0437'}
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleSaveEditedLesson()}
              >
                {'\u0417\u0430\u043f\u0430\u0437\u0438 \u043f\u0440\u043e\u043c\u0435\u043d\u0438\u0442\u0435'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isStudentFeedbackModalOpen && feedbackLesson && (
        <Modal
          isOpen={isStudentFeedbackModalOpen}
          onClose={() => {
            setIsStudentFeedbackModalOpen(false);
            setStudentFeedbackError(null);
          }}
          title="Обратна връзка за урока"
          maxWidth="lg"
        >
          <div className="p-6 space-y-6">
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-primary)' }}
            >
              <p
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {feedbackLesson.student}
              </p>
              <p
                style={{
                  color: 'var(--text-tertiary)',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                }}
              >
                {formatLessonTimestamp(`${feedbackLesson.date}T${feedbackLesson.time}:00.000Z`)} ·{' '}
                {feedbackLesson.route || 'Практически час'}
              </p>
            </div>

            <div>
              <label
                className="block mb-3"
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                }}
              >
                Твоята оценка
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((ratingValue) => (
                  <button
                    key={ratingValue}
                    type="button"
                    onClick={() => setStudentFeedbackRating(ratingValue)}
                    className="flex-1 rounded-xl py-4 transition-all hover:scale-105"
                    style={{
                      background:
                        studentFeedbackRating >= ratingValue
                          ? 'rgba(34, 197, 94, 0.95)'
                          : 'rgba(255, 255, 255, 0.05)',
                      border:
                        studentFeedbackRating >= ratingValue
                          ? '2px solid rgba(34, 197, 94, 0.95)'
                          : '2px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div
                      className="text-xl font-semibold"
                      style={{
                        color:
                          studentFeedbackRating >= ratingValue
                            ? '#fff'
                            : 'var(--text-tertiary)',
                      }}
                    >
                      {ratingValue}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Коментар от курсиста"
              value={studentFeedbackComment}
              onChange={setStudentFeedbackComment}
              rows={4}
              placeholder="Напиши кое беше полезно, кое те затрудни и какво искаш да упражниш следващия път."
            />

            {studentFeedbackError && (
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.18)',
                  color: '#ef4444',
                  fontSize: '0.9rem',
                }}
              >
                {studentFeedbackError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsStudentFeedbackModalOpen(false);
                  setStudentFeedbackError(null);
                }}
                fullWidth
              >
                Отказ
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleSubmitStudentFeedback()}
                disabled={
                  isSubmittingStudentFeedback ||
                  studentFeedbackRating === 0 ||
                  studentFeedbackComment.trim().length < 2
                }
                fullWidth
              >
                {isSubmittingStudentFeedback
                  ? 'Записване...'
                  : 'Запази обратна връзка'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isParentFeedbackModalOpen && parentFeedbackLesson && (
        <Modal
          isOpen={isParentFeedbackModalOpen}
          onClose={() => {
            setIsParentFeedbackModalOpen(false);
            setParentFeedbackError(null);
          }}
          title="Родителска обратна връзка"
          maxWidth="lg"
        >
          <div className="p-6 space-y-6">
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-primary)' }}
            >
              <p
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {parentFeedbackLesson.student}
              </p>
              <p
                style={{
                  color: 'var(--text-tertiary)',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                }}
              >
                {formatLessonTimestamp(
                  `${parentFeedbackLesson.date}T${parentFeedbackLesson.time}:00.000Z`,
                )}{' '}
                · {parentFeedbackLesson.route || 'Практически час'}
              </p>
            </div>

            <div>
              <label
                className="block mb-3"
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                }}
              >
                Оценка от родител
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((ratingValue) => (
                  <button
                    key={ratingValue}
                    type="button"
                    onClick={() => setParentFeedbackRating(ratingValue)}
                    className="flex-1 rounded-xl py-4 transition-all hover:scale-105"
                    style={{
                      background:
                        parentFeedbackRating >= ratingValue
                          ? 'var(--accent-primary)'
                          : 'rgba(255, 255, 255, 0.05)',
                      border:
                        parentFeedbackRating >= ratingValue
                          ? '2px solid var(--accent-primary)'
                          : '2px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div
                      className="text-xl font-semibold"
                      style={{
                        color:
                          parentFeedbackRating >= ratingValue
                            ? '#fff'
                            : 'var(--text-tertiary)',
                      }}
                    >
                      {ratingValue}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Коментар към инструктора и школата"
              value={parentFeedbackComment}
              onChange={setParentFeedbackComment}
              rows={4}
              placeholder="Напишете кратка обратна връзка за напредъка, комуникацията и следващите нужни упражнения."
            />

            {parentFeedbackError && (
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.18)',
                  color: '#ef4444',
                  fontSize: '0.9rem',
                }}
              >
                {parentFeedbackError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsParentFeedbackModalOpen(false);
                  setParentFeedbackError(null);
                }}
                fullWidth
              >
                Отказ
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleSubmitParentFeedback()}
                disabled={
                  isSubmittingParentFeedback ||
                  parentFeedbackRating === 0 ||
                  parentFeedbackComment.trim().length < 2
                }
                fullWidth
              >
                {isSubmittingParentFeedback
                  ? 'Записване...'
                  : 'Запази родителски коментар'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Evaluation Modal */}
      {isEvaluationModalOpen && evaluationLesson && (
        <Modal
          isOpen={isEvaluationModalOpen}
          onClose={() => setIsEvaluationModalOpen(false)}
          title="Бърза оценка на часа"
          maxWidth="lg"
        >
          <div className="p-6 space-y-6">
            {/* Lesson Info */}
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-primary)' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <User size={18} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500 }}>
                  {evaluationLesson.student}
                </span>
              </div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                {new Date(evaluationLesson.date).toLocaleDateString('bg-BG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })} • {evaluationLesson.time} - {evaluationLesson.endTime} • {evaluationLesson.route || 'Практическо обучение'}
              </p>
            </div>

            {/* Rating Selection */}
            <div>
              <label
                className="block mb-3"
                style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 500 }}
              >
                Оценка на изпълнението
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setQuickRating(rating)}
                    className="flex-1 rounded-xl py-4 transition-all hover:scale-105"
                    style={{
                      background: quickRating >= rating
                        ? 'var(--accent-primary)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: quickRating >= rating
                        ? '2px solid var(--accent-primary)'
                        : '2px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div
                      className="text-2xl font-semibold mb-1"
                      style={{
                        color: quickRating >= rating ? '#fff' : 'var(--text-tertiary)',
                      }}
                    >
                      {rating}
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        color: quickRating >= rating
                          ? 'rgba(255, 255, 255, 0.8)'
                          : 'var(--text-tertiary)',
                      }}
                    >
                      {rating === 1 && 'Слабо'}
                      {rating === 2 && 'Средно'}
                      {rating === 3 && 'Добре'}
                      {rating === 4 && 'Много добре'}
                      {rating === 5 && 'Отлично'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label
                className="block mb-2"
                style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 500 }}
              >
                Коментар (опционално)
              </label>
              <textarea
                value={quickComment}
                onChange={(e) => setQuickComment(e.target.value)}
                placeholder="Добавете бележки за урока, силни страни, области за подобрение..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg outline-none resize-none"
                style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>

            {/* Follow-up Needed */}
            <label
              className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:bg-white/[0.02]"
              style={{
                background: needsFollowUp ? 'rgba(251, 146, 60, 0.1)' : 'var(--bg-primary)',
                border: needsFollowUp
                  ? '1px solid rgba(251, 146, 60, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <input
                type="checkbox"
                checked={needsFollowUp}
                onChange={(e) => setNeedsFollowUp(e.target.checked)}
                className="w-5 h-5 rounded"
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <div>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                  Нужно е последващо действие
                </p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: '2px' }}>
                  Маркирайте ако часът изисква допълнително внимание или планиране
                </p>
              </div>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setIsEvaluationModalOpen(false)}
                fullWidth
              >
                Отказ
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleSubmitEvaluation()}
                disabled={quickRating === 0}
                fullWidth
              >
                Запази оценка
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Lesson Modal - Placeholder */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateError(null);
          }}
          title="Нов практически час"
          maxWidth="2xl"
        >
          <div className="space-y-6 p-6">
            <div
              className="rounded-2xl p-4"
              style={{ background: 'var(--bg-primary)' }}
            >
              <p
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                Създай нов практически час към реален курсист от базата
              </p>
              <p
                style={{
                  color: 'var(--text-tertiary)',
                  fontSize: '0.875rem',
                  marginTop: '0.35rem',
                }}
              >
                Записът се създава директно в PostgreSQL и остава след refresh.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                  }}
                >
                  Курсист
                </label>
                <select
                  value={createForm.studentId}
                  onChange={(event) => {
                    const selectedStudent = students.find(
                      (student) => student.id === event.target.value,
                    );

                    setCreateForm((current) => ({
                      ...current,
                      studentId: event.target.value,
                      studentName:
                        selectedStudent?.name ?? current.studentName,
                      instructor:
                        selectedStudent?.instructor || current.instructor,
                      category:
                        selectedStudent?.category || current.category,
                    }));
                  }}
                  className="w-full h-12 rounded-xl px-4 text-sm outline-none"
                  style={{
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} · {student.category}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Инструктор"
                value={createForm.instructor}
                onChange={(value) =>
                  setCreateForm((current) => ({
                    ...current,
                    instructor: value,
                  }))
                }
                placeholder="Име на инструктор"
              />
              <Input
                label="Автомобил"
                value={createForm.vehicle}
                onChange={(value) =>
                  setCreateForm((current) => ({
                    ...current,
                    vehicle: value,
                  }))
                }
                placeholder="Toyota Corolla · CA 1234 AB"
              />
              <Input
                label="Категория"
                value={createForm.category}
                onChange={(value) =>
                  setCreateForm((current) => ({
                    ...current,
                    category: value,
                  }))
                }
                placeholder="B"
              />
              <Input
                label="Дата"
                type="date"
                value={createForm.date}
                onChange={(value) =>
                  setCreateForm((current) => ({
                    ...current,
                    date: value,
                  }))
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Начален час"
                  type="time"
                  value={createForm.time}
                  onChange={(value) =>
                    setCreateForm((current) => ({
                      ...current,
                      time: value,
                    }))
                  }
                />
                <Input
                  label="Краен час"
                  type="time"
                  value={createForm.endTime}
                  onChange={(value) =>
                    setCreateForm((current) => ({
                      ...current,
                      endTime: value,
                    }))
                  }
                />
              </div>
              <Input
                label="Маршрут"
                value={createForm.route}
                onChange={(value) =>
                  setCreateForm((current) => ({
                    ...current,
                    route: value,
                  }))
                }
                placeholder="Градско каране"
              />
              <Input
                label="Начална точка"
                value={createForm.startLocation}
                onChange={(value) =>
                  setCreateForm((current) => ({
                    ...current,
                    startLocation: value,
                  }))
                }
                placeholder="Автошкола Mind on Road"
              />
              <Input
                label="Крайна точка"
                value={createForm.endLocation}
                onChange={(value) =>
                  setCreateForm((current) => ({
                    ...current,
                    endLocation: value,
                  }))
                }
                placeholder="Автошкола Mind on Road"
              />
            </div>

            <Textarea
              label="Бележки"
              value={createForm.notes}
              onChange={(value) =>
                setCreateForm((current) => ({
                  ...current,
                  notes: value,
                }))
              }
              placeholder="Добави вътрешни бележки за урока"
              rows={4}
            />

            {createError ? (
              <p style={{ color: 'var(--status-error)', fontSize: '0.9rem' }}>
                {createError}
              </p>
            ) : null}

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateError(null);
                }}
              >
                Отказ
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleCreatePracticalLesson()}
                disabled={isSavingLesson || !createForm.studentId}
              >
                {isSavingLesson ? 'Създавам...' : 'Създай час'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function exportPracticalLessonsCsv(lessons: PracticalLesson[]) {
  const rows = [
    'date;time;endTime;student;instructor;vehicle;category;status;paymentStatus;evaluationStatus;route;notes',
    ...lessons.map((lesson) =>
      [
        lesson.date,
        lesson.time,
        lesson.endTime,
        lesson.student,
        lesson.instructor,
        lesson.vehicle,
        lesson.category,
        lesson.status,
        lesson.paymentStatus,
        lesson.evaluationStatus,
        lesson.route ?? '',
        lesson.notes ?? '',
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(';'),
    ),
  ];
  const blob = new Blob([`\uFEFF${rows.join('\n')}`], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'practical_lessons_export.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
