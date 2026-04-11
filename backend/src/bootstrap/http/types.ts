import express = require("express");
import type { SessionService } from "../../modules/identity/application/services/login.service";

export interface AuthenticatedRequest extends express.Request {
  auth?: Awaited<ReturnType<SessionService["authenticate"]>>;
}

export type ReadAccessScope =
  | {
      mode: "tenant";
      cacheScope: string;
      studentIds: Set<string>;
      instructorName: string | null;
    }
  | {
      mode: "instructor";
      cacheScope: string;
      studentIds: Set<string>;
      instructorName: string;
    }
  | {
      mode: "student";
      cacheScope: string;
      studentIds: Set<string>;
      instructorName: string | null;
    }
  | {
      mode: "parent";
      cacheScope: string;
      studentIds: Set<string>;
      instructorName: string | null;
    };
