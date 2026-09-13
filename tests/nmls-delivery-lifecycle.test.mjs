import test from 'node:test';
import assert from 'node:assert/strict';
import { createNmlsDeliveryLifecycle } from '../lib/nmls-delivery-lifecycle.mjs';

// Synthetic monotonic clocks/callbacks only: not browser or attendance evidence.
function harness(overrides = {}) {
  let at = 100, sequence = 0, rendered = null;
  const timers = new Map(), history = new Map(), events = [];
  const controller = createNmlsDeliveryLifecycle({ now: () => at,
    setTimer(callback, delay) {
      const id = ++sequence; const timer = { callback, deadline: at + delay };
      timers.set(id, timer); history.set(id, timer); return id;
    },
    clearTimer: id => { timers.delete(id); },
    stopMedia: reason => { events.push(['stopMedia', reason]); },
    clearMaterial: reason => { rendered = null; events.push(['clearMaterial', reason]); },
    renderMaterial: material => { rendered = material; events.push(['renderMaterial', material]); },
    ...overrides,
  });
  return { controller, timers, history, events, get rendered() { return rendered; },
    setTime(value) { at = value; },
    advance(value, runTimers = true) {
      at += value;
      if (runTimers) for (const [id, timer] of [...timers]) if (timer.deadline <= at) {
        timers.delete(id); timer.callback();
      }
    },
  };
}
const permitted = (material = 'lesson', relativeBudgetMs = 30_000) => ({ deliveryAllowed: true, relativeBudgetMs, material });
function deliver(h, material = 'lesson', budget = 30_000) {
  return h.controller.acceptResponse(h.controller.beginRequest(), permitted(material, budget));
}

test('request-send monotonic time owns the lease; response latency cannot extend it', () => {
  const h = harness(), token = h.controller.beginRequest();
  assert.equal(token.sentAtMs, 100); assert.ok(Object.isFrozen(token));
  h.advance(10_000);
  assert.deepEqual(h.controller.acceptResponse(token, permitted()), { accepted: true, code: 'material_rendered', remainingMs: 20_000 });
  assert.equal(h.controller.snapshot().deadlineMs, 30_100);
  h.advance(20_000);
  assert.equal(h.rendered, null); assert.equal(h.controller.snapshot().materialVisible, false);
  assert.deepEqual(h.events.slice(-2), [['stopMedia', 'lease_expired'], ['clearMaterial', 'lease_expired']]);
});

test('new requests reject delayed/reordered and copied tokens without disturbing current material', () => {
  const h = harness(), old = h.controller.beginRequest(), newest = h.controller.beginRequest();
  assert.equal(h.controller.acceptResponse(old, permitted('old')).code, 'stale_response');
  assert.equal(h.controller.acceptResponse({ ...newest }, permitted('forged')).code, 'stale_response');
  assert.equal(h.controller.acceptResponse(newest, permitted('new')).accepted, true);
  assert.equal(h.controller.acceptResponse(old, permitted('old')).accepted, false);
  assert.equal(h.controller.acceptResponse(newest, permitted('duplicate')).accepted, false);
  assert.equal(h.rendered, 'new');
});

test('old deadline invalidates pending renewal; a fresh explicit request can acquire new material', () => {
  const h = harness(); deliver(h, 'old', 1000); h.advance(500);
  const pending = h.controller.beginRequest(); h.advance(500);
  assert.equal(h.controller.acceptResponse(pending, permitted('late renewal')).code, 'stale_response');
  assert.equal(h.rendered, null);
  assert.equal(deliver(h, 'fresh').accepted, true); assert.equal(h.rendered, 'fresh');
});

test('throttled timers cannot let a response or snapshot revive expired material', () => {
  const h = harness(); deliver(h, 'old', 1000); h.advance(500);
  const pending = h.controller.beginRequest(); h.advance(500, false);
  assert.equal(h.controller.acceptResponse(pending, permitted('late')).code, 'stale_response');
  assert.equal(h.rendered, null);
  deliver(h, 'fresh', 1000); h.advance(1000, false);
  assert.equal(h.controller.snapshot().materialVisible, false); assert.equal(h.rendered, null);
});

test('canceled and early timer callbacks cannot clear a replacement or extend its deadline', () => {
  const h = harness(); deliver(h, 'old', 1000);
  const obsolete = [...h.history.values()][0].callback;
  h.advance(100); deliver(h, 'new', 2000);
  obsolete(); assert.equal(h.rendered, 'new');
  const early = [...h.timers.values()][0].callback; early();
  assert.equal(h.controller.snapshot().deadlineMs, 2200);
  h.advance(2000); assert.equal(h.rendered, null);
});

