import type {
  TheoryGroupRecord,
  TheoryGroupsRepository,
  TheoryLectureRecord
} from '../../domain/repositories/theory-groups.repository';

export class TheoryGroupsQueryService {
  public constructor(
    private readonly theoryGroupsRepository: TheoryGroupsRepository
  ) {}

  public async listGroups(params: { tenantId: string }) {
    const groups = await this.theoryGroupsRepository.listByTenant({
      tenantId: params.tenantId
    });

    return groups.map((group) => toTheoryGroupResponse(group));
  }
}

export function toTheoryGroupResponse(group: TheoryGroupRecord) {
  return {
    id: group.id,
    name: group.name,
    categoryCode: group.categoryCode,
    scheduleLabel: group.scheduleLabel,
    instructorName: group.instructorName,
    daiCode: group.daiCode,
    startDate: group.startDate.toISOString().slice(0, 10),
    endDate: group.endDate ? group.endDate.toISOString().slice(0, 10) : null,
    totalLectures: group.totalLectures,
    completedLectures: group.completedLectures,
    activeStudents: group.activeStudents,
    studentsWithAbsences: group.studentsWithAbsences,
    studentsNeedingRecovery: group.studentsNeedingRecovery,
    averageAttendance: group.averageAttendance,
    status: group.status,
    lectures: group.lectures.map((lecture) => toTheoryLectureResponse(lecture))
  };
}

function toTheoryLectureResponse(lecture: TheoryLectureRecord) {
  return {
    id: lecture.id,
    lectureNumber: lecture.lectureNumber,
    topic: lecture.topic,
    lectureDate: lecture.lectureDate.toISOString().slice(0, 10),
    startTimeLabel: lecture.startTimeLabel,
    endTimeLabel: lecture.endTimeLabel,
    durationMinutes: lecture.durationMinutes,
    location: lecture.location,
    status: lecture.status,
    presentCount: lecture.presentCount,
    absentCount: lecture.absentCount,
    attendanceRecords: lecture.attendanceRecords.map((attendance) => ({
      studentId: attendance.studentId,
      status: attendance.status,
      viberSent: attendance.viberSent,
      markedAt: attendance.markedAt.toISOString(),
      markedBy: attendance.markedBy
    }))
  };
}
