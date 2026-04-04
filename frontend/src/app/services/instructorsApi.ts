import {
  getInstructorStudents,
  type StudentOperationalRecord,
} from '../content/studentOperations';
import type {
  InstructorRow,
  InstructorStudentRow,
} from '../pages/secondary/secondaryData';
import { fetchStudentOperations } from './studentsApi';

export async function fetchInstructorRows() {
  const students = await fetchStudentOperations();

  return buildInstructorRows(students);
}

export async function fetchInstructorDetailRows(instructorId: number) {
  const students = await fetchStudentOperations();
  const instructorRows = buildInstructorRows(students);
  const instructor =
    instructorRows.find((item) => item.id === instructorId) ?? null;

  if (!instructor) {
    return {
      instructor: null,
      students: [] as InstructorStudentRow[],
    };
  }

  return {
    instructor,
    students: buildInstructorStudentRows(instructor, students),
  };
}

export function buildInstructorRows(
  students: StudentOperationalRecord[],
): InstructorRow[] {
  const instructorMap = new Map<string, InstructorRow>();

  students.forEach((student) => {
    const instructorName = student.instructor?.trim();

    if (!instructorName) {
      return;
    }

    const existing = instructorMap.get(instructorName);
    const paymentAlerts = student.paymentStatus === 'paid' ? 0 : 1;

    if (!existing) {
      instructorMap.set(instructorName, {
        id: instructorMap.size + 1,
        name: instructorName,
        role: `Инструктор · Категория ${student.category}`,
        students: 1,
        vehicle: 'Няма зададен автомобил',
        nextLesson: student.nextLesson,
        theoryGroup: student.groupNumber || 'Няма активна група',
        paymentAlerts,
        documentStatus: 'success',
        workload: `${Math.min(100, Math.max(10, student.progress))}% запълване`,
      });
      return;
    }

    instructorMap.set(instructorName, {
      ...existing,
      students: existing.students + 1,
      paymentAlerts: existing.paymentAlerts + paymentAlerts,
      workload: `${Math.min(
        100,
        Math.round(
          ((existing.students * Number(existing.workload.replace('% запълване', ''))) +
            student.progress) /
            (existing.students + 1),
        ),
      )}% запълване`,
    });
  });

  return Array.from(instructorMap.values());
}

export function buildInstructorStudentRows(
  instructor: InstructorRow,
  students: StudentOperationalRecord[],
): InstructorStudentRow[] {
  const rows = getInstructorStudents(instructor.name, students).map((item) => ({
    ...item,
    instructorId: instructor.id,
    instructorName: instructor.name,
  }));

  return rows;
}
