import type { ProviderConfiguration, RuntimeConfig } from '../core-v2-runtime/runtime-config.ts';
import { configurationProblems, costCeiling, paidCallRefusals } from '../core-v2-runtime/runtime-config.ts';
import { priceUsage } from '../core-v2-runtime/budget/usage.ts';
import { normalizeUsage } from '../core-v2-runtime/providers/usage-dialects.ts';
import type { HttpRequest, HttpResponse, HttpTransport } from '../core-v2-runtime/transport/transport.ts';
import { failedBeforeSubmission, NetworkNotAuthorized, SealedTransport } from '../core-v2-runtime/transport/transport.ts';
import { validateDraftShape, type DialogueState, type ToolReceipt, type VoiceTurnDraft, type VoiceTurnInput } from './contracts.ts';
import type { VoicePricingSnapshot } from './budget.ts';

export type VoiceProviderContext = {
  input: VoiceTurnInput;
  state: DialogueState;
  receipts: ToolReceipt[];
  phase: 'propose' | 'finalize';
};

export type VoiceProviderOutcome =
  | { outcome: 'completed'; draft: VoiceTurnDraft; usage: Record<string, unknown>; normalizedUsage: Record<string, unknown>; settledUsd: number }
  | { outcome: 'failed_known'; code: string; detail: string }
  | { outcome: 'outcome_unknown'; code: string; detail: string };

export interface VoiceProvider {
  readonly maximumCostUsd: number;
  readonly pricingSnapshot: VoicePricingSnapshot;
  generate(context: VoiceProviderContext, signal: AbortSignal): Promise<VoiceProviderOutcome>;
}

export type VoiceWireAdapter = {
  providerId: string;
  build(configuration: ProviderConfiguration, model: string, apiKey: string,
    context: VoiceProviderContext, signal: AbortSignal): HttpRequest;
  parse(response: HttpResponse): { draft: unknown; usage: Record<string, unknown> };
};

/* Reuses the existing operator configuration, four authorization gates,
 * priced ceiling and injected safe transport. It does not reuse
 * ProviderExecutor because that executor correctly forces the batch result
 * envelope and discards history. */
export class ConfiguredVoiceProvider implements VoiceProvider {
  readonly maximumCostUsd: number;
  readonly pricingSnapshot: VoicePricingSnapshot;
  private readonly model: string;
  private readonly options: {
    configuration: ProviderConfiguration;
    runtime: RuntimeConfig;
    adapter: VoiceWireAdapter;
    transport?: HttpTransport;
    environment?: Record<string, string | undefined> | ((name: string) => string | undefined);
  };

  constructor(options: {
    configuration: ProviderConfiguration;
    runtime: RuntimeConfig;
    adapter: VoiceWireAdapter;
    transport?: HttpTransport;
    environment?: Record<string, string | undefined> | ((name: string) => string | undefined);
  }) {
    this.options = options;
    if (options.adapter.providerId !== options.configuration.providerId) {
      throw new Error('voice provider adapter does not match configured provider');
    }
    this.model = options.configuration.defaultModel;
    const ceiling = costCeiling(
      options.runtime,
      options.configuration.providerId,
      this.model,
      options.configuration.maximumInputTokens,
      options.configuration.maximumOutputTokens,
      new Date(),
    );
    this.maximumCostUsd = ceiling?.maximumCost ?? Number.POSITIVE_INFINITY;
    const basis = ceiling?.basis;
    this.pricingSnapshot = {
      providerId: options.configuration.providerId,
      model: this.model,
      currency: basis?.currency ?? '',
      effectiveFrom: basis?.effectiveFrom ?? '',
      inputPerMillionTokens: basis?.inputPerMillionTokens ?? Number.NaN,
      outputPerMillionTokens: basis?.outputPerMillionTokens ?? Number.NaN,
      cachedInputPerMillionTokens: basis?.cachedInputPerMillionTokens ?? null,
      cacheWritePerMillionTokens: basis?.cacheWritePerMillionTokens ?? Number.NaN,
      reasoningPerMillionTokens: basis?.reasoningPerMillionTokens ?? null,
      maximumInputTokens: options.configuration.maximumInputTokens,
      maximumOutputTokens: options.configuration.maximumOutputTokens,
      maximumReasoningTokens: options.configuration.capabilities[this.model]?.thinking === 'none'
        ? 0 : options.configuration.maximumOutputTokens,
      ceilingRule: ceiling?.rule ?? '',
    };
  }

