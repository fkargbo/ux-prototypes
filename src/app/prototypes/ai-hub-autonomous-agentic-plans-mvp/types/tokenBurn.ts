export interface PlanTokenBurn {
  analysis: number;
  execution?: number;
  executionByOption?: Record<string, number>;
}

export function formatTokenBurn(tokens: number): string {
  return `${tokens.toLocaleString('en-US')} tokens`;
}

export function formatTokenBurnPair(analysis: number, execution?: number): string {
  if (execution === undefined) {
    return `Analysis: ${formatTokenBurn(analysis)}`;
  }
  return `Analysis: ${formatTokenBurn(analysis)} · Execution: ${formatTokenBurn(execution)} · Total: ${formatTokenBurn(analysis + execution)}`;
}
