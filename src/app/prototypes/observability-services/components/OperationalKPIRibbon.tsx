import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Content,
  Divider,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  Popover,
  Title,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import type {
  KpiPopoverItem,
  OperationalKpiStat,
  OperationalKpiVariant,
} from '../types';

// ─── Icon helpers ─────────────────────────────────────────────────────────────

const VALUE_ICON_MAP: Record<
  OperationalKpiVariant,
  React.ComponentType<React.SVGProps<SVGSVGElement>> | null
> = {
  danger: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  success: CheckCircleIcon,
  neutral: null,
};

const VALUE_ICON_COLOR_MAP: Record<OperationalKpiVariant, string> = {
  danger: 'var(--pf-t--global--icon--color--status--danger--default)',
  warning: 'var(--pf-t--global--icon--color--status--warning--default)',
  success: 'var(--pf-t--global--icon--color--status--success--default)',
  neutral: 'var(--pf-t--global--icon--color--subtle)',
};

// ─── Popover body ─────────────────────────────────────────────────────────────

const SetupPopoverBody: React.FC<{ items: KpiPopoverItem[] }> = ({ items }) => (
  <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
    <FlexItem>
      <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
        These capabilities require operator installation or CR configuration.
      </Content>
    </FlexItem>
    {/* Column headers */}
    <Flex
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      gap={{ default: 'gapMd' }}
    >
      <FlexItem>
        <Content component="p" style={{ fontWeight: 'var(--pf-t--global--font--weight--body--bold)', margin: 0 }}>
          Operator
        </Content>
      </FlexItem>
      <FlexItem style={{ flexShrink: 0 }}>
        <Content component="p" style={{ fontWeight: 'var(--pf-t--global--font--weight--body--bold)', margin: 0 }}>
          Setup status
        </Content>
      </FlexItem>
    </Flex>
    <Divider />
    {/* Data rows */}
    {items.map((item, idx) => (
      <React.Fragment key={item.id}>
        {idx > 0 ? <Divider /> : null}
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapMd' }}
        >
          <FlexItem>
            <Content component="p" style={{ margin: 0 }}>{item.title}</Content>
          </FlexItem>
          <FlexItem style={{ flexShrink: 0 }}>
            <Label isCompact color="grey">
              {item.state === 'partial-setup' ? 'Partial setup' : 'Not installed'}
            </Label>
          </FlexItem>
        </Flex>
      </React.Fragment>
    ))}
  </Flex>
);

// ─── KPI value renderer ───────────────────────────────────────────────────────

const KpiValueIcon: React.FC<{ variant: OperationalKpiVariant }> = ({ variant }) => {
  const Icon = VALUE_ICON_MAP[variant];
  if (!Icon) return null;
  return (
    <Icon
      color={VALUE_ICON_COLOR_MAP[variant]}
      aria-hidden
      style={{
        width: 'var(--pf-t--global--font--size--sm)',
        height: 'var(--pf-t--global--font--size--sm)',
        flexShrink: 0,
      }}
    />
  );
};

// ─── Individual KPI card ──────────────────────────────────────────────────────

interface KpiCardProps {
  stat: OperationalKpiStat;
  navigate: ReturnType<typeof useNavigate>;
}

const KpiCard: React.FC<KpiCardProps> = ({ stat, navigate }) => {
  // Render the numeric value — three variants:
  // 1. popoverItems present → Popover trigger button
  // 2. valueIsLink → plain link-styled button (no navigation yet)
  // 3. default → plain text
  const valueNode = (() => {
    const iconNode = stat.valueIconVariant ? (
      <KpiValueIcon variant={stat.valueIconVariant} />
    ) : null;

    const valueInner = (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--pf-t--global--spacer--xs)',
        }}
      >
        {iconNode}
        {stat.value}
      </span>
    );

    if (stat.popoverItems && stat.popoverItems.length > 0) {
      return (
        <Popover
          position="top"
          enableFlip
          flipBehavior={['top', 'bottom']}
          minWidth="320px"
          headerContent="Capabilities needing setup"
          bodyContent={<SetupPopoverBody items={stat.popoverItems} />}
        >
          <Button
            variant="link"
            isInline
            component="span"
            style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit' }}
            aria-label={`${stat.value} capabilities need setup. Click for setup details.`}
          >
            {valueInner}
          </Button>
        </Popover>
      );
    }

    if (stat.valueIsLink) {
      return (
        <Button
          variant="link"
          isInline
          component="span"
          style={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit' }}
          aria-label={`${stat.value} ${stat.label} — link coming soon`}
        >
          {valueInner}
        </Button>
      );
    }

    return valueInner;
  })();

  return (
    <Card isCompact isFullHeight>
      <CardBody>
        <Title headingLevel="h3" size="md">
          {stat.category}
        </Title>
        <Title headingLevel="h4" size="2xl" className="ols-obs-kpi-card__value">
          {valueNode}
        </Title>
        {stat.label ? (
          <Content component="small" className="ols-obs-kpi-card__label">
            {stat.label}
          </Content>
        ) : null}
      </CardBody>
    </Card>
  );
};

// ─── Ribbon ───────────────────────────────────────────────────────────────────

export interface OperationalKPIRibbonProps {
  stats: OperationalKpiStat[];
}

export const OperationalKPIRibbon: React.FC<OperationalKPIRibbonProps> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="ols-obs-kpi-heading" className="ols-obs-kpi-ribbon">
      <Title
        headingLevel="h2"
        size="lg"
        id="ols-obs-kpi-heading"
        className="ols-obs-services-section-title"
      >
        Observability stack summary
      </Title>
      {/* 4 equal columns on lg+, 2×2 on md, single stack on sm */}
      <Grid hasGutter>
        {stats.map((stat) => (
          <GridItem key={stat.id} span={12} md={6} lg={3}>
            <KpiCard stat={stat} navigate={navigate} />
          </GridItem>
        ))}
      </Grid>
    </section>
  );
};
