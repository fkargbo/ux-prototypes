import { ensureAgenticGlobalAiMounted, unmountAgenticGlobalAi } from './components/ensureAgenticGlobalAiMount';
import { ensureExpLabFeedbackLayer, removeExpLabFeedbackLayer } from './components/ensureExpLabFeedbackLayer';
import { clearFocusedClusterSession } from './components/autonomousAiObserve/focusClusterSession';
import { resetSimulationStore } from './simulation/simulationStore';

export function onActivate(): void {
  ensureAgenticGlobalAiMounted();
  ensureExpLabFeedbackLayer();
}

export function onDeactivate(): void {
  resetSimulationStore();
  clearFocusedClusterSession();
  unmountAgenticGlobalAi();
  removeExpLabFeedbackLayer();
}
