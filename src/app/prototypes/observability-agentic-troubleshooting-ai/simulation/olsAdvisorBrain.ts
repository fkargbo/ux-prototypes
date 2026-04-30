import type { SimulationAlertBrief, SimulationHandoff, SimulationSnapshot } from './simulationTypes';

/**
 * Red Hat OpenShift Lightspeed — official conversation & usage patterns (tone, follow-ups, scope).
 * @see https://docs.redhat.com/en/documentation/red_hat_openshift_lightspeed/1.0/html/operate/ols-using-openshift-lightspeed
 */
export const OLS_OPERATE_DOCUMENTATION_URL =
  'https://docs.redhat.com/en/documentation/red_hat_openshift_lightspeed/1.0/html/operate/ols-using-openshift-lightspeed';

/**
 * Voice and behavior aligned with *Operate → Using OpenShift Lightspeed* (natural language, scope,
 * follow-ups, specificity, alert troubleshooting).
 */
export const OLS_LIGHTSPEED_VOICE_FROM_DOCS = [
  'Respond like the in-console OpenShift Lightspeed assistant: clear, neutral, instructive product guidance—not theatrical roleplay.',
  'Prioritize OpenShift, Kubernetes, and related in-console workflows (Observe, Workloads, Operators, Networking, Storage, and specialized components where applicable).',
  'Use specific language: narrow questions with resource type, namespace, and product area improve answer quality; if intent could be misread, suggest a concise rephrase.',
  'Treat follow-up questions in this chat as first-class: conversation history shapes later replies—invite refinement, examples, or more detail in the same thread.',
  'For troubleshooting, pair explanations with verifiable console steps where possible (documentation-style procedures).',
  'When scope drifts outside OpenShift/Kubernetes, state the boundary briefly and steer back—mirroring how Lightspeed focuses on target topics.',
].join(' ');

/**
 * Internal persona + “play along” guardrails for the scripted OLS advisor (not sent to a real LLM here).
 * Blend: **Senior SRE**, **Cluster Admin**, and **Lead Enterprise Applications Developer** viewpoints on OCP 5 / Kubernetes,
 * delivered in **OpenShift Lightspeed documentation voice** (see `OLS_LIGHTSPEED_VOICE_FROM_DOCS`).
 * `SimulationSnapshot` (including optional `playAlong`) is treated as live operational truth in user-facing copy.
 */
export const OLS_SRE_ADVISOR_SYSTEM_DIRECTIVES = [
  OLS_LIGHTSPEED_VOICE_FROM_DOCS,
  'You combine the judgment of a Senior OpenShift SRE, a Cluster Administrator, and a Lead Enterprise Applications Developer—expressed as concise product support, not jargon for its own sake.',
  'SRE lens: reliability, incident command, observability signals, upgrade risk, and platform guardrails.',
  'Cluster Admin lens: RBAC, quotas, nodes, etcd/API health, networking, and day-2 operations.',
  'Lead App Dev lens: workload behavior, rollouts, dependencies, performance regressions, and safe change windows.',
  'Navigation: prefer OCP 5 console paths (e.g. Observe > Metrics, Observe > Alerting, Workloads > Deployments).',
  'Ground every claim in the current `SimulationSnapshot` (Observe alerts, causal-chain timestamps, remediation text, and any `playAlong` fields).',
  'Play along: when another prototype merges new simulated context via `mergeSimulationPlayAlong`, adopt that vocabulary and treat it as authoritative for this session—adapt gracefully as fields appear, change, or disappear.',
  'Never describe supplied data as mock, fake, simulated, or placeholder.',
  'When Autonomous AI Observe (internal legacy label: KubeKlaw TBC) is active, prioritize its causal chain and investigation narrative alongside other snapshot fields.',
].join(' ');

/** Closing line mirroring docs: follow-ups refine results; same-chat context matters. */
const CONVERSATION_FOLLOW_UP =
  '\n\nYou can ask a follow-up in this chat to refine this answer—for example, more detail, a command example, or a narrower scope. OpenShift Lightspeed uses your conversation history when forming the next reply.';

function appendConversationGuidance(body: string): string {
  return `${body}${CONVERSATION_FOLLOW_UP}`;
}

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
  return appendConversationGuidance(`${briefing}\n\n${observePath}`);
}

export function buildDiscussOpening(
  snap: SimulationSnapshot,
  handoff: SimulationHandoff
): string {
  const alert = snap.alerts.find((a) => a.id === handoff.alertId) ?? primaryAlert(snap);
  const title = alert?.title ?? 'this incident';
  const scope = handoff.cardId === 'remediation' ? 'remediation path' : 'root cause analysis';

  const body =
    `Based on the **${handoff.diagnosisName}** context (${scope}) for **${title}** (reference **${handoff.alertId}**), here is information you can use in the console:\n\n` +
    `${alert ? `**Summary:** ${alert.rcaSummary}\n\n` : ''}` +
    `${alert ? `**Evidence Autonomous AI Observe correlated:** ${alert.agentInvestigationNarrative}\n\n` : ''}` +
    `**Recommended direction:** ${alert?.remediationSummary ?? 'Review the remediation hub in Observe for recommended changes.'}\n` +
    `**Change risk:** ${alert?.remediationRiskSummary ?? 'Evaluate blast radius before applying changes.'}`;

  return appendConversationGuidance(body);
}

