export class PracticalLessonStudentScheduleConflictError extends Error {
  constructor() {
    super(
      'Курсистът вече има записан практичен час в този часови интервал.',
    );
    this.name = 'PracticalLessonStudentScheduleConflictError';
  }
}

export class PracticalLessonInstructorScheduleConflictError extends Error {
  constructor() {
    super(
      'Инструкторът вече има записан практичен час в този часови интервал.',
    );
    this.name = 'PracticalLessonInstructorScheduleConflictError';
  }
}

export class PracticalLessonVehicleScheduleConflictError extends Error {
  constructor() {
    super(
      'Автомобилът вече има записан практичен час в този часови интервал.',
    );
    this.name = 'PracticalLessonVehicleScheduleConflictError';
  }
}
