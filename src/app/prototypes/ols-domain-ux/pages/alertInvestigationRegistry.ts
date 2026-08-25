import { buildPlansForPerspective, type PlanRow } from './ai-hub-plans-v2/PlansAndApprovalsTab';
import {
  ALERT_NAME_TO_EXISTING_PLAN_ID,
  buildInvestigationPlanFromAlert,
  markAlertInvestigationCreated,
  readCreatedAlertInvestigations,
  resolveExistingPlanIdForAlert,
  type AlertInvestigationPayload,
} from './ai-hub-v3/alertInvestigationBridge';
import {
  ALERT_NAME_TO_NEW_INVESTIGATION_PLAN_ID,
  resolveAlertNameForNewInvestigationPlanId,
} from './ai-hub-plans-v2/alertInvestigationPlans';

function findNewInvestigationPlanById(planId: string, isSingleCluster: boolean): PlanRow | undefined {
  return buildPlansForPerspective(isSingleCluster).find((p) => p.id === planId);
}

function resolveNewInvestigationPlanIdForAlert(alertName: string): string | null {
  return ALERT_NAME_TO_NEW_INVESTIGATION_PLAN_ID[alertName] ?? null;
}

import { buildPrototypeHref } from './v2PerspectiveUrl';
import { getPlanDetailHref } from './ai-hub-plans-v2/domainPlanNavigation';
import type { AppShellPerspectiveKey } from '@app/shared/contexts/ActivePerspectiveContext';
import { writePlanRemediationDrillSession } from './planRemediationDrillSession';
import { normalizePlanStatus } from '../types/planStatus';

function planFromAlertPayload(payload: AlertInvestigationPayload, planId?: string): PlanRow {
  const draft = buildInvestigationPlanFromAlert(payload);
  return {
    id: planId ?? draft.id,
    severity: draft.severity,
    status: normalizePlanStatus('Investigating'),
    score: draft.score,
    synopsis: draft.synopsis,
    consolidationScope: `Triggered by alert: ${payload.alertName}`,
    triggerDomain: 'Prometheus',
    drawerTargets: draft.drawerTargets,
    expandedReasons: draft.expandedReasons.map((reason) => ({
      icon: reason.icon,
      text: reason.text,
    })),
  };
}

/** Canonical Agentic runs list (sidebar nav + share links). */
export const TROUBLESHOOTING_PLANS_LIST_PATH = '/core/observe/troubleshooting-plans';

const DYNAMIC_TROUBLESHOOTING_PLANS_KEY = 'hpux.ols-domain-ux.dynamic-troubleshooting-plans';

const TROUBLESHOOTING_PLAN_DRILL_SESSION_KEY = 'hpux.ols-domain-ux.troubleshooting-plan-drill';

const OBSERVABILITY_PLAN_IDS = new Set(Object.values(ALERT_NAME_TO_EXISTING_PLAN_ID));

function perspectiveKey(isSingleCluster: boolean): AppShellPerspectiveKey {
  return isSingleCluster ? 'core-platforms' : 'fleet-management';
}

function isNewInvestigationPlanVisible(planId: string): boolean {
  const alertName = resolveAlertNameForNewInvestigationPlanId(planId);
  if (!alertName) {
    return false;
  }
  return readCreatedAlertInvestigations().includes(alertName);
}

function investigationSynopsis(alertName: string): string {
  return `Investigate ${alertName}`;
}

function readDynamicTroubleshootingPlans(): PlanRow[] {
  try {
    const raw = sessionStorage.getItem(DYNAMIC_TROUBLESHOOTING_PLANS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PlanRow[]) : [];
  } catch {
    return [];
  }
}

function writeDynamicTroubleshootingPlans(plans: PlanRow[]): void {
  try {
    sessionStorage.setItem(DYNAMIC_TROUBLESHOOTING_PLANS_KEY, JSON.stringify(plans));
  } catch {
    /* ignore */
  }
}

function addDynamicTroubleshootingPlan(plan: PlanRow): void {
  const existing = readDynamicTroubleshootingPlans();
  if (existing.some((entry) => entry.id === plan.id)) {
    return;
  }
  writeDynamicTroubleshootingPlans([...existing, plan]);
}

export function findDynamicTroubleshootingPlanByAlertName(alertName: string): PlanRow | undefined {
  const synopsis = investigationSynopsis(alertName);
  return readDynamicTroubleshootingPlans().find((plan) => plan.synopsis === synopsis);
}

function findCatalogPlanById(planId: string, isSingleCluster: boolean): PlanRow | undefined {
  return buildPlansForPerspective(isSingleCluster).find((plan) => plan.id === planId);
}

export function getObservabilityTroubleshootingPlans(isSingleCluster: boolean): PlanRow[] {
  const catalog = buildPlansForPerspective(isSingleCluster).filter(
    (plan) => OBSERVABILITY_PLAN_IDS.has(plan.id) || isNewInvestigationPlanVisible(plan.id),
  );
  const dynamic = readDynamicTroubleshootingPlans();
  const byId = new Map<string, PlanRow>();
  for (const plan of [...catalog, ...dynamic]) {
    byId.set(plan.id, plan);
  }
  return Array.from(byId.values()).sort((a, b) => b.score - a.score);
}

