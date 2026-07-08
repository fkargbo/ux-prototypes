/**
 * PlanDetailVersionRouter — navigation shim for alerting entry points.
 *
 * The shared alerting page (MultiClusterAlertingDashboard) navigates to
 * /core/observe/troubleshooting-plans/:planId when the user clicks
 * "View AI investigation" or "Investigate with AI".
 *
 * Option A (v2 workspace) consolidates plan details under Agentic Plans.
 * This component intercepts that shared path and redirects v2 users to
 * /v2/ai-hub/agentic-plans/plans/:planId, while falling through to the
 * original detail page for all other contexts.
 */
import React from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { getBannerVersionStorageKey } from '@app/core/bannerVersionPicker';
import { TroubleshootingPlanDetail } from './TroubleshootingPlanDetail';

const PROTOTYPE_ID = 'ai-hub-autonomous-agentic-plans-mvp';

function readActiveBannerVersion(): string | null {
  try {
    return sessionStorage.getItem(getBannerVersionStorageKey(PROTOTYPE_ID));
  } catch {
    return null;
  }
}

export const PlanDetailVersionRouter: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();

  const activeVersion = readActiveBannerVersion();

  if (activeVersion === 'v2' && planId) {
    const newPath = `/v2/ai-hub/agentic-runs/runs/${planId}`;
    const query = searchParams.toString();
    return <Navigate to={query ? `${newPath}?${query}` : newPath} replace />;
  }

  return <TroubleshootingPlanDetail />;
};
