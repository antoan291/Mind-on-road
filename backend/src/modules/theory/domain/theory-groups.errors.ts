export class TheoryGroupDuplicateDaiCodeError extends Error {
  public constructor() {
    super('Theory group with this DAI code already exists in the tenant.');
    this.name = 'TheoryGroupDuplicateDaiCodeError';
  }
}
