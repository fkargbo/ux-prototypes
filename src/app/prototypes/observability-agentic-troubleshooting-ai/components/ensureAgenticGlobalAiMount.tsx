import React, { useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AgenticGlobalAiAssistant } from './AgenticGlobalAiAssistant';

const HOST_ID = 'observability-agentic-global-ai-root';

let root: Root | undefined;

export function ensureAgenticGlobalAiMounted(): void {
  if (typeof document === 'undefined' || root) {
    return;
  }
  let el = document.getElementById(HOST_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = HOST_ID;
    document.body.appendChild(el);
  }
  root = createRoot(el);
  root.render(<AgenticGlobalAiAssistant />);
}

/** Mounts the singleton global AI assistant once when any prototype page loads. */
export const EnsureGlobalAgenticAiMount: React.FC = () => {
  useEffect(() => {
    ensureAgenticGlobalAiMounted();
  }, []);
  return null;
};
