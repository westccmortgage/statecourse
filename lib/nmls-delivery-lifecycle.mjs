// LOCAL ADAPTER HELPER ONLY: no DOM, HTTP, authority, attendance or credit.
// Call beginRequest immediately before sending. The trusted server adapter must
// supply relativeBudgetMs derived from SERVER time; never derive it from the
// browser wall clock or accept a browser-selected extension. Charging the whole
// request roundtrip against that budget deliberately shortens the usable lease.
// Callbacks are synchronous and non-reentrant. stopMedia must pause AND remove
// media; clearMaterial must remove every instructional/quiz/feedback surface.
// A real page must wire visibility/network events and suppress cached/late HTML.
// Timers cannot enforce removal while browser execution is suspended: the next
// controller operation rechecks expiry, but actual page/browser integration and
// validation remain required. This helper does not prove a person stopped study.
// A clock that pauses during OS sleep also requires explicit suspend/resume
// invalidation by that adapter; changing to browser wall-clock time is not a fix.
const MAX_LEASE_MS = 30_000;
const kinds = new Set(['study', 'control', 'recover_observation']);
const finiteTime = value => Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;

export function createNmlsDeliveryLifecycle({ now, setTimer, clearTimer,
  stopMedia, clearMaterial, renderMaterial, maxLeaseMs = MAX_LEASE_MS } = {}) {
  if ([now, setTimer, clearTimer, stopMedia, clearMaterial, renderMaterial].some(fn => typeof fn !== 'function') ||
      !Number.isSafeInteger(maxLeaseMs) || maxLeaseMs < 1 || maxLeaseMs > MAX_LEASE_MS) {
    throw new Error('invalid_nmls_delivery_dependencies');
  }
  let generation = 0, latest = null, lease = null, timer = null, timerSerial = 0;
  let lastNow = -1, visible = true, connected = true, disposed = false, faulted = false, callbackDepth = 0;
  const rejected = code => ({ accepted: false, code });
  const entry = () => { if (callbackDepth) throw new Error('nmls_delivery_callback_reentry'); };
  const sync = (fn, ...args) => {
    callbackDepth++;
    try {
      const value = fn(...args);
      if (value && typeof value.then === 'function') throw new Error('nmls_delivery_callback_must_be_synchronous');
      return value;
    } finally { callbackDepth--; }
  };
  function clock() {
    const value = sync(now);
    if (!finiteTime(value) || value < lastNow) throw new Error('invalid_nmls_delivery_monotonic_clock');
    lastNow = value; return value;
  }
  function clear(reason) {
    lease = null; timerSerial++;
    const oldTimer = timer; timer = null; let failed = false;
    if (oldTimer !== null) { try { sync(clearTimer, oldTimer); } catch { failed = true; } }
    // Even a failed media callback cannot skip the independent clear callback.
    for (const fn of [stopMedia, clearMaterial]) {
      try { sync(fn, reason); } catch { failed = true; }
    }
    if (failed) faulted = true;
    return !failed;
  }
  function stop(reason) {
    generation++; latest = null; clear(reason);
  }
  function fault() { faulted = true; stop('lifecycle_fault'); }
  function expire(at) {
    if (lease && at >= lease.deadlineMs) stop('lease_expired');
  }
  function arm(currentLease, delay) {
    const serial = ++timerSerial;
    let arming = true;
    const handle = sync(setTimer, () => {
      if (arming) { fault(); return; } // The injected scheduler must be asynchronous.
      if (lease !== currentLease || serial !== timerSerial || disposed || faulted) return;
      timer = null;
      try {
        const at = clock();
        if (at >= currentLease.deadlineMs) stop('lease_expired');
        else arm(currentLease, currentLease.deadlineMs - at);
      } catch { fault(); }
    }, delay);
    arming = false;
    if (handle === null || handle === undefined || faulted) {
      if (handle !== null && handle !== undefined) sync(clearTimer, handle);
      throw new Error('invalid_nmls_delivery_timer');
    }
    timer = handle;
  }
  function beginRequest({ kind = 'study' } = {}) {
    entry();
    if (disposed || faulted) throw new Error('nmls_delivery_unavailable');
    let at;
    try { at = clock(); expire(at); } catch { fault(); throw new Error('nmls_delivery_clock_failed'); }
    if (!kinds.has(kind)) { stop('invalid_request'); throw new Error('invalid_nmls_delivery_kind'); }
    // Every control removes old material BEFORE a token can reach transport:
    // a lost break/logout response must not leave the preceding lesson visible.
    // Ordinary study requests invalidate old responses, not the old timer.
    if (kind !== 'study') stop(kind === 'recover_observation' ? 'recovery_started' : 'control_started');
    if (!visible || !connected || faulted) throw new Error('nmls_delivery_unavailable');
    generation++;
    latest = Object.freeze({ generation, kind, sentAtMs: at });
    return latest; // Object identity matters: copying/forging this token is invalid.
  }
  function acceptResponse(token, response) {
    entry();
    if (disposed || faulted) return rejected('lifecycle_unavailable');
    let at;
    try { at = clock(); expire(at); } catch { fault(); return rejected('lifecycle_fault'); }
    if (!visible || !connected || token !== latest || !token || token.generation !== generation) return rejected('stale_response');
    latest = null; // Exactly one response may consume a generation.
    if (token.kind !== 'study') { stop('control_response'); return rejected('control_response_no_delivery'); }
    if (!response || typeof response !== 'object' || Array.isArray(response) ||
        ['duplicate', 'replayed'].some(key => response[key] !== undefined && typeof response[key] !== 'boolean')) {
      stop('invalid_response'); return rejected('invalid_response');
    }
    if (response.duplicate === true || response.replayed === true) {
      stop('replayed_response'); return rejected('replayed_response');
    }
    if (response.deliveryAllowed !== true) { stop('delivery_denied'); return rejected('delivery_denied'); }
    const budget = response.relativeBudgetMs;
    if (!Number.isSafeInteger(budget) || budget < 1 || budget > maxLeaseMs ||
        !Object.hasOwn(response, 'material') || response.material == null) {
      stop('invalid_delivery_budget'); return rejected('invalid_delivery_budget');
    }
    const deadlineMs = token.sentAtMs + budget;
    if (!finiteTime(deadlineMs)) { stop('invalid_delivery_budget'); return rejected('invalid_delivery_budget'); }
    if (deadlineMs <= at) { stop('response_expired'); return rejected('response_expired'); }
    if (!clear('material_replaced')) return rejected('lifecycle_fault');
    try {
      // Cleanup itself may take time. Never schedule a full remaining budget
      // measured before those callbacks, which would extend the actual timer.
      const renderAt = clock();
      if (renderAt >= deadlineMs) { stop('response_expired'); return rejected('response_expired'); }
      lease = { deadlineMs }; arm(lease, deadlineMs - renderAt);
      sync(renderMaterial, response.material);
      const afterRender = clock(); expire(afterRender);
      if (!lease || faulted) return rejected(faulted ? 'lifecycle_fault' : 'response_expired');
      return { accepted: true, code: 'material_rendered', remainingMs: deadlineMs - afterRender };
    } catch { fault(); return rejected('lifecycle_fault'); }
  }
  function recover({ send } = {}) {
    entry();
    const token = beginRequest({ kind: 'recover_observation' });
    if (typeof send !== 'function') { stop('invalid_recovery_transport'); throw new Error('invalid_nmls_recovery_transport'); }
    try {
      const result = send(token);
      // The caller still owns transport and explicitly accepts any response.
      // A late failed recovery cannot interrupt a newer request/material lease.
      return { token, result: result && typeof result.then === 'function' ? Promise.resolve(result).catch(error => {
        if (latest === token) { connected = false; stop('recovery_transport_failed'); }
        throw error;
      }) : result };
    } catch (error) {
      if (latest === token) { connected = false; stop('recovery_transport_failed'); }
      throw error;
    }
  }
  function availability(field, value) {
    entry();
    if (disposed || faulted) return;
    if (field === 'visible') visible = value; else connected = value;
    if (!value) stop(field === 'visible' ? 'hidden' : 'disconnected');
    else {
      try { expire(clock()); } catch { fault(); }
    }
  }
  return Object.freeze({ beginRequest, acceptResponse, recover,
    hide: () => availability('visible', false), show: () => availability('visible', true),
    disconnect: () => availability('connected', false), connect: () => availability('connected', true),
    dispose() { entry(); if (!disposed) { disposed = true; stop('disposed'); } },
    snapshot() {
      entry();
      if (!disposed && !faulted) { try { expire(clock()); } catch { fault(); } }
      return { generation, visible, connected, disposed, faulted, materialVisible: lease !== null,
        deadlineMs: lease?.deadlineMs ?? null, pending: latest !== null };
    },
  });
}
