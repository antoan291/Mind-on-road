import type { QueryReadAccessScope } from '../../../shared/query/read-access-scope';
import type {
  DeterminatorSessionCreateInput,
  DeterminatorSessionRecord,
  StudentsRepository
} from '../../domain/repositories/students.repository';

export class StudentsDeterminatorService {
  public constructor(private readonly studentsRepository: StudentsRepository) {}

  public async listSessions(params: {
    tenantId: string;
    studentId?: string;
    scope?: QueryReadAccessScope;
  }) {
    const sessions =
      await this.studentsRepository.listDeterminatorSessionsByTenant(params);

    return sessions.map((session) => toDeterminatorSessionResponse(session));
  }

  public async createSession(command: {
    tenantId: string;
    session: DeterminatorSessionCreateInput;
  }) {
    const session = await this.studentsRepository.createDeterminatorSession({
      tenantId: command.tenantId,
      session: command.session
    });

    if (!session) {
      return null;
    }

    return toDeterminatorSessionResponse(session);
  }
}

function toDeterminatorSessionResponse(session: DeterminatorSessionRecord) {
  return {
    id: session.id,
    studentId: session.studentId,
    studentName: session.studentName,
    registrationNumber: session.registrationNumber,
    measuredAt: session.measuredAt.toISOString(),
    autoTempoCorrectReactions: session.autoTempoCorrectReactions,
    autoTempoWrongReactions: session.autoTempoWrongReactions,
    autoTempoSuccessCoefficient: Number(
      session.autoTempoSuccessCoefficient.toFixed(3)
    ),
    forcedTempoCorrectReactions: session.forcedTempoCorrectReactions,
    forcedTempoDelayedReactions: session.forcedTempoDelayedReactions,
    forcedTempoWrongResults: session.forcedTempoWrongResults,
    forcedTempoMissedStimuli: session.forcedTempoMissedStimuli,
    forcedTempoSuccessCoefficient: Number(
      session.forcedTempoSuccessCoefficient.toFixed(3)
    ),
    overallResult: session.overallResult,
    instructorNote: session.instructorNote
  };
}
