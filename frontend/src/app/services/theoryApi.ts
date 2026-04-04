import { type StudentOperationalRecord } from '../content/studentOperations';
import { apiClient } from './apiClient';
import { fetchStudentOperations } from './studentsApi';

type BackendTheoryGroup = {
  id: string;
  name: string;
  categoryCode: string;
  scheduleLabel: string;
  instructorName: string;
  daiCode: string;
  startDate: string;
  endDate: string | null;
  totalLectures: number;
  completedLectures: number;
  activeStudents: number;
  studentsWithAbsences: number;
  studentsNeedingRecovery: number;
  averageAttendance: number;
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
  lectures: BackendTheoryLecture[];
};

type BackendTheoryLecture = {
  id: string;
  lectureNumber: number;
  topic: string;
  lectureDate: string;
  startTimeLabel: string;
  endTimeLabel: string;
  durationMinutes: number;
  location: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  presentCount: number;
  absentCount: number;
  attendanceRecords: BackendTheoryAttendanceRecord[];
};

type BackendTheoryAttendanceRecord = {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';
  viberSent: boolean;
  markedAt: string;
  markedBy: string | null;
};

export type TheoryApiGroup = {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate?: string;
  studentCount: number;
  totalLectures: number;
  completedLectures: number;
  activeStudents: number;
  studentsWithAbsences: number;
  studentsNeedingRecovery: number;
  averageAttendance: number;
  status: 'active' | 'completed' | 'upcoming';
  schedule: string;
  lectures: TheoryApiLecture[];
  students: TheoryApiStudent[];
};

export type TheoryApiLecture = {
  id: string;
  number: number;
  title: string;
  date: string;
  time: string;
  endTime: string;
  duration: number;
  instructor: string;
  location: string;
  attendanceCount: number;
  absentCount: number;
  lateCount: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'canceled';
  students: TheoryApiLectureAttendance[];
};

export type TheoryApiLectureAttendance = {
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  notes?: string;
  viberSent: boolean;
  markedAt?: string;
  markedBy?: string;
};

export type TheoryApiStudent = {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  attendanceCount: number;
  absenceCount: number;
  recoveryStatus: 'not-required' | 'required' | 'in-progress' | 'completed';
  messageStatus: 'not-sent' | 'sent' | 'scheduled';
  dueAmount?: number;
  lastAbsenceDate?: string;
};

export async function fetchTheoryGroups() {
  const [response, students] = await Promise.all([
    apiClient.get<{ items: BackendTheoryGroup[] }>('/theory/groups'),
    fetchStudentOperations(),
  ]);

  return response.items.map((group) => mapTheoryGroup(group, students));
}

export async function saveTheoryLectureAttendance(
  theoryGroupId: string,
  theoryLectureId: string,
  attendanceRecords: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'excused' | 'late';
    viberSent: boolean;
  }>,
  csrfToken: string,
) {
  const response = await apiClient.put<BackendTheoryGroup>(
    `/theory/groups/${theoryGroupId}/lectures/${theoryLectureId}/attendance`,
    {
      attendanceRecords: attendanceRecords.map((attendanceRecord) => ({
        studentId: attendanceRecord.studentId,
        status: mapAttendanceStatusToBackend(attendanceRecord.status),
        viberSent: attendanceRecord.viberSent,
      })),
    },
    csrfToken,
  );

  const students = await fetchStudentOperations();

  return mapTheoryGroup(response, students);
}

function mapTheoryGroup(
  group: BackendTheoryGroup,
  students: StudentOperationalRecord[],
): TheoryApiGroup {
  const exactGroupStudents = students.filter(
    (student) =>
      student.groupNumber === group.name ||
      student.groupNumber === group.daiCode,
  );
  const groupStudents =
    exactGroupStudents.length > 0
      ? exactGroupStudents
      : students.filter((student) => student.category === group.categoryCode);

  return {
    id: group.id,
    name: group.name,
    category: group.categoryCode,
    startDate: group.startDate,
    endDate: group.endDate ?? undefined,
    studentCount: groupStudents.length,
    totalLectures: group.totalLectures,
    completedLectures: group.completedLectures,
    activeStudents: group.activeStudents,
    studentsWithAbsences: group.studentsWithAbsences,
    studentsNeedingRecovery: group.studentsNeedingRecovery,
    averageAttendance: group.averageAttendance,
    status: mapGroupStatus(group.status),
    schedule: group.scheduleLabel,
    lectures: group.lectures.map((lecture) =>
      mapTheoryLecture(lecture, group.instructorName),
    ),
    students: groupStudents.map((student) => mapTheoryStudent(student)),
  };
}

function mapTheoryLecture(
  lecture: BackendTheoryLecture,
  instructorName: string,
): TheoryApiLecture {
  return {
    id: lecture.id,
    number: lecture.lectureNumber,
    title: lecture.topic,
    date: lecture.lectureDate,
    time: lecture.startTimeLabel,
    endTime: lecture.endTimeLabel,
    duration: lecture.durationMinutes,
    instructor: instructorName,
    location: lecture.location,
    attendanceCount: lecture.presentCount,
    absentCount: lecture.absentCount,
    lateCount: lecture.attendanceRecords.filter(
      (attendanceRecord) => attendanceRecord.status === 'LATE',
    ).length,
    status: mapLectureStatus(lecture.status),
    students: lecture.attendanceRecords.map((attendanceRecord) => ({
      studentId: attendanceRecord.studentId,
      studentName: '',
      status: mapAttendanceStatusToFrontend(attendanceRecord.status),
      viberSent: attendanceRecord.viberSent,
      markedAt: attendanceRecord.markedAt,
      markedBy: attendanceRecord.markedBy ?? undefined,
    })),
  };
}

function mapTheoryStudent(student: StudentOperationalRecord): TheoryApiStudent {
  return {
    id: String(student.id),
    name: student.name,
    category: student.category,
    phone: student.phone,
    email: student.email,
    attendanceCount: student.completed,
    absenceCount: 0,
    recoveryStatus:
      student.examOutcome === 'failed' ? 'required' : 'not-required',
    messageStatus: student.parentFeedbackEnabled ? 'sent' : 'not-sent',
  };
}

function mapGroupStatus(status: BackendTheoryGroup['status']) {
  if (status === 'COMPLETED') {
    return 'completed';
  }

  if (status === 'UPCOMING') {
    return 'upcoming';
  }

  return 'active';
}

function mapLectureStatus(status: BackendTheoryLecture['status']) {
  if (status === 'IN_PROGRESS') {
    return 'in-progress';
  }

  if (status === 'COMPLETED') {
    return 'completed';
  }

  if (status === 'CANCELED') {
    return 'canceled';
  }

  return 'scheduled';
}

function mapAttendanceStatusToFrontend(
  status: BackendTheoryAttendanceRecord['status'],
) {
  if (status === 'ABSENT') {
    return 'absent';
  }

  if (status === 'EXCUSED') {
    return 'excused';
  }

  if (status === 'LATE') {
    return 'late';
  }

  return 'present';
}

function mapAttendanceStatusToBackend(
  status: 'present' | 'absent' | 'excused' | 'late',
) {
  if (status === 'absent') {
    return 'ABSENT' as const;
  }

  if (status === 'excused') {
    return 'EXCUSED' as const;
  }

  if (status === 'late') {
    return 'LATE' as const;
  }

  return 'PRESENT' as const;
}
