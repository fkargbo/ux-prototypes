import { ensureAgenticGlobalAiMounted, unmountAgenticGlobalAi } from './components/ensureAgenticGlobalAiMount';
import { resetSimulationStore } from './simulation/simulationStore';

export function onActivate(): void {
  ensureAgenticGlobalAiMounted();
}

export function onDeactivate(): void {
  resetSimulationStore();
  unmountAgenticGlobalAi();
}
