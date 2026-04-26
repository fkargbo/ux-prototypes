/**
 * Optional callbacks from Dashboards (Perses) so the globally mounted AI assistant
 * can drive Perses-only UI (notifications drawer, troubleshooting dashboard) without
 * coupling the shell layout.
 */
export const persesAgenticBridge = {
  setShowTroubleshootingDashboard: null as null | ((show: boolean) => void),
  setIsGeneratingDashboard: null as null | ((generating: boolean) => void),
  closeNotificationsDrawer: null as null | (() => void),
};

export const agenticGlobalAiApi = {
  startTroubleshootingForAlert: null as null | ((alertName: string) => void),
};
