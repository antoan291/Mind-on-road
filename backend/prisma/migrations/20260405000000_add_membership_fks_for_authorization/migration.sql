-- Add userMembershipId to students (links student portal user to student record)
ALTER TABLE "students" ADD COLUMN "userMembershipId" UUID;
ALTER TABLE "students" ADD CONSTRAINT "students_userMembershipId_fkey"
  FOREIGN KEY ("userMembershipId") REFERENCES "tenant_memberships"("id") ON DELETE SET NULL;
CREATE INDEX "students_userMembershipId_idx" ON "students"("userMembershipId");

-- Add parentMembershipId to students (links parent portal user to student record)
ALTER TABLE "students" ADD COLUMN "parentMembershipId" UUID;
ALTER TABLE "students" ADD CONSTRAINT "students_parentMembershipId_fkey"
  FOREIGN KEY ("parentMembershipId") REFERENCES "tenant_memberships"("id") ON DELETE SET NULL;
CREATE INDEX "students_parentMembershipId_idx" ON "students"("parentMembershipId");

-- Add instructorMembershipId to student_enrollments (links instructor user to enrollment)
ALTER TABLE "student_enrollments" ADD COLUMN "instructorMembershipId" UUID;
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_instructorMembershipId_fkey"
  FOREIGN KEY ("instructorMembershipId") REFERENCES "tenant_memberships"("id") ON DELETE SET NULL;
CREATE INDEX "student_enrollments_instructorMembershipId_idx" ON "student_enrollments"("tenantId", "instructorMembershipId");
