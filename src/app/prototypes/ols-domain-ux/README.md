# Agentic OpenShift Lightspeed - Domain UX patterns

## Purpose

Isolated prototype for [HPUX-1984](https://issues.redhat.com/browse/HPUX-1984): post–5.0 MVP patterns for how operator domain UIs (GitOps, Pipelines, Observability, ACS) surface Agentic OpenShift Lightspeed information and when they link into the centralized Agentic Runs UI.

Forked from `ai-hub-autonomous-agentic-plans-mvp` as a starting point. Domain-specific flows are developed here without affecting the MVP or Observability prototypes.

## Three UX patterns (masthead / launcher version picker)

Switch patterns via **Pattern A — Agentic runs handoff**, **Pattern B — Recommendation hub**, or **Pattern C — Context side panel** in the masthead Version dropdown (also on the launcher tile).

| Pattern | Investigate with AI behavior |
|--------|------------------------------|
| **A — Agentic runs handoff** | Navigate to Agentic run detail under **Agentic Runs** |
| **B — Recommendation hub** | Navigate to recommendation detail under **Recommendation hub** |
| **C — Context side panel** | Open a fixed side panel on the current domain page; **Open full view** goes to Recommendation hub detail |

### Demo flows

1. **GitOps:** `GitOps → Applications` — investigate on degraded / unknown sync apps
2. **Pipelines:** `Pipelines → PipelineRuns` — investigate on failed runs
3. **Observability:** `Observe → Alerting` — Investigate with AI on alert rows
4. Compare patterns by switching the masthead Version picker without leaving the prototype

## Setup

1. Select **Agentic OpenShift Lightspeed - Domain UX patterns** from the prototype launcher.
2. Pick a pattern in the masthead Version dropdown.
3. Use domain nav (GitOps, Pipelines, Observe) or Agentic Runs / Recommendation hub (B and C only) as needed.

## Notes

- This prototype is **fully isolated** — no shared imports with other prototype directories.
- GitOps and Pipelines nav structure aligns with OpenShift GitOps plugin exploration (Aug 2026).
