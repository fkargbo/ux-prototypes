import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  Title,
} from '@patternfly/react-core';
import EllipsisVIcon from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon';
import { useDeletedPlans } from '../../context/DeletedPlansContext';
import { DeleteAgenticRunModal } from '../../components/DeleteAgenticRunModal';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import {
  buildPlansForPerspective,
  PlanResourceBadge,
  RemediationBlueprintPanel,
  StatusLabel,
  type PlanRow,
} from '../ai-hub-plans-v2/PlansAndApprovalsTab';
import {
  buildPrototypeHref,
  perspectiveKeyFromShellName,
  PLANS_LIST_PATH,
  resolveDrillPerspectiveKey,
  writePlanRemediationDrillSession,
} from '../v2PlanRemediationDrillSession';
import { usePlanBuildRuntime } from '../../hooks/usePlanBuildRuntime';
import { AiHubPageHeading } from '../../components/AiHubPageHeading';
import { AgenticKillSwitchBanner } from '../../components/AgenticKillSwitchBanner';
import { TechPreviewBadge } from '../../components/TechPreviewBadge';
import { DEFAULT_PROTOTYPE_PERSPECTIVE } from '../../prototypePerspectiveUrl';
import '../ai-hub-page.css';

export const AcsPlanDetailPageV2: React.FC = () => {
  const navigate = useNavigate();
  const { planSlug } = useParams<{ planSlug: string }>();
  const [searchParams] = useSearchParams();
  const { activePerspective, setPerspectiveByKey } = useActivePerspective();
  const drillPerspectiveAppliedRef = useRef(false);

  const drillPerspectiveKey = useMemo(
    () => resolveDrillPerspectiveKey(searchParams),
    [searchParams],
  );

  const isSingleCluster = drillPerspectiveKey
    ? drillPerspectiveKey === 'core-platforms'
    : activePerspective === 'Core platforms';

  const planExecutionRuntime = usePlanBuildRuntime();

  const plan = useMemo(() => {
    if (!planSlug) return null;
    return buildPlansForPerspective(isSingleCluster, planExecutionRuntime).find(
      (row) => row.name === planSlug,
    ) ?? null;
  }, [isSingleCluster, planSlug, planExecutionRuntime]);

  const navigateBackToPlans = useCallback(() => {
    const key =
      drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
    writePlanRemediationDrillSession({ perspectiveKey: key });
    setPerspectiveByKey(key);
    navigate(buildPrototypeHref(PLANS_LIST_PATH, key));
  }, [activePerspective, drillPerspectiveKey, navigate, setPerspectiveByKey]);

  useLayoutEffect(() => {
    if (!drillPerspectiveKey || drillPerspectiveAppliedRef.current) return;
    drillPerspectiveAppliedRef.current = true;
    setPerspectiveByKey(drillPerspectiveKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on drill URL only
  }, [drillPerspectiveKey]);

  useEffect(() => {
    if (planSlug && plan) return;
    const key =
      drillPerspectiveKey
      ?? perspectiveKeyFromShellName(activePerspective)
      ?? DEFAULT_PROTOTYPE_PERSPECTIVE;
    navigate(buildPrototypeHref(PLANS_LIST_PATH, key), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redirect once when plan is missing
  }, [planSlug, plan]);

  /** Local denial override — transitions a Proposed plan to Denied without mutating mock data. */
  const [locallyDenied, setLocallyDenied] = useState(false);

  useEffect(() => {
    setLocallyDenied(false);
  }, [planSlug]);

  const { deletePlan } = useDeletedPlans();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  const handleConfirmDelete = useCallback(() => {
    deletePlan(plan?.id ?? '');
    setIsDeleteModalOpen(false);
    navigateBackToPlans();
  }, [deletePlan, plan, navigateBackToPlans]);

  if (!planSlug || !plan) return null;

  const effectivePlan: PlanRow = locallyDenied
    ? { ...plan, status: 'Denied' as PlanRow['status'] }
    : plan;

  const planDisplayName = plan.name ?? plan.id;

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem component="button" onClick={navigateBackToPlans}>
            Agentic runs
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Agentic run details</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <AiHubPageHeading>
        <div className="ols-ai-hub-page-heading-body-content">
          <Alert
            variant="info"
            isInline
            title="Advanced Cluster Security console (prototype stub)"
            style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
          >
            <Content component="p" style={{ margin: 0 }}>
              Security plans open in the ACS console in production. This stub simulates the domain-specific
              detail experience linked from the global Agentic Plans list via annotation-based navigation.
            </Content>
          </Alert>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
            <FlexItem><PlanResourceBadge /></FlexItem>
            <FlexItem style={{ minWidth: 0 }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                <FlexItem>
                  <Title headingLevel="h1" size="2xl" style={{ marginBottom: 0, wordBreak: 'break-word' }}>
                    {planDisplayName}
                  </Title>
                </FlexItem>
                <FlexItem>
                  <TechPreviewBadge />
                </FlexItem>
              </Flex>
            </FlexItem>
            {plan.namespace && (
              <FlexItem>
                <Label color="grey" variant="outline" isCompact>{plan.namespace}</Label>
              </FlexItem>
            )}
            <FlexItem>
              <Label color="grey" variant="outline" isCompact>{plan.triggerDomain}</Label>
            </FlexItem>
            <FlexItem>
              <Label color="purple" variant="outline" isCompact>ACS console</Label>
            </FlexItem>
          </Flex>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapSm' }}
            style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}
          >
            <FlexItem>
              <StatusLabel status={effectivePlan.status} terminatedAt={effectivePlan.terminatedAt} />
            </FlexItem>
            <FlexItem align={{ default: 'alignRight' }}>
              <Dropdown
                isOpen={isActionsMenuOpen}
                onSelect={() => setIsActionsMenuOpen(false)}
                onOpenChange={setIsActionsMenuOpen}
                popperProps={{ position: 'right' }}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    variant="plain"
                    isExpanded={isActionsMenuOpen}
                    onClick={() => setIsActionsMenuOpen((o) => !o)}
                    aria-label="Run actions"
                  >
                    <EllipsisVIcon />
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem
                    isDanger
                    onClick={() => { setIsActionsMenuOpen(false); setIsDeleteModalOpen(true); }}
                  >
                    Delete run
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </FlexItem>
          </Flex>
        </div>
      </AiHubPageHeading>

      <DeleteAgenticRunModal
        isOpen={isDeleteModalOpen}
        runName={planDisplayName}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <div className="template-page-content" role="main" aria-label={`ACS plan: ${planDisplayName}`}>
        <div
          className="ols-plan-remediation-drilldown"
          style={effectivePlan.status === 'Pending' ? { width: '100%' } : undefined}
        >
          <AgenticKillSwitchBanner />
          <RemediationBlueprintPanel
            key={plan.id}
            plan={effectivePlan}
            onRejectPlan={plan.status === 'Proposed' ? () => setLocallyDenied(true) : undefined}
            onStartNewInvestigation={navigateBackToPlans}
          />
        </div>
      </div>
    </div>
  );
};
