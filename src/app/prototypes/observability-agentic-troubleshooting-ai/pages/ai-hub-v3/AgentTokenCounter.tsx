import React from 'react';
import { Progress, Tooltip } from '@patternfly/react-core';
import './ai-hub-v3-token-counter.css';

const AGENT_TOKEN_LIMIT = 20000;
const AGENT_TOKEN_USED = 7500;

function formatTokenCount(value: number): string {
  if (value >= 1000) {
    const thousands = value / 1000;
    const formatted =
      Number.isInteger(thousands) || value >= 10000 ? `${Math.round(thousands)}` : `${thousands.toFixed(1)}`;
    return `${formatted}K`;
  }
  return `${value}`;
}

/** v3 hub page header — remediation credits usage (banner v3 only). */
export const AgentTokenCounter: React.FC = () => {
  const usagePct = Math.min(100, Math.round((AGENT_TOKEN_USED / AGENT_TOKEN_LIMIT) * 100));
  const usedLabel = formatTokenCount(AGENT_TOKEN_USED);
  const limitLabel = formatTokenCount(AGENT_TOKEN_LIMIT);
  const creditsLeft = Math.max(0, AGENT_TOKEN_LIMIT - AGENT_TOKEN_USED);
  const creditsLeftLabel = creditsLeft.toLocaleString();

  return (
    <div
      className="ols-aio-token-counter"
      aria-label={`Credits usage ${AGENT_TOKEN_USED} out of ${AGENT_TOKEN_LIMIT}`}
    >
      <div className="ols-aio-token-counter__row">
        <span className="ols-aio-token-counter__label">Credits</span>
        <span className="ols-aio-token-counter__value">
          <strong>{usedLabel}</strong>
          {' / '}
          {limitLabel}
        </span>
      </div>
      <Tooltip content={`${creditsLeftLabel} remediation credits left`} position="top" isContentLeftAligned>
        <div className="ols-aio-token-counter__progress-wrap">
          <Progress
            className="ols-aio-token-counter__progress"
            value={usagePct}
            min={0}
            max={100}
            measureLocation="none"
            size="sm"
            aria-label={`${creditsLeftLabel} remediation credits left`}
          />
        </div>
      </Tooltip>
    </div>
  );
};
