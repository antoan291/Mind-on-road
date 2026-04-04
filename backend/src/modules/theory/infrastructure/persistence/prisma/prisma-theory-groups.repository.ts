import type { Prisma, PrismaClient } from '@prisma/client';

import type {
  TheoryGroupRecord,
  TheoryGroupsRepository
} from '../../../domain/repositories/theory-groups.repository';

const theoryGroupSelect = {
  id: true,
  name: true,
  categoryCode: true,
  scheduleLabel: true,
  instructorName: true,
  daiCode: true,
  startDate: true,
  endDate: true,
  totalLectures: true,
  completedLectures: true,
  activeStudents: true,
  studentsWithAbsences: true,
  studentsNeedingRecovery: true,
  averageAttendance: true,
  status: true,
  lectures: {
    orderBy: {
      lectureNumber: 'asc'
    },
    select: {
      id: true,
      lectureNumber: true,
      topic: true,
      lectureDate: true,
      startTimeLabel: true,
      endTimeLabel: true,
      durationMinutes: true,
      location: true,
      status: true,
      presentCount: true,
      absentCount: true,
      attendanceRecords: {
        orderBy: {
          markedAt: 'desc'
        },
        select: {
          studentId: true,
          status: true,
          viberSent: true,
          markedAt: true,
          markedBy: true
        }
      }
    }
  }
} as const satisfies Prisma.TheoryGroupRecordSelect;

type TheoryGroupRow = Prisma.TheoryGroupRecordGetPayload<{
  select: typeof theoryGroupSelect;
}>;

