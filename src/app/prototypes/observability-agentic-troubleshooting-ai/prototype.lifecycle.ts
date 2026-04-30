import { ensureAgenticGlobalAiMounted, unmountAgenticGlobalAi } from './components/ensureAgenticGlobalAiMount';

export function onActivate(): void {
  ensureAgenticGlobalAiMounted();
}

export function onDeactivate(): void {
  unmountAgenticGlobalAi();
}
