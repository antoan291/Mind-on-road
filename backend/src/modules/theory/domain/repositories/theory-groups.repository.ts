import type {
  TheoryGroupStatus,
  TheoryLectureAttendanceStatus,
  TheoryLectureStatus
} from '@prisma/client';
import type { QueryReadAccessScope } from '../../../shared/query/read-access-scope';

export interface TheoryLectureAttendanceRecord {
  studentId: string;
  status: TheoryLectureAttendanceStatus;
  viberSent: boolean;
  markedAt: Date;
  markedBy: string | null;
}

export interface TheoryLectureRecord {
  id: string;
  lectureNumber: number;
  topic: string;
  lectureDate: Date;
  startTimeLabel: string;
  endTimeLabel: string;
  durationMinutes: number;
  location: string;
  status: TheoryLectureStatus;
  presentCount: number;
  absentCount: number;
  attendanceRecords: TheoryLectureAttendanceRecord[];
}

export interface TheoryGroupRecord {
  id: string;
  name: string;
  categoryCode: string;
  scheduleLabel: string;
  instructorName: string;
  daiCode: string;
  startDate: Date;
  endDate: Date | null;
  totalLectures: number;
  completedLectures: number;
  activeStudents: number;
  studentsWithAbsences: number;
  studentsNeedingRecovery: number;
  averageAttendance: number;
  status: TheoryGroupStatus;
  lectures: TheoryLectureRecord[];
}

export interface TheoryGroupsRepository {
  listByTenant(params: {
    tenantId: string;
    scope?: QueryReadAccessScope;
  }): Promise<TheoryGroupRecord[]>;
  createForTenant(params: {
    tenantId: string;
    group: {
      name: string;
      categoryCode: string;
      scheduleLabel: string;
      instructorName: string;
      daiCode: string;
      startDate: Date;
      endDate: Date | null;
      totalLectures: number;
      status: TheoryGroupStatus;
    };
  }): Promise<TheoryGroupRecord>;
  saveLectureAttendance(params: {
    tenantId: string;
    theoryGroupId: string;
    theoryLectureId: string;
    attendanceRecords: Array<{
      studentId: string;
      status: TheoryLectureAttendanceStatus;
      viberSent: boolean;
    }>;
    markedBy: string | null;
  }): Promise<TheoryGroupRecord | null>;
}