export class PrismaTheoryGroupsRepository implements TheoryGroupsRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listByTenant(params: {
    tenantId: string;
  }): Promise<TheoryGroupRecord[]> {
    const groups = await this.prisma.theoryGroupRecord.findMany({
      where: {
        tenantId: params.tenantId
      },
      orderBy: {
        startDate: 'desc'
      },
      select: theoryGroupSelect
    });

    return groups.map((group) => mapTheoryGroupRow(group));
  }

  public async saveLectureAttendance(params: {
    tenantId: string;
    theoryGroupId: string;
    theoryLectureId: string;
    attendanceRecords: Array<{
      studentId: string;
      status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';
      viberSent: boolean;
    }>;
    markedBy: string | null;
  }): Promise<TheoryGroupRecord | null> {
    const normalizedAttendanceRecords = Array.from(
      new Map(
        params.attendanceRecords.map((attendanceRecord) => [
          attendanceRecord.studentId,
          attendanceRecord
        ])
      ).values()
    );

    const updatedGroup = await this.prisma.$transaction(async (tx) => {
      const lecture = await tx.theoryLectureRecord.findFirst({
        where: {
          id: params.theoryLectureId,
          theoryGroupId: params.theoryGroupId,
          tenantId: params.tenantId
        },
        select: {
          id: true
        }
      });

      if (!lecture) {
        return null;
      }

      if (normalizedAttendanceRecords.length > 0) {
        const validStudentsCount = await tx.student.count({
          where: {
            tenantId: params.tenantId,
            id: {
              in: normalizedAttendanceRecords.map(
                (attendanceRecord) => attendanceRecord.studentId
              )
            }
          }
        });

        if (validStudentsCount !== normalizedAttendanceRecords.length) {
          return null;
        }
      }

      await tx.theoryLectureAttendanceRecord.deleteMany({
        where: {
          tenantId: params.tenantId,
          theoryLectureId: params.theoryLectureId
        }
      });

      if (normalizedAttendanceRecords.length > 0) {
        await tx.theoryLectureAttendanceRecord.createMany({
          data: normalizedAttendanceRecords.map((attendanceRecord) => ({
            tenantId: params.tenantId,
            theoryGroupId: params.theoryGroupId,
            theoryLectureId: params.theoryLectureId,
            studentId: attendanceRecord.studentId,
            status: attendanceRecord.status,
            viberSent: attendanceRecord.viberSent,
            markedBy: params.markedBy
          }))
        });
      }

      const presentCount = normalizedAttendanceRecords.filter(
        (attendanceRecord) =>
          attendanceRecord.status === 'PRESENT' ||
          attendanceRecord.status === 'LATE'
      ).length;
      const absentCount = normalizedAttendanceRecords.filter(
        (attendanceRecord) =>
          attendanceRecord.status === 'ABSENT' ||
          attendanceRecord.status === 'EXCUSED'
      ).length;

      await tx.theoryLectureRecord.updateMany({
        where: {
          id: params.theoryLectureId,
          theoryGroupId: params.theoryGroupId,
          tenantId: params.tenantId
        },
        data: {
          presentCount,
          absentCount,
          status:
            normalizedAttendanceRecords.length > 0
              ? 'COMPLETED'
              : 'SCHEDULED'
        }
      });

      const lectures = await tx.theoryLectureRecord.findMany({
        where: {
          tenantId: params.tenantId,
          theoryGroupId: params.theoryGroupId
        },
        select: {
          status: true,
          presentCount: true,
          absentCount: true,
          attendanceRecords: {
            select: {
              studentId: true,
              status: true
            }
          }
        }
      });

      const completedLectures = lectures.filter(
        (groupLecture) => groupLecture.status === 'COMPLETED'
      ).length;
      const studentsWithAbsences = new Set(
        lectures.flatMap((groupLecture) =>
          groupLecture.attendanceRecords
            .filter(
              (attendanceRecord) =>
                attendanceRecord.status === 'ABSENT' ||
                attendanceRecord.status === 'EXCUSED'
            )
            .map((attendanceRecord) => attendanceRecord.studentId)
        )
      ).size;
      const attendanceSamples = lectures.filter(
        (groupLecture) =>
          groupLecture.presentCount + groupLecture.absentCount > 0
      );
      const averageAttendance =
        attendanceSamples.length > 0
          ? Number(
              (
                attendanceSamples.reduce(
                  (sum, groupLecture) =>
                    sum +
                    (groupLecture.presentCount /
                      Math.max(
                        groupLecture.presentCount + groupLecture.absentCount,
                        1
                      )) *
                      100,
                  0
                ) / attendanceSamples.length
              ).toFixed(2)
            )
          : 0;

      await tx.theoryGroupRecord.updateMany({
        where: {
          id: params.theoryGroupId,
          tenantId: params.tenantId
        },
        data: {
          completedLectures,
          studentsWithAbsences,
          studentsNeedingRecovery: studentsWithAbsences,
          averageAttendance
        }
      });

      return tx.theoryGroupRecord.findFirst({
        where: {
          id: params.theoryGroupId,
          tenantId: params.tenantId
        },
        select: theoryGroupSelect
      });
    });

    return updatedGroup ? mapTheoryGroupRow(updatedGroup) : null;
  }
}

function mapTheoryGroupRow(group: TheoryGroupRow): TheoryGroupRecord {
  return {
    id: group.id,
    name: group.name,
    categoryCode: group.categoryCode,
    scheduleLabel: group.scheduleLabel,
    instructorName: group.instructorName,
    daiCode: group.daiCode,
    startDate: group.startDate,
    endDate: group.endDate,
    totalLectures: group.totalLectures,
    completedLectures: group.completedLectures,
    activeStudents: group.activeStudents,
    studentsWithAbsences: group.studentsWithAbsences,
    studentsNeedingRecovery: group.studentsNeedingRecovery,
    averageAttendance: group.averageAttendance,
    status: group.status,
    lectures: group.lectures.map((lecture) => ({
      id: lecture.id,
      lectureNumber: lecture.lectureNumber,
      topic: lecture.topic,
      lectureDate: lecture.lectureDate,
      startTimeLabel: lecture.startTimeLabel,
      endTimeLabel: lecture.endTimeLabel,
      durationMinutes: lecture.durationMinutes,
      location: lecture.location,
      status: lecture.status,
      presentCount: lecture.presentCount,
      absentCount: lecture.absentCount,
      attendanceRecords: lecture.attendanceRecords.map(
        (attendanceRecord) => ({
          studentId: attendanceRecord.studentId,
          status: attendanceRecord.status,
          viberSent: attendanceRecord.viberSent,
          markedAt: attendanceRecord.markedAt,
          markedBy: attendanceRecord.markedBy
        })
      )
    }))
  };
}
