import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, TimesIcon } from '@patternfly/react-icons';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { useInvestigationPanel } from '../context/InvestigationPanelContext';
import { getRecommendationDetailHref } from '../domainInvestigationHandoff';
import { AgenticKillSwitchBanner } from './AgenticKillSwitchBanner';
import {
  RemediationBlueprintPanel,
  WaitingApprovalPlanMeta,
  PlanResourceBadge,
  StatusLabel,
  NamespaceResourceLink,
  type PlanRow,
} from '../pages/ai-hub-plans-v2/PlansAndApprovalsTab';
import { TechPreviewBadge } from './TechPreviewBadge';
import { perspectiveKeyFromShellName, writePlanRemediationDrillSession } from '../pages/planRemediationDrillSession';

export const InvestigationSidePanel: React.FC = () => {
  const { activePlan, closeInvestigationPanel } = useInvestigationPanel();
  const navigate = useNavigate();
  const { activePerspective } = useActivePerspective();
  const [locallyDenied, setLocallyDenied] = useState(false);

  useEffect(() => {
    setLocallyDenied(false);
  }, [activePlan?.id]);

  const effectivePlan = useMemo(() => {
    if (!activePlan) return null;
    return locallyDenied
      ? { ...activePlan, status: 'Denied' as PlanRow['status'] }
      : activePlan;
  }, [activePlan, locallyDenied]);

  const openFullView = useCallback(() => {
    if (!activePlan) return;
    const perspectiveKey =
      perspectiveKeyFromShellName(activePerspective)
      ?? (activePerspective === 'Core platforms' ? 'core-platforms' : 'fleet-management');
    writePlanRemediationDrillSession({ perspectiveKey });
    const href = getRecommendationDetailHref(activePlan, perspectiveKey);
    closeInvestigationPanel();
    navigate(href, { state: { plan: activePlan } });
  }, [activePlan, activePerspective, closeInvestigationPanel, navigate]);

  if (!effectivePlan) {
    return null;
  }

  const planDisplayName = effectivePlan.name ?? effectivePlan.id;

  return (
    <div
      role="dialog"
      aria-label="AI recommendation details"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(480px, 100vw)',
        zIndex: 500,
        boxShadow: 'var(--pf-t--global--box-shadow--lg)',
        backgroundColor: 'var(--pf-v5-global--BackgroundColor--100, #fff)',
        borderLeft: '1px solid var(--pf-t--global--border--color--default)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <DrawerPanelContent isResizable defaultSize="100%" style={{ flex: 1, minHeight: 0 }}>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          style={{ padding: 'var(--pf-t--global--spacer--md)' }}
        >
          <Title headingLevel="h2" size="lg">
            AI recommendation
          </Title>
          <Button
            variant="plain"
            aria-label="Close recommendation panel"
            icon={<TimesIcon />}
            onClick={closeInvestigationPanel}
          />
        </Flex>
        <div style={{ padding: 'var(--pf-t--global--spacer--md)', overflow: 'auto', flex: 1 }}>
          <Flex
            direction={{ default: 'column' }}
            gap={{ default: 'gapMd' }}
            style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
          >
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                <FlexItem><PlanResourceBadge /></FlexItem>
                <FlexItem>
                  <Title headingLevel="h3" size="lg" style={{ marginBottom: 0 }}>
                    {planDisplayName}
                  </Title>
                </FlexItem>
                <FlexItem><TechPreviewBadge /></FlexItem>
              </Flex>
            </FlexItem>
            {effectivePlan.namespace ? (
              <FlexItem>
                <NamespaceResourceLink name={effectivePlan.namespace} />
              </FlexItem>
            ) : null}
            <FlexItem>
              <StatusLabel status={effectivePlan.status} terminatedAt={effectivePlan.terminatedAt} />
            </FlexItem>
            <FlexItem>
              <WaitingApprovalPlanMeta plan={effectivePlan} />
            </FlexItem>
            <FlexItem>
              <Button variant="link" icon={<ExternalLinkAltIcon />} onClick={openFullView}>
                Open full view in Recommendation hub
              </Button>
            </FlexItem>
          </Flex>
          <AgenticKillSwitchBanner />
          <RemediationBlueprintPanel
            key={effectivePlan.id}
            plan={effectivePlan}
            onRejectPlan={effectivePlan.status === 'Proposed' ? () => setLocallyDenied(true) : undefined}
            onStartNewInvestigation={closeInvestigationPanel}
          />
        </div>
      </DrawerPanelContent>
    </div>
  );
};
