/** Handoff from Alerting → Observe troubleshooting plans (“Investigate with AI”). */

export const ALERT_INVESTIGATION_SESSION_KEY =
  'hpux.ols-domain-ux.alert-investigation';

export const ALERT_INVESTIGATION_CREATED_ALERTS_KEY =
  'hpux.ols-domain-ux.alert-investigation-created';

export const ALERT_INVESTIGATION_EVENT = 'hpux.ols-domain-ux.alert-investigation';

export const VIEW_AI_INVESTIGATION_LABEL = 'View AI investigation';
export const INVESTIGATE_WITH_AI_LABEL = 'Create AI investigation';

export const MVP_AGENTIC_PLANS_PROTOTYPE_ID = 'ai-hub-autonomous-agentic-plans-mvp';

/** Default observability plan when Agentic Plans MVP hosts this alerting UI (MVP catalog ids only). */
export const MVP_DEFAULT_INVESTIGATION_PLAN_ID = 'op1';

/**
 * Alert → plan ids for `ai-hub-autonomous-agentic-plans-mvp`, which re-exports this alerting UI
 * but only exposes MVP plan ids (op*, cp*, etc.) on troubleshooting plan detail routes.
 */
export const MVP_ALERT_NAME_TO_EXISTING_PLAN_ID: Record<string, string> = {
  // Kuklas fleet alerting mock
  HighMemoryUsage: 'op4',
  PodCrashLoopBackOff: 'op1',
  ETCDHighLatency: 'cp2',
  NetworkLatency: 'op1',
  CertExpiring: 'op2',
  DiskPressure: 'op3',
  HighCPUUsage: 'op1',
  QuotaWarning: 'cp3',
  ServiceUnavailable: 'op1',
  // Observe dataset
  PaymentsAPI5xxSurge: 'op1',
  EtcdDiskPressureOnMaster2: 'cp2',
  CheckoutSvcCPUThrottling: 'op4',
  IngressTLSCertExpiresIn36h: 'op2',
  RegionalIngressFailure: 'op1',
  ImageRegistryPersistentVolumeFull: 'op3',
  APIIngressLatencySpike: 'op1',
  ControlPlaneNodeNotReadyFlap: 'cp1',
  NodeFilesystemAlmostFull: 'op3',
};

export function isMvpAgenticPlansHost(): boolean {
  try {
    return sessionStorage.getItem('activePrototypeId') === MVP_AGENTIC_PLANS_PROTOTYPE_ID;
  } catch {
    return false;
  }
}

export type AlertInvestigationPayload = {
  alertName: string;
  alertId?: string;
  clusterName?: string;
  severity?: string;
  namespace?: string;
};

/**
 * Alerts that already have an active remediation plan in Observe troubleshooting plans.
 * Keys match alerting table `alertName` values (kuklas mock + Observe `ALERTS` titles).
 */
export const ALERT_NAME_TO_EXISTING_PLAN_ID: Record<string, string> = {
  // Observe dataset
  PaymentsAPI5xxSurge: 'tp1',
  EtcdDiskPressureOnMaster2: 'tp5',
  CheckoutSvcCPUThrottling: 'tp3',
  IngressTLSCertExpiresIn36h: 'ap3',
  RegionalIngressFailure: 'tp1',
  ImageRegistryPersistentVolumeFull: 'tp4',
  APIIngressLatencySpike: 'tp1',
  ControlPlaneNodeNotReadyFlap: 'ap5',
  NodeFilesystemAlmostFull: 'tp4',
  // Kuklas fleet alerting mock
  PodCrashLoopBackOff: 'tp3',
  HighMemoryUsage: 'tp3',
  ETCDHighLatency: 'tp5',
  NetworkLatency: 'ap4',
  CertExpiring: 'ap3',
  DiskPressure: 'tp4',
  HighCPUUsage: 'ap1',
  QuotaWarning: 'ap6',
  ServiceUnavailable: 'tp1',
};

