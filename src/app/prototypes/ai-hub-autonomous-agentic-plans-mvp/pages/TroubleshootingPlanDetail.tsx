import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  Title,
} from '@patternfly/react-core';
import { useActivePerspective } from '@app/shared/contexts/ActivePerspectiveContext';
import { usePlanTermination } from '../context/PlanTerminationContext';
import { AiHubPageHeading } from '../components/AiHubPageHeading';
import { AiExperienceIcon } from './ai-hub-v3/AiExperienceIcon';
import {
  buildPlansForPerspective,
  PlanConfidenceBadge,
  PlanResourceBadge,
  PlanRiskBadge,
  StatusLabel,
  TriggerDomainCell,
  WaitingApprovalPlanMeta,
} from './ai-hub-v3/PlansAndApprovalsTab';
import { AI_EXPERIENCE_ICON_DATA_URL } from '../components/autonomousAiObserve/aiExperienceIconUrl';
import './ai-hub-page.css';

const PLACEHOLDER_CARD_STYLE: React.CSSProperties = {
  minHeight: 200,
  border: '2px dashed var(--pf-t--global--border--color--default)',
  backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
  borderRadius: 'var(--pf-t--global--border--radius--medium)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 'var(--pf-t--global--spacer--sm)',
  padding: 'var(--pf-t--global--spacer--xl)',
};

const PLACEHOLDER_LABEL_STYLE: React.CSSProperties = {
  fontSize: 'var(--pf-t--global--font--size--body--sm)',
  color: 'var(--pf-t--global--text--color--subtle)',
  textAlign: 'center',
};

const RemediationHubPlaceholderPanel: React.FC<{ title: string; description?: string }> = ({
  title,
  description,
}) => (
  <div style={PLACEHOLDER_CARD_STYLE}>
    <img
      src={AI_EXPERIENCE_ICON_DATA_URL}
      alt=""
      aria-hidden="true"
      width={28}
      height={28}
      style={{ opacity: 0.4 }}
    />
    <span style={{ ...PLACEHOLDER_LABEL_STYLE, fontWeight: 600 }}>{title}</span>
    {description && <span style={PLACEHOLDER_LABEL_STYLE}>{description}</span>}
  </div>
);

