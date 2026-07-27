import React, { useState } from 'react';
import { Button, Content, Flex, FlexItem, Title, Tooltip } from '@patternfly/react-core';
import { InfoCircleIcon, OutlinedStarIcon, StarIcon } from '@patternfly/react-icons';
import { AiHubPageHeading } from '../../components/AiHubPageHeading';
import { AgenticKillSwitchBanner } from '../../components/AgenticKillSwitchBanner';
import { AuditKillSwitchPanel } from '../../components/AuditKillSwitchPanel';
import { TechPreviewBadge } from '../../components/TechPreviewBadge';
import { AddToFavoritesModal } from '../../components/AddToFavoritesModal';
import * as Hub from '../ai-hub-plans-v2';
import '../ai-hub-page.css';

export const AIHubPageV2: React.FC = () => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);

  const handleStarClick = () => {
    if (isFavorited) {
      setIsFavorited(false);
    } else {
      setIsFavoritesModalOpen(true);
    }
  };

  const handleFavoriteSave = (_name: string) => {
    setIsFavorited(true);
  };

  return (
    <div className="ols-ai-hub-page ols-ai-hub-page--v3 ols-ai-hub-page--list" data-exp-lab-annotation-root>
      <AiHubPageHeading>
        <div className="ols-ai-hub-page-header-primary">
          <Hub.AiExperienceIcon size={40} />
          <div className="ols-ai-hub-page-header-copy">
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <FlexItem>
                <Title headingLevel="h1" size="2xl">
                  Agentic runs
                </Title>
              </FlexItem>
              <FlexItem>
                <TechPreviewBadge />
              </FlexItem>
              <FlexItem>
                <Tooltip content={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
                  <Button
                    variant="plain"
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={handleStarClick}
                    style={{ padding: '2px' }}
                  >
                    {isFavorited ? (
                      <StarIcon style={{ color: 'var(--pf-t--global--color--status--warning--default)' }} />
                    ) : (
                      <OutlinedStarIcon />
                    )}
                  </Button>
                </Tooltip>
              </FlexItem>
            </Flex>
            <Content component="p" className="ols-ai-hub-page-disclaimer">
              <InfoCircleIcon
                style={{
                  color: 'var(--pf-t--global--icon--color--status--info--default)',
                  marginInlineEnd: 'var(--pf-t--global--spacer--xs)',
                  verticalAlign: 'middle',
                  flexShrink: 0,
                }}
                aria-hidden
              />
              The autonomous features of OpenShift Lightspeed use AI technology to generate output. Always
              review AI-generated content prior to use.
            </Content>
          </div>
        </div>
      </AiHubPageHeading>

      <AddToFavoritesModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        onSave={handleFavoriteSave}
      />

      <div
        id="ols-ai-hub-main"
        className="template-page-content"
        role="main"
        aria-label="Agentic runs content"
      >
        <AuditKillSwitchPanel />
        <AgenticKillSwitchBanner />
        <Hub.PlansAndApprovalsTab />
      </div>
    </div>
  );
};
