import mockDbJson from './mock-db.json';

export type MockDb = typeof mockDbJson;

export const mockDb = mockDbJson;
export const mockStudents = mockDb.students;
export const mockPayments = mockDb.payments;
export const mockInvoices = mockDb.invoices;
export const mockDocuments = mockDb.documents;
export const mockInvoiceFormStudents = mockDb.invoiceForm.students;
export const mockInvoicePackages = mockDb.invoiceForm.packages;
