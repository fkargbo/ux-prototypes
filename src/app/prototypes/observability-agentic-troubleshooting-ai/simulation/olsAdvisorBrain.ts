import type { SimulationAlertBrief, SimulationHandoff, SimulationSnapshot } from './simulationTypes';

/**
 * Internal persona + “play along” guardrails for the scripted OLS advisor (not sent to a real LLM here).
 * Blend: **Senior SRE**, **Cluster Admin**, and **Lead Enterprise Applications Developer** viewpoints on OCP 5 / Kubernetes.
 * `SimulationSnapshot` (including optional `playAlong`) is treated as live operational truth in user-facing copy.
 */
export const OLS_SRE_ADVISOR_SYSTEM_DIRECTIVES = [
  'You combine the judgment of a Senior OpenShift SRE, a Cluster Administrator, and a Lead Enterprise Applications Developer.',
  'SRE lens: reliability, incident command, observability signals, upgrade risk, and platform guardrails.',
  'Cluster Admin lens: RBAC, quotas, nodes, etcd/API health, networking, and day-2 operations.',
  'Lead App Dev lens: workload behavior, rollouts, dependencies, performance regressions, and safe change windows.',
  'Tone: professional, technical, objective. Reference Red Hat / OCP documentation patterns where helpful.',
  'Navigation: prefer OCP 5 console paths (e.g. Observe > Metrics, Observe > Alerting, Workloads > Deployments).',
  'Ground every claim in the current `SimulationSnapshot` (Observe alerts, causal-chain timestamps, remediation text, and any `playAlong` fields).',
  'Play along: when another prototype merges new simulated context via `mergeSimulationPlayAlong`, adopt that vocabulary and treat it as authoritative for this session—adapt gracefully as fields appear, change, or disappear.',
  'Never describe supplied data as mock, fake, simulated, or placeholder.',
  'When Autonomous AI Observe (internal legacy label: KubeKlaw TBC) is active, prioritize its causal chain and investigation narrative alongside other snapshot fields.',
].join(' ');

function formatPlayAlongContext(snap: SimulationSnapshot): string {
  const pl = snap.playAlong;
  if (!pl || (!pl.primaryEntitySummary && !(pl.contextBullets && pl.contextBullets.length) && !pl.domainLabel)) {
    return '';
  }
  const parts: string[] = [];
  if (pl.domainLabel) {
    parts.push(`**Current prototype focus:** ${pl.domainLabel}.`);
  }
  if (pl.primaryEntitySummary) {
    parts.push(pl.primaryEntitySummary);
  }
  if (pl.contextBullets?.length) {
    parts.push('**On-screen / API context:**\n' + pl.contextBullets.map((b) => `• ${b}`).join('\n'));
  }
  return parts.join('\n\n');
}

function latestCausalStep(a: SimulationAlertBrief): string {
  const ordered = [...a.steps].reverse();
  const active = ordered.find((s) => s.status === 'active');
  if (active) {
    return `${active.title}${active.time ? ` (${active.time})` : ''}`;
  }
  const done = ordered.filter((s) => s.status === 'done');
  const last = done[0];
  return last ? `${last.title}${last.time ? ` (${last.time})` : ''}` : a.title;
}

function primaryAlert(snap: SimulationSnapshot): SimulationAlertBrief | undefined {
  const crit = snap.alerts.filter((a) => a.severity === 'critical');
  if (crit.length) {
    return crit.sort((a, b) => b.firedAt.localeCompare(a.firedAt))[0];
  }
  const warm = snap.alerts.filter((a) => a.severity === 'warning');
  if (warm.length) {
    return warm.sort((a, b) => b.firedAt.localeCompare(a.firedAt))[0];
  }
  return snap.alerts[0];
}

export function buildSituationBriefing(snap: SimulationSnapshot): string {
  const playAlong = formatPlayAlongContext(snap);
  const head = snap.isMultiCluster && snap.viewMode === 'fleet'
    ? `Fleet scope (${snap.alerts.length} tracked alert(s) across clusters).`
    : `Cluster **${snap.selectedClusterName}** (${snap.selectedClusterHealth} health, agent: **${snap.selectedClusterAgentStatus}**).`;

  if (!snap.alerts.length) {
    if (playAlong) {
      return `${head}\n\n${playAlong}`;
    }
    return `${head} No firing alerts in this scope—capacity and error budgets look quiet from Observe.`;
  }

  const p = primaryAlert(snap);
  if (!p) {
    const tail = `${head} Review Observe > Alerting for any silenced or routed signals.`;
    return playAlong ? `${tail}\n\n${playAlong}` : tail;
  }

  const chain = latestCausalStep(p);
  const core =
    `${head} Leading signal: **${p.title}** (${p.severity}, ${p.service}). ` +
    `Latest causal-chain focus: ${chain}. ` +
    `Autonomous AI Observe narrative: ${p.agentInvestigationNarrative}`;
  return playAlong ? `${core}\n\n${playAlong}` : core;
}

