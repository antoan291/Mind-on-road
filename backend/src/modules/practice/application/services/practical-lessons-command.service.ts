import type {
  PracticalLessonCreateInput,
  PracticalLessonUpdateInput,
  PracticalLessonsRepository
} from '../../domain/repositories/practical-lessons.repository';
import { toPracticalLessonResponse } from './practical-lessons-query.service';

export class PracticalLessonsCommandService {
  public constructor(
    private readonly practicalLessonsRepository: PracticalLessonsRepository
  ) {}

  public async createLesson(params: {
    tenantId: string;
    lesson: PracticalLessonCreateInput;
  }) {
    const createdLesson = await this.practicalLessonsRepository.createForTenant({
      tenantId: params.tenantId,
      lesson: params.lesson
    });

    if (!createdLesson) {
      return null;
    }

    return toPracticalLessonResponse(createdLesson);
  }

  public async updateLesson(params: {
    tenantId: string;
    lessonId: string;
    lesson: PracticalLessonUpdateInput;
  }) {
    const updatedLesson =
      await this.practicalLessonsRepository.updateByTenantAndId({
        tenantId: params.tenantId,
        lessonId: params.lessonId,
        lesson: params.lesson
      });

    if (!updatedLesson) {
      return null;
    }

    return toPracticalLessonResponse(updatedLesson);
  }

  public async deleteLesson(params: { tenantId: string; lessonId: string }) {
    return this.practicalLessonsRepository.deleteByTenantAndId(params);
  }
}
