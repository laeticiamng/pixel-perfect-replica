import { assertEquals } from 'https://deno.land/std@0.190.0/testing/asserts.ts';
import { normalizeCheckoutPlan } from './plan.ts';

Deno.test('normalizeCheckoutPlan maps easyplus to nearvityplus', () => {
  assertEquals(normalizeCheckoutPlan('easyplus'), 'nearvityplus');
});

Deno.test('normalizeCheckoutPlan keeps nearvityplus unchanged', () => {
  assertEquals(normalizeCheckoutPlan('nearvityplus'), 'nearvityplus');
});

Deno.test('normalizeCheckoutPlan defaults to nearvityplus', () => {
  assertEquals(normalizeCheckoutPlan(undefined), 'nearvityplus');
});
