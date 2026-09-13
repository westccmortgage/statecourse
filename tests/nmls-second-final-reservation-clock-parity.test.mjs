import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSecondFinalDeliveryFixture } from './helpers/nmls-second-final-delivery-fixture.mjs';
import { validateNmlsSecondFinalReservationHistory } from '../lib/nmls-second-final-reservation.mjs';

// Actual pure038 check with synthetic row envelopes. Only recorded_at is
// varied to model032/038 SQL's bounded +/-1000ms receipt clock tolerance.
// SQL durability and actual wall-clock skew are tested separately, not here.
test('latest038 recorded timestamp may be within1000ms either side of actual evaluated receipt', async () => {
  const f = await makeSecondFinalDeliveryFixture(), at = f.input.latestChildEvent.audit.review.atMs;
  for (const offset of [-1000, -500, 0, 500, 1000]) {
    const input = structuredClone(f.input);
    input.latestChildEvent.recorded_at = new Date(at + offset).toISOString();
    const history = validateNmlsSecondFinalReservationHistory(input);
    assert.ok(history.notBeforeMs >= at, 'negative recorded skew never lowers current actor/receipt clock');
    assert.ok(history.notBeforeMs >= at + offset, 'positive recorded skew remains a new-evaluation floor');
  }
});

test('latest038 recording outside either tolerance boundary or invalid date is held', async () => {
  const f = await makeSecondFinalDeliveryFixture(), at = f.input.latestChildEvent.audit.review.atMs;
  for (const recorded of [new Date(at - 1001).toISOString(), new Date(at + 1001).toISOString(), 'invalid']) {
    const input = structuredClone(f.input); input.latestChildEvent.recorded_at = recorded;
    assert.throws(() => validateNmlsSecondFinalReservationHistory(input), /child_event/);
  }
});
