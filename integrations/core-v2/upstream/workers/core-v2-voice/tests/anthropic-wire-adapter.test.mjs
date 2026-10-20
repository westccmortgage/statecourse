import assert from 'node:assert/strict';
import test from 'node:test';

import { AnthropicVoiceWireAdapter } from '../anthropic-wire-adapter.ts';

function configuration(forcedToolChoice) {
  return {
    providerId: 'anthropic', baseUrl: 'https://api.anthropic.com',
    maximumOutputTokens: 400, maximumInputTokens: 80_000,
    requestTimeoutMs: 2_000,
    capabilities: {
      'claude-sonnet-5-5': {
        strictSchema: true, forcedToolChoice, images: false, thinking: 'always_on',
      },
    },
  };
}

const context = {
  phase: 'propose',
  input: { utterance: { text: 'What is a HELOC?' } },
  state: { revision: 0 },
  receipts: [],
};

test('strict models without forced tool support use Sonnet 5.5 compatible auto choice', () => {
  const request = new AnthropicVoiceWireAdapter().build(
    configuration(false), 'claude-sonnet-5-5', 'fixture-key', context, new AbortController().signal,
  );
  const body = JSON.parse(request.body);
  assert.deepEqual(body.tool_choice, { type: 'auto' });
  assert.equal(body.tools[0].strict, true);
});

test('models declaring forced tool support keep the stronger forced choice', () => {
  const request = new AnthropicVoiceWireAdapter().build(
    configuration(true), 'claude-sonnet-5-5', 'fixture-key', context, new AbortController().signal,
  );
  assert.deepEqual(JSON.parse(request.body).tool_choice, {
    type: 'tool', name: 'core_v2_voice_turn',
  });
});

test('auto mode still fails closed on text-only or multiple tool results', () => {
  const adapter = new AnthropicVoiceWireAdapter();
  assert.throws(() => adapter.parse({
    status: 200, headers: {}, body: JSON.stringify({ content: [{ type: 'text', text: 'hello' }], usage: {} }),
  }), /no unique voice tool result/);
  assert.throws(() => adapter.parse({
    status: 200, headers: {}, body: JSON.stringify({
      content: [
        { type: 'tool_use', name: 'core_v2_voice_turn', input: {} },
        { type: 'tool_use', name: 'core_v2_voice_turn', input: {} },
      ], usage: {},
    }),
  }), /no unique voice tool result/);
});
