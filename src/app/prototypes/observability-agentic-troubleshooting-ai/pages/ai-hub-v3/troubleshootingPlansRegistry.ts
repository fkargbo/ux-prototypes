import {
  findCatalogPlanById,
  getCatalogPlans,
  type PlanRow,
} from './PlansAndApprovalsTab';
import {
  ALERT_NAME_TO_EXISTING_PLAN_ID,
  buildInvestigationPlanFromAlert,
  isMvpAgenticPlansHost,
  markAlertInvestigationCreated,
  MVP_DEFAULT_INVESTIGATION_PLAN_ID,
  readCreatedAlertInvestigations,
  resolveExistingPlanIdForAlert,
  type AlertInvestigationPayload,
} from './alertInvestigationBridge';
import {
  findNewInvestigationPlanById,
  resolveAlertNameForNewInvestigationPlanId,
  resolveNewInvestigationPlanIdForAlert,
} from './newInvestigationPlans';

export const TROUBLESHOOTING_PLANS_LIST_PATH = '/core/observe/troubleshooting-plans';

const DYNAMIC_TROUBLESHOOTING_PLANS_KEY =
  'hpux.observability-agentic-troubleshooting-ai.dynamic-troubleshooting-plans';

const TROUBLESHOOTING_PLAN_DRILL_SESSION_KEY =
  'hpux.observability-agentic-troubleshooting-ai.troubleshooting-plan-drill';

const OBSERVABILITY_PLAN_IDS = new Set(Object.values(ALERT_NAME_TO_EXISTING_PLAN_ID));

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

export function getObservabilityTroubleshootingPlans(isSingleCluster: boolean): PlanRow[] {
  const catalog = getCatalogPlans(isSingleCluster).filter(
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
  if (!normalized) {
    return appendPerspectiveQuery(TROUBLESHOOTING_PLANS_LIST_PATH, isSingleCluster);
  }
  return appendPerspectiveQuery(
    `${TROUBLESHOOTING_PLANS_LIST_PATH}/${encodeURIComponent(normalized)}`,
    isSingleCluster,
  );
}

function appendPerspectiveQuery(path: string, isSingleCluster?: boolean): string {
  if (!isMvpAgenticPlansHost()) {
    return path;
  }
  const perspectiveKey = isSingleCluster ? 'core-platforms' : 'fleet-management';
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}perspective=${perspectiveKey}`;
}

/** Resolve or create the troubleshooting plan for an alert; returns the plan id for navigation. */
export function resolveAlertInvestigationPlanId(
  payload: AlertInvestigationPayload,
  isSingleCluster: boolean,
): string {
  if (isMvpAgenticPlansHost()) {
    const existingDynamic = findDynamicTroubleshootingPlanByAlertName(payload.alertName);
    const existingDynamicId = normalizePlanId(existingDynamic?.id);
    if (existingDynamicId) {
      return existingDynamicId;
    }

    const mappedId = resolveExistingPlanIdForAlert(payload.alertName);
    if (mappedId) {
      return mappedId;
    }

    const newInvestigationPlanId = resolveNewInvestigationPlanIdForAlert(payload.alertName);
    if (newInvestigationPlanId) {
      markAlertInvestigationCreated(payload.alertName);
      return newInvestigationPlanId;
    }

    markAlertInvestigationCreated(payload.alertName);
    return MVP_DEFAULT_INVESTIGATION_PLAN_ID;
  }

  const existingDynamic = findDynamicTroubleshootingPlanByAlertName(payload.alertName);
  const existingDynamicId = normalizePlanId(existingDynamic?.id);
  if (existingDynamicId) {
    return existingDynamicId;
  }

  const existingId = resolveExistingPlanIdForAlert(payload.alertName);
  if (existingId && findTroubleshootingPlanById(existingId)) {
    return existingId;
  }

  const newInvestigationPlanId = resolveNewInvestigationPlanIdForAlert(payload.alertName);
  if (newInvestigationPlanId && findNewInvestigationPlanById(newInvestigationPlanId, isSingleCluster)) {
    markAlertInvestigationCreated(payload.alertName);
    return newInvestigationPlanId;
  }

  const newPlan: PlanRow = {
    ...buildInvestigationPlanFromAlert(payload),
    consolidationScope: `Triggered by alert: ${payload.alertName}`,
  };
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

/** Register a plan (if not already in catalog) and return navigation targets for agentic run detail. */
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
  return {
    planId: resolved.id,
    plan: resolved,
    href: getTroubleshootingPlanDetailHref(resolved.id, isSingleCluster),
  };
}

/** Resolve plan + detail href in one pass so navigation state always matches the URL. */
export function resolveAlertInvestigationNavigation(
  payload: AlertInvestigationPayload,
  isSingleCluster: boolean,
): { href: string; plan: PlanRow; planId: string } {
  const planId = resolveAlertInvestigationPlanId(payload, isSingleCluster);
  const resolved = findTroubleshootingPlanById(planId, isSingleCluster);
  const plan: PlanRow = resolved ?? {
    ...buildInvestigationPlanFromAlert(payload),
    id: planId,
    consolidationScope: `Triggered by alert: ${payload.alertName}`,
  };

  if (!resolved) {
    addDynamicTroubleshootingPlan(plan);
  }

  writeTroubleshootingPlanDrillSession(plan);
  return {
    planId,
    plan,
    href: getTroubleshootingPlanDetailHref(planId, isSingleCluster),
  };
}
