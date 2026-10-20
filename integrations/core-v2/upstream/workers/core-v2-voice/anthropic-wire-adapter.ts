import type { ProviderConfiguration } from '../core-v2-runtime/runtime-config.ts';
import type { HttpRequest, HttpResponse } from '../core-v2-runtime/transport/transport.ts';
import type { VoiceProviderContext, VoiceWireAdapter } from './provider-text-adapter.ts';

const OUTPUT_TOOL = 'core_v2_voice_turn';

const stringArray = { type: 'array', maxItems: 20, items: { type: 'string', maxLength: 256 } };
const nullableString = { anyOf: [{ type: 'string', maxLength: 1200 }, { type: 'null' }] };

// Closed at every object boundary because Anthropic strict tools reject an
// open descendant even when the outer tool says strict.
export const VOICE_DRAFT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['disposition', 'topic', 'speech', 'optionalQuestion', 'factPatches', 'toolRequests', 'claims', 'requestedApplicationTransition'],
  properties: {
    disposition: { type: 'string', enum: ['answer', 'clarify', 'pause', 'resume', 'end', 'human_handoff', 'refuse'] },
    topic: { type: 'string', minLength: 1, maxLength: 128 },
    speech: {
      type: 'array', minItems: 1, maxItems: 8,
      items: {
        type: 'object', additionalProperties: false,
        required: ['kind', 'text', 'claimIds'],
        properties: {
          kind: { type: 'string', enum: ['answer', 'question', 'acknowledgement', 'disclosure', 'refusal'] },
          text: { type: 'string', minLength: 1, maxLength: 1200 },
          claimIds: stringArray,
        },
      },
    },
    optionalQuestion: nullableString,
    factPatches: {
      type: 'array', maxItems: 20,
      items: {
        type: 'object', additionalProperties: false,
        required: ['operation', 'key', 'entity', 'value', 'unit', 'scope', 'sourceTurnId', 'expectedFactRevision', 'supersedesRevision', 'derivedFrom'],
        properties: {
          operation: { type: 'string', enum: ['set', 'supersede'] },
          key: { type: 'string', maxLength: 128 }, entity: { type: 'string', maxLength: 128 },
          value: { anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }] },
          unit: { anyOf: [{ type: 'string', maxLength: 64 }, { type: 'null' }] },
          scope: { type: 'string', enum: ['actual', 'hypothetical'] },
          sourceTurnId: { type: 'string', maxLength: 128 },
          expectedFactRevision: { anyOf: [{ type: 'integer', minimum: 0 }, { type: 'null' }] },
          supersedesRevision: { anyOf: [{ type: 'integer', minimum: 0 }, { type: 'null' }] },
          derivedFrom: stringArray,
        },
      },
    },
    toolRequests: {
      type: 'array', maxItems: 6,
      items: { oneOf: [
        {
          type: 'object', additionalProperties: false,
          required: ['requestId', 'tool', 'input'],
          properties: {
            requestId: { type: 'string', maxLength: 128 },
            tool: { const: 'mortgage.payment' },
            input: {
              type: 'object', additionalProperties: false,
              required: ['principal', 'annualRatePercent', 'termYears'],
              properties: {
                principal: { type: 'number', minimum: 0 },
                annualRatePercent: { type: 'number', minimum: 0 },
                termYears: { type: 'number', minimum: 1 },
              },
            },
          },
        },
        {
          type: 'object', additionalProperties: false,
          required: ['requestId', 'tool', 'input'],
          properties: {
            requestId: { type: 'string', maxLength: 128 },
            tool: { const: 'knowledge.heloc_basics' },
            input: { type: 'object', additionalProperties: false, properties: {} },
          },
        },
      ] },
    },
    claims: {
      type: 'array', maxItems: 20,
      items: {
        type: 'object', additionalProperties: false,
        required: ['claimId', 'risk', 'text', 'value', 'unit', 'receiptIds', 'factKeys', 'approvedSourceIds'],
        properties: {
          claimId: { type: 'string', maxLength: 128 },
          risk: { type: 'string', enum: ['low_risk', 'grounded_education', 'financial_quote', 'eligibility', 'current_information', 'external_action'] },
          text: { type: 'string', maxLength: 1200 },
          value: { anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }, { type: 'null' }] },
          unit: { anyOf: [{ type: 'string', maxLength: 64 }, { type: 'null' }] },
          receiptIds: stringArray, factKeys: stringArray, approvedSourceIds: stringArray,
        },
      },
    },
    requestedApplicationTransition: { type: 'string', enum: ['none', 'offer', 'continue', 'stop'] },
  },
} as const;