export function buildObserveToChatHandoff(snap: SimulationSnapshot): string {
  const p = primaryAlert(snap);
  if (!snap.isIncidentActive || !p) {
    return appendConversationGuidance(
      'OpenShift Lightspeed is ready for natural-language questions about this OpenShift scope. ' +
        'Ask about cluster health, alert triage, or console navigation (Observe, Workloads, Operators). ' +
        'Use specific wording—resource type, namespace, and product area help produce clearer answers.'
    );
  }
  const body =
    `Based on the alert context available here, Autonomous AI Observe highlights **${p.title}** (${p.severity}). ` +
    `The latest causal-chain emphasis is **${latestCausalStep(p)}**.\n\n` +
    `**Remediation path:** ${p.remediationSummary}\n` +
    `**Risk:** ${p.remediationRiskSummary}\n` +
    `**Evidence trail:** ${p.agentInvestigationNarrative}\n\n` +
    `**Verify in the console:** open **Observe > Alerting** to confirm labels and routing, then **Observe > Metrics** for workload-level corroboration.`;

  return appendConversationGuidance(body);
}

export function composeAdvisorReply(userMessage: string, snap: SimulationSnapshot): string {
  const q = userMessage.toLowerCase().trim();
  const wordCount = userMessage.trim().split(/\s+/).filter(Boolean).length;

  if (/\b(recipe|poem|lyrics|bitcoin|stock price|weather forecast|sports score)\b/i.test(userMessage)) {
    return appendConversationGuidance(
      'OpenShift Lightspeed focuses on OpenShift, Kubernetes, and related console workflows. ' +
        'Rephrase your question with that scope—for example, name a namespace, workload, or Observe view you are working in—and I can return more targeted information.'
    );
  }

  if (/\b(right now|currently|happening now|status)\b/.test(q) || (q.includes('what') && q.includes('happening'))) {
    return buildRightNowAnswer(snap);
  }

  if (/\b(navigate|where do i|console|menu|ocp)\b/.test(q)) {
    return appendConversationGuidance(
      'In the **Administrator** perspective, use **Observe > Alerting** (rules and firing alerts), **Observe > Metrics** (Prometheus explorer), **Observe > Dashboards** (saved views), and **Observe > Targets** for scrape health. ' +
        buildSituationBriefing(snap)
    );
  }

  if (/\b(ambient|sparkle|pre-?analyzed|causal chain)\b/.test(q)) {
    const aid = snap.ambientIndicatorAlertId;
    const target = aid ? snap.alerts.find((a) => a.id === aid) : primaryAlert(snap);
    if (!target) {
      return appendConversationGuidance(
        'Attach or select alert context in the console (for example, expand an alert row in **Observe > Alerting**) so OpenShift Lightspeed can reference a specific alert ID and its causal chain.'
      );
    }
    return appendConversationGuidance(
      `For alert **${target.id}** (**${target.title}**), the pre-analyzed causal chain is: ` +
        `${target.steps.map((s) => `[${s.status}] ${s.title}${s.time ? ` @${s.time}` : ''}`).join(' → ')}. ` +
        `Narrative: ${target.agentInvestigationNarrative}`
    );
  }

  const p = primaryAlert(snap);
  if (!p) {
    const pl = formatPlayAlongContext(snap);
    if (pl) {
      return appendConversationGuidance(
        `Here is information grounded in your current scope for **${snap.selectedClusterName || 'this environment'}**:\n\n${pl}\n\n` +
          'Ask a follow-up with a namespace, workload name, or console page if you want command examples or a narrower procedure.'
      );
    }
    return appendConversationGuidance(
      `No firing alerts are loaded for **${snap.selectedClusterName}** in this view. ` +
        'You can ask about capacity planning, upgrades, or metrics—include the namespace or workload for more precise guidance.'
    );
  }

  const specificityHint =
    wordCount <= 3
      ? 'For clearer results, include the namespace, workload type, and what you are trying to verify (documentation recommends specific wording).\n\n'
      : '';

  const pl = formatPlayAlongContext(snap);
  const core =
    specificityHint +
    `**${p.title}** — ${p.message}\n\n` +
    `**Root cause:** ${p.rcaSummary} Key reference: \`${p.rootCauseRef}\` ${p.rootCauseTail}. ` +
    `**Confidence:** ${p.confidence}%.\n\n` +
    `**Remediation:** ${p.remediationSummary}\n` +
    `**Risk:** ${p.remediationRiskSummary}`;

  return appendConversationGuidance(pl ? `${core}\n\n${pl}` : core);
}
