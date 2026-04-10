import type { DocumentRecordView } from './documentsApi';
import { fetchDocumentRecords } from './documentsApi';
import { fetchPersonnelRows, type PersonnelRow } from './personnelApi';
import {
  fetchAssignableInstructorOptions,
  fetchStudentOperations,
  type AssignableInstructorOption,
} from './studentsApi';
import { fetchVehicleRows } from './vehiclesApi';
import type {
  InstructorRow,
  InstructorStudentRow,
  StatusTone,
} from '../pages/secondary/secondaryData';
import type { StudentOperationalRecord } from '../content/studentOperations';
import type { VehicleRow } from '../pages/secondary/secondaryData';

export async function fetchInstructorRows() {
  const [instructors, students, vehicles, documents] = await loadInstructorPageData();

  return buildInstructorRows(instructors, students, vehicles, documents);
}

export async function fetchInstructorDetailRows(instructorId: string) {
  const [instructors, students, vehicles, documents] = await loadInstructorPageData();

  const instructorRows = buildInstructorRows(
    instructors,
    students,
    vehicles,
    documents,
  );
  const instructor =
    instructorRows.find((item) => item.id === instructorId) ?? null;

  if (!instructor) {
    return {
      instructor: null,
      students: [] as InstructorStudentRow[],
      documents: [] as DocumentRecordView[],
    };
  }

  return {
    instructor,
    students: buildInstructorStudentRows(instructor, students),
    documents: documents.filter(
      (document) =>
        document.type === 'instructor' &&
        String(document.ownerId) === String(instructor.id),
    ),
  };
}

export function buildInstructorRows(
  instructors: AssignableInstructorOption[],
  students: StudentOperationalRecord[],
  vehicles: VehicleRow[],
  documents: DocumentRecordView[],
): InstructorRow[] {
  return instructors.map((instructor) => {
    const assignedStudents = students.filter(
      (student) => student.instructor?.trim() === instructor.displayName,
    );
    const instructorVehicles = vehicles.filter(
      (vehicle) => vehicle.instructor === instructor.displayName,
    );
    const instructorDocuments = documents.filter(
      (document) =>
        document.type === 'instructor' &&
        String(document.ownerId) === String(instructor.membershipId),
    );

    return {
      id: instructor.membershipId,
      name: instructor.displayName,
      role: instructor.roleLabels.join(' + '),
      students: assignedStudents.length,
      vehicle:
        instructorVehicles.length > 0
          ? instructorVehicles.map((vehicle) => vehicle.vehicle).join(', ')
          : 'Няма зададен автомобил',
      nextLesson: assignedStudents.find((student) => student.nextLesson)?.nextLesson ?? 'Няма планиран час',
      theoryGroup:
        assignedStudents.find((student) => student.groupNumber)?.groupNumber ??
        'Няма активна група',
      paymentAlerts: assignedStudents.filter(
        (student) => student.paymentStatus !== 'paid',
      ).length,
      documentStatus: resolveInstructorDocumentStatus(instructorDocuments),
      workload: `${Math.min(100, assignedStudents.length * 10)}% запълване`,
    };
  });
}

export function buildInstructorStudentRows(
  instructor: InstructorRow,
  students: StudentOperationalRecord[],
): InstructorStudentRow[] {
  return students
    .filter((student) => student.instructor?.trim() === instructor.name)
    .map((student) => ({
      id: student.id,
      instructorId: instructor.id,
      instructorName: instructor.name,
      studentName: student.name,
      category: student.category,
      currentStage: student.studentTypeLabel,
      completedHours: student.used,
      remainingHours: student.remaining,
      maximumHours: student.maxTrainingHours,
      nextLesson: student.nextLesson,
      status: student.remaining === 0 ? 'success' : 'info',
    }));
}

function resolveInstructorDocumentStatus(
  documents: DocumentRecordView[],
): StatusTone {
  if (documents.some((document) => document.status === 'expired')) {
    return 'error';
  }

  if (
    documents.some(
      (document) =>
        document.status === 'expiring-soon' || document.status === 'missing',
    )
  ) {
    return 'warning';
  }

  return 'success';
}

async function loadInstructorPageData(): Promise<
  [
    AssignableInstructorOption[],
    StudentOperationalRecord[],
    VehicleRow[],
    DocumentRecordView[],
  ]
> {
  const [instructorsResult, studentsResult, vehiclesResult, documentsResult] =
    await Promise.allSettled([
      resolveInstructorOptions(),
      fetchStudentOperations(),
      fetchVehicleRows(),
      fetchDocumentRecords(),
    ]);

  if (instructorsResult.status !== 'fulfilled') {
    throw instructorsResult.reason;
  }

  return [
    instructorsResult.value,
    studentsResult.status === 'fulfilled' ? studentsResult.value : [],
    vehiclesResult.status === 'fulfilled' ? vehiclesResult.value : [],
    documentsResult.status === 'fulfilled' ? documentsResult.value : [],
  ];
}

async function resolveInstructorOptions() {
  try {
    return await fetchAssignableInstructorOptions();
  } catch {
    const personnelRows = await fetchPersonnelRows();
    return mapPersonnelRowsToAssignableInstructorOptions(personnelRows);
  }
}

function mapPersonnelRowsToAssignableInstructorOptions(
  personnelRows: PersonnelRow[],
): AssignableInstructorOption[] {
  return personnelRows
    .filter(
      (item) =>
        item.roleKeys.includes('instructor') ||
        item.roleKeys.includes('simulator_instructor'),
    )
    .map((item) => ({
      membershipId: item.membershipId,
      displayName: item.displayName,
      roleKeys: item.roleKeys,
      roleLabels: item.roleLabels,
      assignedStudentsCount: item.assignedStudentsCount,
    }));
}