export type InvestigationPlanDraft = {
  id: string;
  severity: 'critical' | 'warning';
  status: 'Investigating';
  score: number;
  synopsis: string;
  blastRadius: string;
  consolidationScope: string;
  triggerDomains: string;
  isUnauthorized: boolean;
  drawerTargets: string[];
  expandedReasons: Array<{ icon: 'alert' | 'warning' | 'gear' | 'sync' | 'ban' | 'wrench'; text: string }>;
};

function mapAlertSeverity(severity?: string): InvestigationPlanDraft['severity'] {
  const normalized = severity?.toLowerCase();
  if (normalized === 'critical') return 'critical';
  return 'warning';
}

export function resolveExistingPlanIdForAlert(alertName: string): string | null {
  if (isMvpAgenticPlansHost()) {
    return MVP_ALERT_NAME_TO_EXISTING_PLAN_ID[alertName] ?? null;
  }
  return ALERT_NAME_TO_EXISTING_PLAN_ID[alertName] ?? null;
}

export function readCreatedAlertInvestigations(): string[] {
  try {
    const raw = sessionStorage.getItem(ALERT_INVESTIGATION_CREATED_ALERTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string') : [];
  } catch {
    return [];
  }
}

/** Persist alert names that already have a dynamically created investigation plan. */
export function markAlertInvestigationCreated(alertName: string): void {
  try {
    const existing = readCreatedAlertInvestigations();
    if (existing.includes(alertName)) {
      return;
    }
    sessionStorage.setItem(
      ALERT_INVESTIGATION_CREATED_ALERTS_KEY,
      JSON.stringify([...existing, alertName]),
    );
  } catch {
    /* ignore */
  }
}

export function alertHasExistingInvestigationPlan(alertName: string): boolean {
  if (resolveExistingPlanIdForAlert(alertName)) {
    return true;
  }
  return readCreatedAlertInvestigations().includes(alertName);
}

export function getAlertInvestigationActionLabel(alertName: string): string {
  return alertHasExistingInvestigationPlan(alertName)
    ? VIEW_AI_INVESTIGATION_LABEL
    : INVESTIGATE_WITH_AI_LABEL;
}

/** Synthesizes a new plan row when no existing plan covers this alert. */
export function buildInvestigationPlanFromAlert(payload: AlertInvestigationPayload): InvestigationPlanDraft {
  const slug = (payload.alertId ?? payload.alertName).replace(/[^a-zA-Z0-9-]+/g, '-').toLowerCase();
  const clusterTarget = payload.clusterName?.trim() || 'prod-us-east-01';
  const scopeLabel = payload.namespace ? `Namespace · ${payload.namespace}` : '1 Alert';

  return {
    id: `inv-${slug}-${Date.now()}`,
    severity: mapAlertSeverity(payload.severity),
    status: 'Investigating',
    score: 74,
    synopsis: `Investigate ${payload.alertName}`,
    blastRadius: payload.clusterName ? '1 Cluster' : 'Fleet',
    consolidationScope: scopeLabel,
    triggerDomains: 'Prometheus',
    isUnauthorized: false,
    drawerTargets: [clusterTarget],
    expandedReasons: [
      {
        icon: 'alert',
        text: `Prometheus Alert: ${payload.alertName} — autonomous agent gathering correlated signals.`,
      },
    ],
  };
}

export function writeAlertInvestigationSession(payload: AlertInvestigationPayload): void {
  try {
    sessionStorage.setItem(ALERT_INVESTIGATION_SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function readAlertInvestigationSession(): AlertInvestigationPayload | null {
  try {
    const raw = sessionStorage.getItem(ALERT_INVESTIGATION_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as AlertInvestigationPayload;
    return parsed?.alertName ? parsed : null;
  } catch {
    return null;
  }
}

export function clearAlertInvestigationSession(): void {
  try {
    sessionStorage.removeItem(ALERT_INVESTIGATION_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function dispatchAlertInvestigation(payload: AlertInvestigationPayload): void {
  writeAlertInvestigationSession(payload);
  window.dispatchEvent(
    new CustomEvent(ALERT_INVESTIGATION_EVENT, {
      detail: payload,
    })
  );
}
