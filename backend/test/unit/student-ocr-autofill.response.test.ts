import assert from 'node:assert/strict';
import test from 'node:test';

import { mapOcrDataToStudentAutofillResponse } from '../../src/modules/students/presentation/rest/responses/student-ocr-autofill.response';

test('maps Bulgarian identity card OCR data to student autofill fields', () => {
  const result = mapOcrDataToStudentAutofillResponse({
    тип_документ: 'българска лична карта',
    име: 'Иван',
    презиме: 'Петров',
    фамилия: 'Иванов',
    егр: 'ignored',
    еgn: 'not-used',
    егн: '0542012345',
    постоянен_адрес: 'гр. София, ул. Шипка 1',
    номер_на_документа: '123456789',
    нужен_ръчен_преглед: true,
    увереност: 0.92,
    предупреждения: ['Провери адреса.'],
  });

  assert.equal(result.firstName, 'Иван');
  assert.equal(result.middleName, 'Петров');
  assert.equal(result.lastName, 'Иванов');
  assert.equal(result.nationalId, '0542012345');
  assert.equal(result.birthDate, '2005-02-01');
  assert.equal(result.address, 'гр. София, ул. Шипка 1');
  assert.equal(result.documentNumber, '123456789');
  assert.equal(result.previousLicenseCategory, null);
  assert.equal(result.manualReviewRequired, true);
  assert.deepEqual(result.warnings, ['Провери адреса.']);
});

test('maps driving licence categories to previous license category', () => {
  const result = mapOcrDataToStudentAutofillResponse({
    тип_документ: 'българска шофьорска книжка',
    име: 'Мария',
    фамилия: 'Петрова',
    егн: '7505123456',
    категории: [
      { категория: 'B', дата: '12.04.2020' },
      { категория: 'AM', дата: '12.04.2020' },
    ],
    нужен_ръчен_преглед: false,
  });

  assert.equal(result.documentType, 'българска шофьорска книжка');
  assert.equal(result.previousLicenseCategory, 'B');
  assert.equal(result.birthDate, '1975-05-12');
  assert.equal(result.manualReviewRequired, false);
});