export const TroubleshootingPlanDetail: React.FC = () => {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const { activePerspective } = useActivePerspective();
  const isSingleCluster = activePerspective === 'Core platforms';
  const { abortedPlans, resumedPlanIds } = usePlanTermination();

  const planExecutionRuntime = useMemo(
    () => ({ abortedPlans, resumedPlanIds }),
    [abortedPlans, resumedPlanIds],
  );

  const plan = useMemo(() => {
    if (!planId) return null;
    const decoded = decodeURIComponent(planId);
    return (
      buildPlansForPerspective(isSingleCluster, planExecutionRuntime).find(
        (p) => p.id === decoded,
      ) ?? null
    );
  }, [isSingleCluster, planId, planExecutionRuntime]);

  const navigateToList = () => navigate('/core/observe/troubleshooting-plans');

  if (!planId || !plan) {
    return (
      <div className="ols-ai-hub-page ols-ai-hub-page--v3">
        <div className="template-page-breadcrumb">
          <Breadcrumb>
            <BreadcrumbItem component="button" onClick={navigateToList}>Observe</BreadcrumbItem>
            <BreadcrumbItem component="button" onClick={navigateToList}>Troubleshooting plans</BreadcrumbItem>
            <BreadcrumbItem isActive>Plan not found</BreadcrumbItem>
          </Breadcrumb>
        </div>
        <div className="template-page-content">
          <Content component="p">Plan <strong>{planId}</strong> could not be found.</Content>
        </div>
      </div>
    );
  }

  const planDisplayName = plan.name ?? plan.id;

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3" data-exp-lab-annotation-root>
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="template-page-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem component="button" onClick={navigateToList}>Observe</BreadcrumbItem>
          <BreadcrumbItem component="button" onClick={navigateToList}>Troubleshooting plans</BreadcrumbItem>
          <BreadcrumbItem isActive>{planDisplayName}</BreadcrumbItem>
        </Breadcrumb>
      </div>

      {/* ── Page heading ───────────────────────────────────────────────────── */}
      <AiHubPageHeading>
        <div className="ols-ai-hub-page-heading-body-content">
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapSm' }}
            flexWrap={{ default: 'wrap' }}
            style={{ marginBottom: 'var(--pf-t--global--spacer--xs)' }}
          >
            <FlexItem>
              <PlanResourceBadge />
            </FlexItem>
            <FlexItem style={{ minWidth: 0 }}>
              <Title headingLevel="h1" size="2xl" style={{ marginBottom: 0, wordBreak: 'break-word' }}>
                {planDisplayName}
              </Title>
            </FlexItem>
          </Flex>

          {/* Synopsis */}
          {plan.synopsis && (
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              gap={{ default: 'gapXs' }}
              flexWrap={{ default: 'nowrap' }}
              style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
            >
              <FlexItem>
                <AiExperienceIcon size={14} />
              </FlexItem>
              <FlexItem>
                <Content component="p" style={{ margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
                  {plan.synopsis}
                </Content>
              </FlexItem>
            </Flex>
          )}

          {/* Status badges */}
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            gap={{ default: 'gapSm' }}
            flexWrap={{ default: 'wrap' }}
          >
            <FlexItem>
              <StatusLabel status={plan.status} terminatedAt={plan.terminatedAt} />
            </FlexItem>
            <FlexItem>
              <TriggerDomainCell domain={plan.triggerDomain} />
            </FlexItem>
            {plan.confidenceTier && (
              <FlexItem>
                <PlanConfidenceBadge tier={plan.confidenceTier} />
              </FlexItem>
            )}
            <FlexItem>
              <PlanRiskBadge score={plan.riskScore ?? 50} />
            </FlexItem>
          </Flex>

          {/* Waiting approval meta */}
          <div style={{ marginTop: 'var(--pf-t--global--spacer--xs)' }}>
            <WaitingApprovalPlanMeta plan={plan} />
          </div>
        </div>
      </AiHubPageHeading>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <div className="template-page-content" role="main" aria-label="Troubleshooting plan detail content">

        {/* Signal context card */}
        <Card style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
          <CardBody>
            <Flex gap={{ default: 'gapMd' }} flexWrap={{ default: 'wrap' }}>
              <FlexItem style={{ flex: '1 1 320px', minWidth: 0 }}>
                <Content component="small" style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--pf-t--global--spacer--2xs)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Input / Signal context
                </Content>
                <Content component="p" style={{ margin: 0 }}>
                  {plan.consolidationScope}
                </Content>
              </FlexItem>
              <FlexItem style={{ flex: '1 1 200px', minWidth: 0 }}>
                <Content component="small" style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--pf-t--global--spacer--2xs)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Blast radius
                </Content>
                <Content component="p" style={{ margin: 0 }}>
                  {plan.blastRadius || '—'}
                </Content>
              </FlexItem>
              {plan.drawerTargets?.length > 0 && (
                <FlexItem style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <Content component="small" style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--pf-t--global--spacer--2xs)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                    {isSingleCluster ? 'Namespaces' : 'Clusters'}
                  </Content>
                  <Flex gap={{ default: 'gapXs' }} flexWrap={{ default: 'wrap' }}>
                    {plan.drawerTargets.map((t) => (
                      <FlexItem key={t}>
                        <Label isCompact color="grey">{t}</Label>
                      </FlexItem>
                    ))}
                  </Flex>
                </FlexItem>
              )}
            </Flex>
          </CardBody>
        </Card>

        {/* Remediation Hub canvas — placeholder grid */}
        <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          Remediation Hub
        </Title>

        {/* Remediation Hub Worksheets go here */}
        <Grid hasGutter>
          <GridItem span={8}>
            <RemediationHubPlaceholderPanel
              title="Remediation Worksheet"
              description="Step-by-step guided actions and automated fixes will appear here."
            />
          </GridItem>
          <GridItem span={4}>
            <RemediationHubPlaceholderPanel
              title="Impact Assessment"
              description="Risk analysis and predicted blast radius."
            />
          </GridItem>
          <GridItem span={6}>
            <RemediationHubPlaceholderPanel
              title="Reasoning Chain"
              description="AI agent reasoning steps and evidence log."
            />
          </GridItem>
          <GridItem span={6}>
            <RemediationHubPlaceholderPanel
              title="Execution History"
              description="Audit trail of previous remediation attempts."
            />
          </GridItem>
        </Grid>
      </div>
    </div>
  );
};