test('hide/disconnect clear material and invalidate in-flight responses; restoration alone renders nothing', () => {
  for (const [stop, restore] of [['hide', 'show'], ['disconnect', 'connect']]) {
    const h = harness(); deliver(h); const pending = h.controller.beginRequest();
    h.controller[stop](); assert.equal(h.rendered, null);
    assert.throws(() => h.controller.beginRequest(), /unavailable/);
    h.controller[restore](); assert.equal(h.rendered, null);
    assert.equal(h.controller.acceptResponse(pending, permitted('old')).accepted, false);
    assert.equal(deliver(h, 'fresh').accepted, true);
  }
});

test('recovery stops/removes media and clears material before transport; no recovery response may deliver', () => {
  const h = harness(); deliver(h); const pending = h.controller.beginRequest();
  h.events.length = 0;
  const { token, result } = h.controller.recover({ send(sent) {
    assert.equal(h.rendered, null);
    assert.deepEqual(h.events.map(event => event[0]), ['stopMedia', 'clearMaterial']);
    assert.equal(h.controller.acceptResponse(pending, permitted('late')).accepted, false);
    h.events.push(['send', sent.kind]); return 'transport-result';
  } });
  assert.equal(result, 'transport-result'); assert.equal(token.kind, 'recover_observation');
  assert.equal(h.controller.acceptResponse(token, permitted('forbidden')).code, 'control_response_no_delivery');
  assert.equal(h.rendered, null);
  const bypass = h.controller.beginRequest({ kind: 'recover_observation' });
  assert.equal(h.controller.acceptResponse(bypass, permitted()).accepted, false);
});

test('control, denied, replayed and duplicate server outcomes clear rather than deliver', () => {
  for (const response of [{ deliveryAllowed: false }, { ...permitted(), duplicate: true }, { ...permitted(), replayed: true }]) {
    const h = harness(); deliver(h);
    assert.equal(h.controller.acceptResponse(h.controller.beginRequest(), response).accepted, false);
    assert.equal(h.rendered, null);
  }
  const h = harness(); deliver(h);
  assert.equal(h.controller.acceptResponse(h.controller.beginRequest({ kind: 'control' }), permitted()).accepted, false);
  assert.equal(h.rendered, null);
});

test('control clears media and material before send even if its response is lost', () => {
  const h = harness(); deliver(h, 'old'); const pending = h.controller.beginRequest();
  h.events.length = 0;
  const control = h.controller.beginRequest({ kind: 'control' });
  // The transport can only receive its token after these synchronous callbacks.
  assert.equal(control.kind, 'control'); assert.equal(h.rendered, null);
  assert.deepEqual(h.events, [['stopMedia', 'control_started'], ['clearMaterial', 'control_started']]);
  assert.equal(h.timers.size, 0);
  assert.equal(h.controller.acceptResponse(pending, permitted('late study response')).code, 'stale_response');
  h.advance(30_000);
  assert.equal(h.rendered, null);
  assert.equal(h.controller.acceptResponse(control, permitted('forbidden control material')).accepted, false);
  assert.equal(h.rendered, null);
});

test('invalid, impossible and elapsed budgets fail closed', () => {
  for (const budget of [0, -1, 30_001, Infinity, NaN, '30000', 1.5, undefined, 30_000n, Symbol('budget')]) {
    const h = harness(); deliver(h);
    assert.equal(h.controller.acceptResponse(h.controller.beginRequest(), { ...permitted(), relativeBudgetMs: budget }).code, 'invalid_delivery_budget');
    assert.equal(h.rendered, null);
  }
  const h = harness(), token = h.controller.beginRequest(); h.advance(30_000);
  assert.equal(h.controller.acceptResponse(token, permitted()).code, 'response_expired');
  assert.equal(h.rendered, null);
  assert.throws(() => harness({ maxLeaseMs: 30_001 }), /dependencies/);
  const capped = harness({ maxLeaseMs: 1000 });
  assert.equal(deliver(capped, 'too long', 1001).code, 'invalid_delivery_budget');
  const overflow = harness(); overflow.setTime(Number.MAX_SAFE_INTEGER - 10);
  assert.equal(deliver(overflow).code, 'invalid_delivery_budget');
});

test('caller timestamps cannot replace the internally captured monotonic send time', () => {
  const h = harness(), token = h.controller.beginRequest({ sentAtMs: 999999 });
  assert.equal(token.sentAtMs, 100);
  assert.equal(h.controller.acceptResponse(token, permitted()).accepted, true);
  assert.equal(h.controller.snapshot().deadlineMs, 30_100);
});

