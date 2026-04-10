import assert from 'node:assert/strict';
import test from 'node:test';

import { buildParentAccountSeedData } from '../../src/modules/identity/domain/services/seed-account-builders';

test('builds parent account seed data from populated parent fields', () => {
  const result = buildParentAccountSeedData({
    parentName: 'Мария Тест',
    parentEmail: 'parent.antoan.test@example.com',
    parentPhone: '0886612504'
  });

  assert.deepEqual(result, {
    firstName: 'Мария',
    lastName: 'Тест',
    displayName: 'Мария Тест',
    email: 'parent.antoan.test@example.com',
    phone: '0886612504'
  });
});

test('returns null when parent registration data is incomplete', () => {
  const result = buildParentAccountSeedData({
    parentName: 'Мария Тест',
    parentEmail: null,
    parentPhone: '0886612504'
  });

  assert.equal(result, null);
});
