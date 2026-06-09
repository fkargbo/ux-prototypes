export type ReasoningStepStatus = 'done' | 'active' | 'pending' | 'alert';

export interface ReasoningStep {
  id: string;
  time?: string;
  status: ReasoningStepStatus;
  title: string;
  detail?: string;
  icon: 'exclamation' | 'database' | 'network' | 'search' | 'check';
}
