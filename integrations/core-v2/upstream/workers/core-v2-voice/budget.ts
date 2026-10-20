export type VoiceBudgetPolicy = {
  currency: 'USD';
  authorizedMaximumUsd: number;
  maximumPerTurnUsd: number;
  maximumProviderCallsPerTurn: number;
  maximumProviderCallsPerCall: number;
  maximumTurnsPerCall: number;
  maximumInputTokensPerTurn: number;
  maximumOutputTokensPerTurn: number;
  maximumInputTokensPerCall: number;
  maximumOutputTokensPerCall: number;
  maximumReasoningTokensPerCall: number;
  wallClockDeadlineMs: number;
};

export type VoiceReservation = {
  reservationId: string;
  sessionId: string;
  requestId: string;
  maximumUsd: number;
  state: 'reserved' | 'settled' | 'released' | 'outcome_unknown';
  settledUsd: number | null;
};

export type VoicePricingSnapshot = {
  providerId: string;
  model: string;
  currency: string;
  effectiveFrom: string;
  inputPerMillionTokens: number;
  outputPerMillionTokens: number;
  cachedInputPerMillionTokens: number | null;
  cacheWritePerMillionTokens: number;
  reasoningPerMillionTokens: number | null;
  maximumInputTokens: number;
  maximumOutputTokens: number;
  maximumReasoningTokens: number;
  ceilingRule: string;
};

export type VoiceUsageAudit = {
  raw: Record<string, unknown>;
  normalized: Record<string, unknown>;
};

export class VoiceBudgetRefusal extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'VoiceBudgetRefusal';
    this.code = code;
  }
}

export interface VoiceBudget {
  readonly policy: VoiceBudgetPolicy;
  reserve(sessionId: string, requestId: string, claimToken: string, maximumUsd: number, pricing: VoicePricingSnapshot,
    phase?: 'propose' | 'finalize'): Promise<VoiceReservation>;
  settle(reservationId: string, settledUsd: number, usage: VoiceUsageAudit): Promise<void>;
  release(reservationId: string, reason: string): Promise<void>;
  preserveUnknown(reservationId: string): Promise<void>;
}

export const ZERO_SPEND_POLICY: VoiceBudgetPolicy = Object.freeze({
  currency: 'USD',
  authorizedMaximumUsd: 0,
  maximumPerTurnUsd: 0,
  maximumProviderCallsPerTurn: 2,
  maximumProviderCallsPerCall: 120,
  maximumTurnsPerCall: 60,
  maximumInputTokensPerTurn: 8_000,
  maximumOutputTokensPerTurn: 400,
  maximumInputTokensPerCall: 480_000,
  maximumOutputTokensPerCall: 24_000,
  maximumReasoningTokensPerCall: 24_000,
  wallClockDeadlineMs: 20 * 60_000,
});

/* Local proof ledger. It is deliberately zero-dollar by default. Production
 * needs an atomic database reservation/settlement door before activation. */
export class InMemoryVoiceBudget implements VoiceBudget {
  readonly policy: VoiceBudgetPolicy;
  readonly reservations = new Map<string, VoiceReservation>();
  private readonly pricingByReservation = new Map<string, VoicePricingSnapshot>();
  private readonly byCall = new Map<string, string>();
  private sequence = 0;
  constructor(policy: VoiceBudgetPolicy = ZERO_SPEND_POLICY) { this.policy = policy; }