  async generate(context: VoiceProviderContext, signal: AbortSignal): Promise<VoiceProviderOutcome> {
    const { configuration, runtime, adapter } = this.options;
    const problems = configurationProblems(runtime).filter((problem) => problem.includes(configuration.providerId));
    problems.push(...paidCallRefusals(runtime, configuration.providerId, this.model));
    if (problems.length) return { outcome: 'failed_known', code: 'provider_not_authorized', detail: problems.join('; ') };
    if (signal.aborted) return { outcome: 'failed_known', code: 'cancelled_before_submission', detail: 'turn deadline passed before submission' };

    const source = this.options.environment;
    const key = typeof source === 'function'
      ? source(configuration.apiKeyEnvironmentVariable)
      : (source ?? process.env)[configuration.apiKeyEnvironmentVariable];
    if (!key) return { outcome: 'failed_known', code: 'provider_key_absent', detail: 'configured credential is absent' };
    const transport = this.options.transport ?? new SealedTransport();
    let request: HttpRequest;
    try {
      request = adapter.build(configuration, this.model, key, context, signal);
    } catch (error) {
      return { outcome: 'failed_known', code: 'request_not_built', detail: String((error as Error).message ?? error) };
    }
    try {
      const response = await transport.send(request);
      if (response.status >= 500) return { outcome: 'outcome_unknown', code: 'provider_server_error', detail: `provider returned ${response.status}` };
      if (response.status < 200 || response.status >= 300) {
        return { outcome: 'failed_known', code: 'provider_rejected', detail: `provider returned ${response.status}` };
      }
      const parsed = adapter.parse(response);
      const normalized = normalizeUsage(configuration.providerId, parsed.usage);
      const priced = priceUsage({
        currency: this.pricingSnapshot.currency,
        inputPerMillionTokens: this.pricingSnapshot.inputPerMillionTokens,
        outputPerMillionTokens: this.pricingSnapshot.outputPerMillionTokens,
        cachedInputPerMillionTokens: this.pricingSnapshot.cachedInputPerMillionTokens,
        cacheWritePerMillionTokens: this.pricingSnapshot.cacheWritePerMillionTokens,
        reasoningPerMillionTokens: this.pricingSnapshot.reasoningPerMillionTokens,
      }, normalized);
      if (!priced.ok) {
        return { outcome: 'outcome_unknown', code: 'usage_not_priceable', detail: priced.problems.join('; ') };
      }
      return { outcome: 'completed', draft: validateDraftShape(parsed.draft), usage: parsed.usage,
        normalizedUsage: normalized as unknown as Record<string, unknown>, settledUsd: priced.cost };
    } catch (error) {
      if (error instanceof NetworkNotAuthorized || failedBeforeSubmission(error)) {
        return { outcome: 'failed_known', code: 'network_not_authorized', detail: String((error as Error).message ?? error) };
      }
      return { outcome: 'outcome_unknown', code: 'transport_fault', detail: 'request may have reached the provider; it is not retried' };
    }
  }
}

export class FixtureVoiceProvider implements VoiceProvider {
  readonly maximumCostUsd = 0;
  readonly pricingSnapshot: VoicePricingSnapshot = { providerId: 'fixture', model: 'fixture', currency: 'USD', effectiveFrom: '1970-01-01',
    inputPerMillionTokens: 0, outputPerMillionTokens: 0, cachedInputPerMillionTokens: 0, cacheWritePerMillionTokens: 0,
    reasoningPerMillionTokens: 0, maximumInputTokens: 0, maximumOutputTokens: 0,
    maximumReasoningTokens: 0, ceilingRule: 'fixture' };
  readonly calls: VoiceProviderContext[] = [];
  private readonly answers: VoiceTurnDraft[];
  constructor(answers: VoiceTurnDraft[]) { this.answers = answers; }
  async generate(context: VoiceProviderContext, _signal: AbortSignal): Promise<VoiceProviderOutcome> {
    this.calls.push(structuredClone(context));
    const draft = this.answers.shift();
    if (!draft) return { outcome: 'failed_known', code: 'fixture_exhausted', detail: 'fixture has no answer' };
    return { outcome: 'completed', draft: validateDraftShape(draft), usage: {}, normalizedUsage: {}, settledUsd: 0 };
  }
}

export class SealedVoiceProvider implements VoiceProvider {
  readonly maximumCostUsd = 0;
  readonly pricingSnapshot = new FixtureVoiceProvider([]).pricingSnapshot;
  async generate(_context: VoiceProviderContext, _signal: AbortSignal): Promise<VoiceProviderOutcome> {
    return { outcome: 'failed_known', code: 'voice_provider_disabled', detail: 'voice provider is sealed' };
  }
}
