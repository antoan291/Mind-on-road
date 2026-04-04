import type {
  TheoryGroupsRepository
} from '../../domain/repositories/theory-groups.repository';
import { toTheoryGroupResponse } from './theory-groups-query.service';

export class TheoryGroupsCommandService {
  public constructor(
    private readonly theoryGroupsRepository: TheoryGroupsRepository
  ) {}

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