export function buildRightNowAnswer(snap: SimulationSnapshot): string {
  const briefing = buildSituationBriefing(snap);
  const observePath =
    snap.alerts.length > 0
      ? `**What to do next (OCP 5):** open **Observe > Alerting** to confirm firing rules, then **Observe > Metrics** with namespace-scoped CPU/error-rate dashboards for the workloads named on the alert. ` +
        `If you need pod-level signals, use **Observe > Dashboards** or **Workloads > Pods** filtered by the alert namespace.`
      : `**What to do next:** anchor on the console areas that match your current screen (Administrator vs Developer perspective). ` +
        `If this flow is not Observe-centric, map questions to the closest operational surface (workloads, operators, networking, or storage) implied by the context above.`;
  return `${briefing}\n\n${observePath}`;
}

export function buildDiscussOpening(
  snap: SimulationSnapshot,
  handoff: SimulationHandoff
): string {
  const alert = snap.alerts.find((a) => a.id === handoff.alertId) ?? primaryAlert(snap);
  const title = alert?.title ?? 'this incident';
  const scope = handoff.cardId === 'remediation' ? 'remediation path' : 'root cause analysis';

  return (
    `I see you're looking at the **${handoff.diagnosisName}** view (${scope}) for **${title}** (${handoff.alertId}). ` +
    `${alert ? `Root cause summary: ${alert.rcaSummary}` : ''}\n\n` +
    `${alert ? `Autonomous AI Observe evidence: ${alert.agentInvestigationNarrative}` : ''}\n\n` +
    `**Proposed direction:** ${alert?.remediationSummary ?? 'Review the remediation hub in Observe for recommended changes.'}\n` +
    `**Risk framing:** ${alert?.remediationRiskSummary ?? 'Evaluate blast radius before applying changes.'}`
  );
}

export function buildObserveToChatHandoff(snap: SimulationSnapshot): string {
  const p = primaryAlert(snap);
  if (!snap.isIncidentActive || !p) {
    return (
      'I am synced with Autonomous AI Observe for this scope. Ask about cluster health, alert triage, or where to click next in the Observe menu.'
    );
  }
  return (
    `I see Autonomous AI Observe has flagged active work on **${p.title}** (${p.severity}). ` +
    `Latest chain emphasis: **${latestCausalStep(p)}**. ` +
    `Here is my assessment of the remediation path: ${p.remediationSummary} ` +
    `Risk: ${p.remediationRiskSummary} ` +
    `Evidence trail: ${p.agentInvestigationNarrative} ` +
    `Navigate to **Observe > Alerting** to validate firing labels, then **Observe > Metrics** for workload corroboration.`
  );
}

export function composeAdvisorReply(userMessage: string, snap: SimulationSnapshot): string {
  const q = userMessage.toLowerCase().trim();

  if (/\b(right now|currently|happening now|status)\b/.test(q) || (q.includes('what') && q.includes('happening'))) {
    return buildRightNowAnswer(snap);
  }

  if (/\b(navigate|where do i|console|menu|ocp)\b/.test(q)) {
    return (
      'Use the **Administrator** perspective. For signals: **Observe > Alerting** (rules and fires), **Observe > Metrics** (Prometheus explorer), **Observe > Dashboards** (saved views), and **Observe > Targets** for scrape health. ' +
      buildSituationBriefing(snap)
    );
  }

  if (/\b(ambient|sparkle|pre-?analyzed|causal chain)\b/.test(q)) {
    const aid = snap.ambientIndicatorAlertId;
    const target = aid ? snap.alerts.find((a) => a.id === aid) : primaryAlert(snap);
    if (!target) {
      return 'Select an alert row or open Autonomous AI Observe so I can reference the pre-analyzed causal chain for a specific alert ID.';
    }
    return (
      `For alert **${target.id}** / **${target.title}**, the pre-analyzed causal chain is: ` +
      `${target.steps.map((s) => `[${s.status}] ${s.title}${s.time ? ` @${s.time}` : ''}`).join(' → ')}. ` +
      `Narrative: ${target.agentInvestigationNarrative}`
    );
  }

  const p = primaryAlert(snap);
  if (!p) {
    const pl = formatPlayAlongContext(snap);
    if (pl) {
      return (
        `Drawing on the combined **SRE / Cluster Admin / Lead App Dev** view for **${snap.selectedClusterName || 'this environment'}**:\n\n${pl}\n\n` +
        `Ask how to validate, roll out, or roll back a change, or where to click next in the console for this prototype.`
      );
    }
    return (
      `I can help triage Observe signals for **${snap.selectedClusterName}**. ` +
      `No active alerts are loaded in this scope—ask about capacity planning, upgrade risk, or paste a metric question.`
    );
  }

  const pl = formatPlayAlongContext(snap);
  const core =
    `Grounded in Autonomous AI Observe for **${snap.selectedClusterName}**: **${p.title}** — ${p.message} ` +
    `RCA: ${p.rcaSummary} ` +
    `Key reference: \`${p.rootCauseRef}\` ${p.rootCauseTail}. ` +
    `Confidence ${p.confidence}%. ` +
    `Remediation: ${p.remediationSummary} ` +
    `Risk: ${p.remediationRiskSummary}`;
  return pl ? `${core}\n\n${pl}` : core;
}
