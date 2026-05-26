# AI Hub v3.0

Iteration surface for new feedback on the **Observability Agentic Troubleshooting** prototype.

## How versioning works

- Select **v3.0** from the prototype banner version picker (next to Share).
- `AIHubPage` routes to `AutonomousAiObserveWidgetV3` and imports from this directory only.
- **v1.0** (`AutonomousAiObserveWidget.tsx`) and **v2.0** (`ai-hub-v2/`, `AutonomousAiObserveWidgetV2.tsx`) are unchanged when you edit v3 files.

## Where to edit

| Area | Path |
|------|------|
| Hub chrome (inventory bars, cards, token counter) | `pages/ai-hub-v3/*` |
| Autonomous analysis widget | `components/autonomousAiObserve/AutonomousAiObserveWidgetV3.tsx` |
| v3-only widget styles | `components/autonomousAiObserve/autonomous-ai-observe-v3.css` |
| Banner version options | `prototype.config.ts` → `bannerVersionPicker` |

## Shared (intentionally)

`data.ts`, `ObserveAlertItem`, simulation, and base `autonomous-ai-observe.css` are still shared across versions until forked. Fork into v3 when a change must not affect v1/v2.
