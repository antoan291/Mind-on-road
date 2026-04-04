import { z } from 'zod';

export const theoryAttendanceSaveParamsSchema = z.object({
  theoryGroupId: z.string().uuid(),
  theoryLectureId: z.string().uuid()
});

export const theoryAttendanceSaveRequestSchema = z.object({
  attendanceRecords: z
    .array(
      z.object({
        studentId: z.string().uuid(),
        status: z.enum(['PRESENT', 'ABSENT', 'EXCUSED', 'LATE']),
        viberSent: z.boolean()
      })
    )
    .max(500)
});
