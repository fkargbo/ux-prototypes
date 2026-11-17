/** Backend-aligned risk level on remediation options and plan rows. */
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type RemediationRisk = 'low' | 'medium' | 'high' | 'critical';

const RISK_ORDER: Record<RiskLevel, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
};

export function mapOptionRisk(risk: RemediationRisk): RiskLevel {
  switch (risk) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    case 'critical':
      return 'Critical';
  }
}

export function maxRiskLevel(levels: RiskLevel[]): RiskLevel {
  if (levels.length === 0) {
    return 'Medium';
  }
  return levels.reduce((max, level) => (RISK_ORDER[level] > RISK_ORDER[max] ? level : max));
}

export function riskLevelLabelColor(level: RiskLevel): 'green' | 'yellow' | 'red' | 'purple' {
  switch (level) {
    case 'Low':
      return 'green';
    case 'Medium':
      return 'yellow';
    case 'High':
      return 'red';
    case 'Critical':
      return 'purple';
  }
}

export function formatRiskLevelLabel(level: RiskLevel): string {
  return level;
}

export function formatRiskBadgeLabel(level: RiskLevel): string {
  return `Risk: ${level}`;
}

/** @deprecated Use RiskLevel — kept for filter toolbar type alias */
export type RiskTier = RiskLevel;
