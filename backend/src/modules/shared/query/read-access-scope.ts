export type QueryReadAccessScope =
  | {
      mode: 'tenant';
    }
  | {
      mode: 'instructor';
      studentIds: string[];
      instructorName: string;
    }
  | {
      mode: 'student';
      studentIds: string[];
    }
  | {
      mode: 'parent';
      studentIds: string[];
    };
