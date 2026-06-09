# AI Hub - Autonomous agentic plans (MVP)

## Purpose

MVP prototype for autonomous agentic remediation plans in AI Hub. Focuses on plan review, approval workflows, and Lightspeed-assisted remediation discussion.

## Features

- **Plans & Approvals** — Review top autonomous remediation plans, expand reasoning chains, and approve or reject proposals.
- **Global Lightspeed chat** — Floating OpenShift Lightspeed assistant (mounted via `prototype.lifecycle.ts`) for contextual remediation discussion.

## Setup

1. Select **AI Hub - Autonomous agentic plans (MVP)** from the prototype launcher.
2. Open **AI Hub** in the sidebar (Core platforms or Fleet management).
3. Use the Lightspeed toggle (bottom-right) to open the agent chat.

## Structure

```
ai-hub-autonomous-agentic-plans-mvp/
├── prototype.config.ts
├── prototype.lifecycle.ts      # Mounts/unmounts global agent chat
├── persesAgenticBridge.ts      # Page ↔ chat integration API
├── components/
│   ├── AgenticGlobalAiAssistant.tsx
│   └── ensureAgenticGlobalAiMount.tsx
├── simulation/                 # Scripted advisor responses
└── pages/
    ├── AIHubPage.tsx
    └── PlansAndApprovalsTab.tsx
```

## Research Questions

- How do operators triage and approve autonomous remediation plans at fleet scale?
- What evidence and reasoning chain detail is needed before approval?
- When should remediation discussion hand off to Lightspeed chat?
