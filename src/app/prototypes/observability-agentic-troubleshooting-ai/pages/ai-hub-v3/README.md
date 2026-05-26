# AI Hub v3.0

Iteration surface for new feedback on the **Observability Agentic Troubleshooting** prototype.

## How versioning works

- **v3.0** is the default banner version (`prototype.config.ts` → `defaultKey: 'v3'`).
- Switch **v1.0** / **v2.0** / **v3.0** from the banner version picker (next to Share).
- If you still see v2 UI after a default change, clear session storage for `hpux.bannerVersion.observability-agentic-troubleshooting-ai` or pick **v3.0** once in the picker.
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
