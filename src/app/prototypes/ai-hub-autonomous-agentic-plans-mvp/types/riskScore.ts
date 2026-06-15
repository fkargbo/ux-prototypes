/** Governance risk score (0–100) — gates automated remediation execution. */
export type RiskTier = 'Low' | 'Medium' | 'High';

/** Score < 50 → Low; 50–70 → Medium; > 70 → High. */
export function scoreToRiskTier(score: number): RiskTier {
  if (score < 50) return 'Low';
  if (score <= 70) return 'Medium';
  return 'High';
}

/** PatternFly Label colors — Low→green, Medium→orange, High→red. */
export function riskTierLabelColor(tier: RiskTier): 'green' | 'orange' | 'red' {
  switch (tier) {
    case 'Low':
      return 'green';
    case 'Medium':
      return 'orange';
    case 'High':
      return 'red';
  }
}

export function formatRiskLabel(score: number): string {
  return `${scoreToRiskTier(score)} (${score})`;
}

/** Matches RCA / page header badge copy — e.g. "Risk: High (88)". */
export function formatRiskBadgeLabel(score: number): string {
  return `Risk: ${formatRiskLabel(score)}`;
}

export function isLowRisk(score: number): boolean {
  return score < 50;
}

export function isMediumRisk(score: number): boolean {
  return score >= 50 && score <= 70;
}

export function isHighRisk(score: number): boolean {
  return score > 70;
}
