import type { PlanStatus } from './planStatus';

export interface PlanTokenBurn {
  analysis?: number;
  execution?: number;
  executionByOption?: Record<string, number>;
}

export function isPlanTokenBurnAvailable(burn: PlanTokenBurn): boolean {
  return burn.analysis !== undefined;
}

export function formatTokenCount(tokens: number): string {
  return tokens.toLocaleString('en-US');
}

export function formatTokenBurn(tokens: number | undefined): string {
  if (tokens === undefined) {
    return '';
  }
  return `${formatTokenCount(tokens)} tokens`;
}

/** Renders token burn for detail surfaces — blank when the SDK did not report usage. */
export function formatOptionalTokenBurn(tokens: number | undefined, suffix?: string): string {
  if (tokens === undefined) {
    return '';
  }
  const base = formatTokenBurn(tokens);
  return suffix ? `${base} ${suffix}` : base;
}

/** Resolves consumed execution tokens for terminal plans when option id is unknown. */
export function resolveConsumedExecutionBurn(
  burn: PlanTokenBurn,
  executionOptionId?: string,
): number | undefined {
  if (executionOptionId) {
    const byOption = burn.executionByOption?.[executionOptionId];
    if (byOption !== undefined) {
      return byOption;
    }
    if (burn.execution !== undefined) {
      return burn.execution;
    }
  }
  if (burn.execution !== undefined) {
    return burn.execution;
  }
  const optionBurns = burn.executionByOption;
  if (optionBurns) {
    const values = Object.values(optionBurns);
    if (values.length > 0) {
      return values[0];
    }
  }
  return undefined;
}

export type PlanTokensConsumedView = {
  /** Cell display — em dash when analysis is still in progress. */
  display: string;
  tooltip: string;
};

const TERMINAL_EXECUTION_STATUSES: PlanStatus[] = ['Completed', 'Failed', 'Plan aborted'];

/** Cumulative consumed tokens for plans list — never includes predictive execution estimates. */
export function getPlanTokensConsumedView(
  status: PlanStatus,
  burn: PlanTokenBurn,
  options?: {
    executionOptionId?: string;
    planKind?: 'remediation' | 'analysis-only';
  },
): PlanTokensConsumedView {
  if (status === 'Analyzing') {
    return {
      display: '—',
      tooltip: 'Analysis in progress — token consumption is not final yet.',
    };
  }

  if (!isPlanTokenBurnAvailable(burn)) {
    return {
      display: '—',
      tooltip: 'Token consumption not reported by the configured SDK.',
    };
  }

  const analysis = burn.analysis!;
  const analysisLine = `Analysis: ${formatTokenBurn(analysis)}`;

  if (status === 'Acknowledged' || options?.planKind === 'analysis-only') {
    return {
      display: formatTokenCount(analysis),
      tooltip: analysisLine,
    };
  }

  if (TERMINAL_EXECUTION_STATUSES.includes(status)) {
    const execution = resolveConsumedExecutionBurn(burn, options?.executionOptionId);
    if (execution !== undefined && execution > 0) {
      const total = analysis + execution;
      return {
        display: formatTokenCount(total),
        tooltip: formatTokenBurnPair(analysis, execution),
      };
    }
    return {
      display: formatTokenCount(analysis),
      tooltip: analysisLine,
    };
  }

  if (status === 'Executing' || status === 'Verifying') {
    return {
      display: formatTokenCount(analysis),
      tooltip: `${analysisLine}. Execution in progress — total updates when complete.`,
    };
  }

  return {
    display: formatTokenCount(analysis),
    tooltip: analysisLine,
  };
}

export function formatTokenBurnPair(analysis: number | undefined, execution?: number): string {
  if (analysis === undefined) {
    return '';
  }
  if (execution === undefined) {
    return `Analysis: ${formatTokenBurn(analysis)}`;
  }
  return `Analysis: ${formatTokenBurn(analysis)} · Execution: ${formatTokenBurn(execution)} · Total: ${formatTokenBurn(analysis + execution)}`;
}
