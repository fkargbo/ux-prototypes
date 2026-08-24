import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useActivePerspective,
  type AppShellPerspectiveKey,
} from '@app/shared/contexts/ActivePerspectiveContext';
import { useInvestigationPanel } from '../context/InvestigationPanelContext';
import { handoffToInvestigation } from '../domainInvestigationHandoff';
import { useDomainUxPattern } from '../domainUxPattern';
import { getPlanDetailHref } from '../pages/ai-hub-plans-v2/domainPlanNavigation';
import type { PlanRow } from '../pages/ai-hub-plans-v2/PlansAndApprovalsTab';
import { perspectiveKeyFromShellName } from '../pages/planRemediationDrillSession';

export function useInvestigationHandoff() {
  const pattern = useDomainUxPattern();
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const { openInvestigationPanel } = useInvestigationPanel();

  return useCallback(
    (plan: PlanRow, agenticRunsHref?: string) => {
      const perspectiveKey: AppShellPerspectiveKey =
        perspectiveKeyFromShellName(activePerspective)
        ?? (activePerspective === 'Core platforms' ? 'core-platforms' : 'fleet-management');

      const href =
        agenticRunsHref ?? getPlanDetailHref(plan, perspectiveKey);

      handoffToInvestigation({
        pattern,
        plan,
        perspectiveKey,
        agenticRunsHref: href,
        navigate,
        openInvestigationPanel,
      });
    },
    [activePerspective, navigate, openInvestigationPanel, pattern],
  );
}
