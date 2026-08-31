/** Handoff from AI Hub “Top firing alerts” → Observe widget remediation drill-down (prototype-local). */

export const REMEDIATION_DRILL_SESSION_KEY =
  'hpux.ai-hub-autonomous-agentic-plans-ux-exploration.remediation-drill-rule';

export const REMEDIATION_DRILL_EVENT = 'hpux.ai-hub-autonomous-agentic-plans-ux-exploration.remediation-drill';

export type RemediationDrillPayload = {
  alertRuleTitle: string;
};

export function writeRemediationDrillSession(payload: RemediationDrillPayload): void {
  try {
    sessionStorage.setItem(REMEDIATION_DRILL_SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function readRemediationDrillSession(): RemediationDrillPayload | null {
  try {
    const raw = sessionStorage.getItem(REMEDIATION_DRILL_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as RemediationDrillPayload;
    return parsed?.alertRuleTitle ? parsed : null;
  } catch {
    return null;
  }
}

export function clearRemediationDrillSession(): void {
  try {
    sessionStorage.removeItem(REMEDIATION_DRILL_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function dispatchRemediationDrill(payload: RemediationDrillPayload): void {
  writeRemediationDrillSession(payload);
  window.dispatchEvent(
    new CustomEvent(REMEDIATION_DRILL_EVENT, {
      detail: payload,
    })
  );
}
