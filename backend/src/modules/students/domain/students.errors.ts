export class StudentAlreadyExistsError extends Error {
  public constructor() {
    super('Student with this national id already exists in the tenant.');
    this.name = 'StudentAlreadyExistsError';
  }
}