export function findTroubleshootingPlanById(planId: string, isSingleCluster?: boolean): PlanRow | undefined {
  const dynamic = readDynamicTroubleshootingPlans().find((plan) => plan.id === planId);
  if (dynamic) {
    return dynamic;
  }

  if (isSingleCluster === true) {
    return findCatalogPlanById(planId, true);
  }
  if (isSingleCluster === false) {
    return findCatalogPlanById(planId, false);
  }

  return findCatalogPlanById(planId, false) ?? findCatalogPlanById(planId, true);
}

function normalizePlanId(planId: string | undefined | null): string | null {
  const normalized = planId?.trim();
  return normalized ? normalized : null;
}

export function writeTroubleshootingPlanDrillSession(plan: PlanRow): void {
  try {
    sessionStorage.setItem(TROUBLESHOOTING_PLAN_DRILL_SESSION_KEY, JSON.stringify(plan));
  } catch {
    /* ignore */
  }
}

export function readTroubleshootingPlanDrillSession(): PlanRow | null {
  try {
    const raw = sessionStorage.getItem(TROUBLESHOOTING_PLAN_DRILL_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PlanRow;
    return normalizePlanId(parsed?.id) ? parsed : null;
  } catch {
    return null;
  }
}

export function getTroubleshootingPlanDetailHref(planId: string, isSingleCluster?: boolean): string {
  const normalized = normalizePlanId(planId);
  const key = perspectiveKey(isSingleCluster ?? false);
  if (!normalized) {
    return buildPrototypeHref(TROUBLESHOOTING_PLANS_LIST_PATH, key);
  }
  const plan = findTroubleshootingPlanById(normalized, isSingleCluster);
  if (plan) {
    return getPlanDetailHref(plan, key);
  }
  return buildPrototypeHref(
    `/v2/ai-hub/agentic-runs/runs/${encodeURIComponent(normalized)}`,
    key,
  );
}

export function resolveAlertInvestigationPlanId(
  payload: AlertInvestigationPayload,
  isSingleCluster: boolean,
): string {
  const existingDynamic = findDynamicTroubleshootingPlanByAlertName(payload.alertName);
  const existingDynamicId = normalizePlanId(existingDynamic?.id);
  if (existingDynamicId) {
    return existingDynamicId;
  }

  const existingId = resolveExistingPlanIdForAlert(payload.alertName);
  if (existingId && findTroubleshootingPlanById(existingId, isSingleCluster)) {
    return existingId;
  }

  const newInvestigationPlanId = resolveNewInvestigationPlanIdForAlert(payload.alertName);
  if (newInvestigationPlanId && findNewInvestigationPlanById(newInvestigationPlanId, isSingleCluster)) {
    markAlertInvestigationCreated(payload.alertName);
    return newInvestigationPlanId;
  }

  const newPlan: PlanRow = planFromAlertPayload(payload);
  addDynamicTroubleshootingPlan(newPlan);
  markAlertInvestigationCreated(payload.alertName);
  return newPlan.id;
}

export function getAlertInvestigationNavigationHref(
  payload: AlertInvestigationPayload,
  isSingleCluster: boolean,
): string {
  return resolveAlertInvestigationNavigation(payload, isSingleCluster).href;
}

export function resolveAlertInvestigationPlan(
  payload: AlertInvestigationPayload,
  isSingleCluster: boolean,
): PlanRow {
  return resolveAlertInvestigationNavigation(payload, isSingleCluster).plan;
}

export function resolveInvestigationPlanNavigation(
  plan: PlanRow,
  isSingleCluster?: boolean,
): { href: string; plan: PlanRow; planId: string } {
  const existing = findTroubleshootingPlanById(plan.id, isSingleCluster);
  const resolved = existing ?? plan;

  if (!existing) {
    addDynamicTroubleshootingPlan(resolved);
  }

  writeTroubleshootingPlanDrillSession(resolved);
  const key = perspectiveKey(isSingleCluster ?? false);
  writePlanRemediationDrillSession({ perspectiveKey: key });
  return {
    planId: resolved.id,
    plan: resolved,
    href: getPlanDetailHref(resolved, key),
  };
}

export function resolveAlertInvestigationNavigation(
  payload: AlertInvestigationPayload,
  isSingleCluster: boolean,
): { href: string; plan: PlanRow; planId: string } {
  const planId = resolveAlertInvestigationPlanId(payload, isSingleCluster);
  const resolved = findTroubleshootingPlanById(planId, isSingleCluster);
  const plan: PlanRow = resolved ?? planFromAlertPayload(payload, planId);

  if (!resolved) {
    addDynamicTroubleshootingPlan(plan);
  }

  writeTroubleshootingPlanDrillSession(plan);
  const key = perspectiveKey(isSingleCluster);
  writePlanRemediationDrillSession({ perspectiveKey: key });
  return {
    planId,
    plan,
    href: getPlanDetailHref(plan, key),
  };
}