function parseObject(text: string): Record<string, unknown> {
  const value = JSON.parse(text);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('provider response is not an object');
  return value as Record<string, unknown>;
}

export class AnthropicVoiceWireAdapter implements VoiceWireAdapter {
  readonly providerId = 'anthropic';

  build(configuration: ProviderConfiguration, model: string, apiKey: string,
    context: VoiceProviderContext, signal: AbortSignal): HttpRequest {
    const capability = configuration.capabilities[model];
    if (!capability?.strictSchema) {
      throw new Error('configured voice model must support strict schema');
    }
    const origin = new URL(configuration.baseUrl);
    if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname.replace(/\/+$/, '')) {
      throw new Error('Anthropic voice baseUrl must be a credential-free HTTPS origin');
    }
    const system = [
      'You are Emma, the AI assistant for West Coast Capital Mortgage.',
      'Return exactly one strict tool result. Never invent loan figures, rates, policy, identity, delivery, or application status.',
      'Use a grounded tool request for calculations. Bind every factual claim to exactly one trusted fact key or to receipt/source evidence.',
      'Ask for the caller goal before product fields. Keep telephone speech concise and preserve the requested language.',
      context.phase === 'finalize' ? 'Finalize only from the supplied tool receipts; do not request another tool.' : 'You may request bounded grounded tools when required.',
    ].join(' ');
    const body = {
      model,
      max_tokens: configuration.maximumOutputTokens,
      stream: false,
      system,
      messages: [{ role: 'user', content: [{ type: 'text', text: JSON.stringify({
        protocol: 'core-v2-voice-provider-context-v1',
        phase: context.phase,
        input: context.input,
        dialogueState: context.state,
        toolReceipts: context.receipts,
      }) }] }],
      tools: [{
        name: OUTPUT_TOOL,
        description: 'Return the next bounded, grounded voice turn draft.',
        input_schema: VOICE_DRAFT_SCHEMA,
        strict: true,
      }],
      // Sonnet 5.5 rejects forced `tool`/`any` choices. Strict auto mode keeps
      // schema validation at the provider while parse() still fails closed
      // unless exactly one result for our output tool is returned.
      tool_choice: capability.forcedToolChoice
        ? { type: 'tool', name: OUTPUT_TOOL }
        : { type: 'auto' },
    };
    const serialized = JSON.stringify(body);
    // A tokenizer cannot emit more tokens than the UTF-8 bytes it consumes:
    // every token covers at least one byte. Bounding the entire serialized
    // request by the token ceiling is intentionally conservative and covers
    // system text, history and the tool schema, not just the caller utterance.
    if (new TextEncoder().encode(serialized).byteLength > configuration.maximumInputTokens) {
      throw new Error('serialized provider request exceeds the configured input-token ceiling');
    }
    return {
      method: 'POST',
      url: `${origin.origin}/v1/messages`,
      headers: {
        'content-type': 'application/json', accept: 'application/json',
        'anthropic-version': '2023-06-01', 'x-api-key': apiKey,
      },
      body: serialized,
      timeoutMs: configuration.requestTimeoutMs,
      signal,
    };
  }

  parse(response: HttpResponse): { draft: unknown; usage: Record<string, unknown> } {
    const body = parseObject(response.body);
    const content = Array.isArray(body.content) ? body.content : [];
    const tools = content.filter((item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === 'object' && !Array.isArray(item)
      && (item as Record<string, unknown>).type === 'tool_use'
      && (item as Record<string, unknown>).name === OUTPUT_TOOL);
    if (tools.length !== 1) throw new Error('provider returned no unique voice tool result');
    const usage = body.usage;
    if (!usage || typeof usage !== 'object' || Array.isArray(usage)) throw new Error('provider returned no usage evidence');
    return { draft: tools[0].input, usage: usage as Record<string, unknown> };
  }
}
