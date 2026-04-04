import mockDbJson from './mock-db.json';

export type MockDb = typeof mockDbJson;

const testStudent = {
  id: 1,
  name: 'Антоан Тест',
  phone: '0886612503',
  email: 'antoan.test@example.com',
  nationalId: '9904041234',
  category: 'B',
  groupNumber: 'AT-001',
  instructor: 'Георги Петров',
  trainingStartDate: '04.04.2026',
  theoryCompletedAt: '',
  theoryExamAt: '',
  practicalCompletedAt: '',
  practicalExamAt: '',
  extraHours: 0,
  recordMode: 'electronic',
  insuranceStatus: 'active',
  educationLevel: 'Средно',
  courseOutcome: 'active',
  completed: 2,
  total: 20,
  progress: 10,
  paid: 20,
  used: 2,
  remaining: 18,
  nextLesson: 'Утре 10:00',
  startDate: '04.04.2026',
  status: 'info',
  statusLabel: 'Активен',
  theoryCompleted: false,
  paymentStatus: 'paid',
};

export const mockDb = mockDbJson;
export const mockStudents = [testStudent];
export const mockPayments = [
  {
    ...mockDb.payments[0],
    id: 1,
    student: testStudent.name,
    studentId: testStudent.id,
    category: testStudent.category,
    instructor: testStudent.instructor,
    paymentNumber: 'PAY-TEST-0001',
    invoiceNumber: 'INV-TEST-0001',
  },
];
export const mockInvoices = [
  {
    ...mockDb.invoices[0],
    id: 1,
    invoiceNumber: 'INV-TEST-0001',
    student: testStudent.name,
    studentId: testStudent.id,
    recipientName: testStudent.name,
    items: [{ ...(mockDb.invoices[0]?.items?.[0] ?? {}), category: testStudent.category }],
  },
];
export const mockDocuments = [
  {
    ...mockDb.documents[0],
    id: 1,
    owner: testStudent.name,
    ownerId: testStudent.id,
  },
];
export const mockInvoiceFormStudents = [
  { id: testStudent.id, name: testStudent.name, category: testStudent.category },
];
export const mockInvoicePackages = mockDb.invoiceForm.packages;
