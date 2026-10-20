import { canonical, sha256 } from '../core-v2/kernel/ids.ts';
import type { ToolReceipt, ToolRequest } from './contracts.ts';

export const CFPB_HELOC_SOURCE = 'cfpb:ask-difference-home-equity-loan-heloc:247';
export const CFPB_HELOC_BOOKLET_SOURCE = 'cfpb:heloc-brochure';

export type GroundedTool = {
  name: string;
  version: string;
  run(input: Record<string, unknown>): Omit<ToolReceipt, 'receiptId' | 'requestId' | 'tool' | 'version' | 'inputDigest'>;
};

const finite = (value: unknown, label: string, minimum = 0): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum) throw new Error(`${label} is invalid`);
  return value;
};

const payment = (principal: number, annualRatePercent: number, months: number): number => {
  if (months < 1 || !Number.isInteger(months)) throw new Error('months is invalid');
  const rate = annualRatePercent / 1200;
  if (rate === 0) return principal / months;
  return principal * rate * (1 + rate) ** months / ((1 + rate) ** months - 1);
};

export const mortgagePaymentTool: GroundedTool = {
  name: 'mortgage.payment',
  version: '1',
  run(input) {
    const principal = finite(input.principal, 'principal');
    const annualRatePercent = finite(input.annualRatePercent, 'annualRatePercent');
    const termYears = finite(input.termYears, 'termYears', 1);
    const months = termYears * 12;
    if (!Number.isInteger(months)) throw new Error('termYears must resolve to whole months');
    const monthlyPrincipalAndInterest = Number(payment(principal, annualRatePercent, months).toFixed(2));
    return {
      status: 'completed',
      facts: { principal, annualRatePercent, termYears, months, monthlyPrincipalAndInterest },
      approvedSourceIds: [],
      currentAsOf: null,
      limitations: ['Caller-supplied rate and term; excludes taxes, insurance, fees, and eligibility.'],
    };
  },
};

export const helocEducationTool: GroundedTool = {
  name: 'knowledge.heloc_basics',
  version: '1',
  run() {
    return {
      status: 'completed',
      facts: {
        helocStructure: 'revolving line secured by the home, commonly with a variable rate',
        homeEquityLoanStructure: 'lump-sum second mortgage, commonly with a fixed rate',
        cashOutStructure: 'replacement first mortgage with cash proceeds',
      },
      approvedSourceIds: [CFPB_HELOC_SOURCE, CFPB_HELOC_BOOKLET_SOURCE],
      currentAsOf: null,
      limitations: ['General education only; no current rate, product availability, eligibility, or recommendation.'],
    };
  },
};

export class GroundedToolRegistry {
  private tools = new Map<string, GroundedTool>();
  constructor(tools: GroundedTool[] = [mortgagePaymentTool, helocEducationTool]) {
    for (const tool of tools) this.tools.set(tool.name, tool);
  }

  execute(request: ToolRequest, allowedInputValues: Array<string | number | boolean> = []): ToolReceipt {
    const tool = this.tools.get(request.tool);
    const inputDigest = sha256(canonical(request.input));
    if (!tool) {
      return {
        receiptId: `receipt_${sha256(`${request.requestId}:${request.tool}:${inputDigest}`).slice(0, 24)}`,
        requestId: request.requestId,
        tool: request.tool,
        version: 'unknown',
        inputDigest,
        status: 'refused',
        facts: {}, approvedSourceIds: [], currentAsOf: null,
        limitations: ['Tool is not approved or installed.'],
      };
    }
    if (tool.name !== 'knowledge.heloc_basics') {
      const supplied = Object.values(request.input).filter((value): value is string | number | boolean =>
        ['string', 'number', 'boolean'].includes(typeof value));
      const unsupported = supplied.filter((value) => !allowedInputValues.some((allowed) => samePrimitive(allowed, value)));
      if (unsupported.length) {
        return {
          receiptId: `receipt_${sha256(`${request.requestId}:${tool.name}:${tool.version}:${inputDigest}`).slice(0, 24)}`,
          requestId: request.requestId, tool: tool.name, version: tool.version, inputDigest,
          status: 'refused', facts: {}, approvedSourceIds: [], currentAsOf: null,
          limitations: ['Tool input was not supported by caller-reported or committed facts.'],
        };
      }
    }
    try {
      return {
        receiptId: `receipt_${sha256(`${request.requestId}:${tool.name}:${tool.version}:${inputDigest}`).slice(0, 24)}`,
        requestId: request.requestId,
        tool: tool.name,
        version: tool.version,
        inputDigest,
        ...tool.run(request.input),
      };
    } catch (error) {
      return {
        receiptId: `receipt_${sha256(`${request.requestId}:${tool.name}:${tool.version}:${inputDigest}`).slice(0, 24)}`,
        requestId: request.requestId,
        tool: tool.name,
        version: tool.version,
        inputDigest,
        status: 'failed_known', facts: {}, approvedSourceIds: [], currentAsOf: null,
        limitations: [String((error as Error).message ?? error)],
      };
    }
  }
}

function samePrimitive(left: string | number | boolean, right: string | number | boolean): boolean {
  if (typeof left === 'number' && typeof right === 'number') return Math.abs(left - right) < 0.000001;
  return String(left).trim().toLowerCase() === String(right).trim().toLowerCase();
}
