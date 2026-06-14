/** Qualitative confidence tier (replaces numeric percentages in UX). */
export type ConfidenceTier = 'High' | 'Medium' | 'Low';

/** Stakeholder bands: High ≥80%, Medium 50–79%, Low <50%. */
export function scoreToConfidenceTier(score: number): ConfidenceTier {
  if (score >= 80) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

/** PatternFly Label colors — High→green, Medium→yellow, Low→blue. */
export function confidenceTierLabelColor(tier: ConfidenceTier): 'green' | 'yellow' | 'blue' {
  switch (tier) {
    case 'High':
      return 'green';
    case 'Medium':
      return 'yellow';
    case 'Low':
      return 'blue';
  }
}

/** Progress bar fill when only tier is stored (no numeric label shown). */
export function confidenceTierProgressValue(tier: ConfidenceTier): number {
  switch (tier) {
    case 'High':
      return 90;
    case 'Medium':
      return 65;
    case 'Low':
      return 30;
  }
}
