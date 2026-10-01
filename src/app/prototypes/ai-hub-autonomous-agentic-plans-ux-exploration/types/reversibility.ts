/** Backend-aligned reversibility on remediation proposals (proposal.reversible). */
export type Reversibility = 'Reversible' | 'Irreversible' | 'Partial';

export function formatReversibilityLabel(reversibility: Reversibility): string {
  switch (reversibility) {
    case 'Reversible':
      return 'Reversible';
    case 'Irreversible':
      return 'Irreversible';
    case 'Partial':
      return 'Partially reversible';
  }
}

export function reversibilityLabelColor(reversibility: Reversibility): 'green' | 'yellow' | 'orange' {
  switch (reversibility) {
    case 'Reversible':
      return 'green';
    case 'Partial':
      return 'yellow';
    case 'Irreversible':
      return 'orange';
  }
}