  async reserve(sessionId: string, requestId: string, _claimToken: string, maximumUsd: number, pricing: VoicePricingSnapshot,
    phase: 'propose' | 'finalize' = 'propose'): Promise<VoiceReservation> {
    if (!Number.isFinite(maximumUsd) || maximumUsd < 0) {
      throw new VoiceBudgetRefusal('invalid_reservation', 'maximum cost must be a non-negative finite number');
    }
    const callKey = `${sessionId}\0${requestId}\0${phase}`;
    const priorId = this.byCall.get(callKey);
    if (priorId) {
      const prior = this.reservations.get(priorId)!;
      if (prior.maximumUsd !== maximumUsd) {
        throw new VoiceBudgetRefusal('idempotency_conflict', 'provider phase was reserved with another ceiling');
      }
      return { ...prior };
    }
    const callPrefix = `${sessionId}\0${requestId}\0`;
    const callsForTurn = [...this.byCall.keys()].filter((key) => key.startsWith(callPrefix)).length;
    const heldForTurn = [...this.byCall.entries()]
      .filter(([key]) => key.startsWith(callPrefix))
      .map(([, id]) => this.reservations.get(id)!)
      .reduce((total, reservation) => total + (reservation.state === 'settled'
        ? reservation.settledUsd ?? reservation.maximumUsd
        : reservation.state === 'released' ? 0 : reservation.maximumUsd), 0);
    const sessionReservations = [...this.reservations.values()]
      .filter((reservation) => reservation.sessionId === sessionId && reservation.state !== 'released');
    const reservedInputTokens = sessionReservations.reduce((sum, reservation) =>
      sum + this.pricingByReservation.get(reservation.reservationId)!.maximumInputTokens, 0);
    const reservedOutputTokens = sessionReservations.reduce((sum, reservation) =>
      sum + this.pricingByReservation.get(reservation.reservationId)!.maximumOutputTokens, 0);
    const reservedReasoningTokens = sessionReservations.reduce((sum, reservation) =>
      sum + this.pricingByReservation.get(reservation.reservationId)!.maximumReasoningTokens, 0);
    if (callsForTurn >= this.policy.maximumProviderCallsPerTurn
      || sessionReservations.length >= this.policy.maximumProviderCallsPerCall
      || pricing.maximumInputTokens > this.policy.maximumInputTokensPerTurn
      || pricing.maximumOutputTokens > this.policy.maximumOutputTokensPerTurn
      || reservedInputTokens + pricing.maximumInputTokens > this.policy.maximumInputTokensPerCall
      || reservedOutputTokens + pricing.maximumOutputTokens > this.policy.maximumOutputTokensPerCall
      || reservedReasoningTokens + pricing.maximumReasoningTokens > this.policy.maximumReasoningTokensPerCall
      || heldForTurn + maximumUsd > this.policy.maximumPerTurnUsd || maximumUsd > this.remaining()) {
      throw new VoiceBudgetRefusal('budget_not_authorized', 'server-owned voice budget does not authorize this provider call');
    }
    const reservation: VoiceReservation = {
      reservationId: `voice-reservation-${++this.sequence}`,
      sessionId,
      requestId,
      maximumUsd,
      state: 'reserved',
      settledUsd: null,
    };
    this.reservations.set(reservation.reservationId, reservation);
    this.pricingByReservation.set(reservation.reservationId, { ...pricing });
    this.byCall.set(callKey, reservation.reservationId);
    return { ...reservation };
  }

  async settle(id: string, settledUsd: number, _usage: VoiceUsageAudit): Promise<void> {
    const reservation = this.mustHold(id);
    if (!Number.isFinite(settledUsd) || settledUsd < 0 || settledUsd > reservation.maximumUsd) {
      throw new VoiceBudgetRefusal('settlement_exceeds_reservation', 'settled cost is outside the reserved ceiling');
    }
    reservation.state = 'settled';
    reservation.settledUsd = settledUsd;
  }

  async release(id: string, _reason: string): Promise<void> {
    const reservation = this.mustHold(id);
    reservation.state = 'released';
    reservation.settledUsd = 0;
  }

  async preserveUnknown(id: string): Promise<void> {
    const reservation = this.mustHold(id);
    reservation.state = 'outcome_unknown';
  }

  private remaining(): number {
    let unavailable = 0;
    for (const reservation of this.reservations.values()) {
      if (reservation.state === 'reserved' || reservation.state === 'outcome_unknown') unavailable += reservation.maximumUsd;
      if (reservation.state === 'settled') unavailable += reservation.settledUsd ?? reservation.maximumUsd;
    }
    return Math.max(0, this.policy.authorizedMaximumUsd - unavailable);
  }

  private mustHold(id: string): VoiceReservation {
    const reservation = this.reservations.get(id);
    if (!reservation || reservation.state !== 'reserved') {
      throw new VoiceBudgetRefusal('reservation_not_open', 'voice reservation is not open');
    }
    return reservation;
  }
}