test('render failure clears partial output and latches the controller closed', () => {
  let partial = null; const actions = [];
  const h = harness({ renderMaterial(value) { partial = value; throw new Error('render failed'); },
    stopMedia(reason) { actions.push(['stop', reason]); }, clearMaterial(reason) { partial = null; actions.push(['clear', reason]); } });
  assert.equal(deliver(h).code, 'lifecycle_fault'); assert.equal(partial, null);
  assert.equal(h.controller.snapshot().faulted, true); assert.equal(h.timers.size, 0);
  assert.throws(() => h.controller.beginRequest(), /unavailable/);
  assert.deepEqual(actions.slice(-2), [['stop', 'lifecycle_fault'], ['clear', 'lifecycle_fault']]);
});

test('slow cleanup consumes the lease instead of postponing the expiry timer', () => {
  let surface = null, first = true;
  const h = harness({ clearMaterial() {
    surface = null;
    if (first) { first = false; h.advance(10_000, false); }
  }, renderMaterial(material) { surface = material; } });
  assert.equal(deliver(h).remainingMs, 20_000);
  assert.equal([...h.timers.values()][0].deadline, 30_100);
  h.advance(20_000); assert.equal(surface, null);
});

test('cleanup or rendering that exhausts the lease cannot leave material visible', () => {
  for (const phase of ['cleanup', 'render']) {
    let surface = null, first = true;
    const h = harness({ clearMaterial() {
      surface = null;
      if (phase === 'cleanup' && first) { first = false; h.advance(30_000, false); }
    }, renderMaterial(material) {
      surface = material;
      if (phase === 'render') h.advance(30_000, false);
    } });
    assert.equal(deliver(h).code, 'response_expired');
    assert.equal(surface, null); assert.equal(h.timers.size, 0);
  }
});

test('failed clearing prevents recovery send; all cleanup callbacks are still attempted', () => {
  let cleared = 0, sent = 0;
  const h = harness({ stopMedia() { throw new Error('media failed'); }, clearMaterial() { cleared++; } });
  assert.throws(() => h.controller.recover({ send() { sent++; } }), /unavailable/);
  assert.equal(cleared, 1); assert.equal(sent, 0); assert.equal(h.controller.snapshot().faulted, true);
});

test('backward monotonic time and timer setup failure fail closed', () => {
  const h = harness(); deliver(h); h.setTime(99);
  assert.equal(h.controller.snapshot().faulted, true); assert.equal(h.rendered, null);
  const failed = harness({ setTimer() { throw new Error('timer unavailable'); } });
  assert.equal(deliver(failed).code, 'lifecycle_fault'); assert.equal(failed.rendered, null);
});

test('timer disarm failure cannot skip clearing or permit replacement', () => {
  const h = harness({ clearTimer() { throw new Error('timer disarm failed'); } });
  deliver(h, 'old'); const stale = [...h.history.values()][0].callback;
  assert.equal(deliver(h, 'replacement').code, 'lifecycle_fault');
  assert.equal(h.rendered, null); stale(); assert.equal(h.rendered, null);
  assert.equal(h.controller.snapshot().faulted, true);
});

test('synchronous scheduler and asynchronous render callbacks are rejected', () => {
  const scheduler = harness({ setTimer(callback) { callback(); return 1; } });
  assert.equal(deliver(scheduler).code, 'lifecycle_fault'); assert.equal(scheduler.rendered, null);
  const render = harness({ renderMaterial() { return Promise.resolve(); } });
  assert.equal(deliver(render).code, 'lifecycle_fault'); assert.equal(render.controller.snapshot().faulted, true);
});

test('recovery transport failure stays clear; stale failed transports do not kill a newer lease', async () => {
  const h = harness(); deliver(h);
  assert.throws(() => h.controller.recover({ send() { throw new Error('offline'); } }), /offline/);
  assert.equal(h.rendered, null); assert.equal(h.controller.snapshot().connected, false);
  h.controller.connect();
  let reject; const request = h.controller.recover({ send: () => new Promise((_, no) => { reject = no; }) });
  deliver(h, 'new'); reject(new Error('old transport failure'));
  await assert.rejects(request.result, /old transport failure/);
  assert.equal(h.rendered, 'new');
});

test('dispose is terminal and stale timer/response callbacks cannot restore material', () => {
  const h = harness(); deliver(h); const callback = [...h.history.values()][0].callback;
  const pending = h.controller.beginRequest(); h.controller.dispose(); h.controller.dispose();
  callback(); h.controller.show(); h.controller.connect();
  assert.equal(h.controller.acceptResponse(pending, permitted()).accepted, false);
  assert.equal(h.rendered, null); assert.equal(h.controller.snapshot().disposed, true);
  assert.throws(() => h.controller.beginRequest(), /unavailable/);
});
