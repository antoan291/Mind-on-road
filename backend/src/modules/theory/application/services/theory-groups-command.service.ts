import type {
  TheoryGroupsRepository
} from '../../domain/repositories/theory-groups.repository';
import { toTheoryGroupResponse } from './theory-groups-query.service';

export class TheoryGroupsCommandService {
  public constructor(
    private readonly theoryGroupsRepository: TheoryGroupsRepository
  ) {}

  public async createGroup(params: {
    tenantId: string;
    group: {
      name: string;
      categoryCode: string;
      scheduleLabel: string;
      instructorName: string;
      daiCode: string;
      startDate: string;
      endDate: string | null;
      totalLectures: number;
    };
  }) {
    const status = resolveTheoryGroupStatus(
      params.group.startDate,
      params.group.endDate
    );

    const group = await this.theoryGroupsRepository.createForTenant({
      tenantId: params.tenantId,
      group: {
        ...params.group,
        startDate: new Date(`${params.group.startDate}T00:00:00.000Z`),
        endDate: params.group.endDate
          ? new Date(`${params.group.endDate}T00:00:00.000Z`)
          : null,
        status
      }
    });

    return toTheoryGroupResponse(group);
  }

  public async saveLectureAttendance(params: {
    tenantId: string;
    theoryGroupId: string;
    theoryLectureId: string;
    attendanceRecords: Parameters<
      TheoryGroupsRepository['saveLectureAttendance']
    >[0]['attendanceRecords'];
    markedBy: string | null;
  }) {
    const group = await this.theoryGroupsRepository.saveLectureAttendance(
      params
    );

    return group ? toTheoryGroupResponse(group) : null;
  }
}

function resolveTheoryGroupStatus(
  startDate: string,
  endDate: string | null
): 'ACTIVE' | 'COMPLETED' | 'UPCOMING' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = endDate ? new Date(`${endDate}T00:00:00.000Z`) : null;

  if (end && end.getTime() < today.getTime()) {
    return 'COMPLETED';
  }

  if (start.getTime() > today.getTime()) {
    return 'UPCOMING';
  }

  return 'ACTIVE';
}
