import * as React from 'react';
import { useUseCaseContext } from '@app/contexts/UseCaseContext';

// Use Case 2 (Tenant Admin - Walter) - Original implementation
import { ClustersPage as ClustersPageUC2, ClusterDetailPage as ClusterDetailPageUC2, IdentitiesPage as IdentitiesPageUC2, RolesPage as RolesPageUC2, IdentityProvidersPage as IdentityProvidersPageUC2 } from '@app/use-case-2/navigation';
import { ProjectsPage as ProjectsPageUC2 } from '@app/use-case-2/navigation/core-platforms';
import { GovernancePage as GovernancePageUC2 } from '@app/use-case-2/navigation/governance/GovernancePage';
import { CreatePolicy as CreatePolicyUC2 } from '@app/use-case-2/Governance/CreatePolicy';
import { IdentityDetail as IdentityDetailUC2 } from '@app/use-case-2/Identities/IdentityDetail';
import { GroupDetail as GroupDetailUC2 } from '@app/use-case-2/Identities/GroupDetail';
import CreateGroupUC2 from '@app/use-case-2/Identities/CreateGroup';
import { CreateRole as CreateRoleUC2 } from '@app/use-case-2/Roles/CreateRole';
import { RoleDetail as RoleDetailUC2 } from '@app/use-case-2/Roles/RoleDetail';
import { IdentityProviderDetail as IdentityProviderDetailUC2 } from '@app/use-case-2/IdentityProvider/IdentityProviderDetail';
import { AddLDAPProvider as AddLDAPProviderUC2 } from '@app/use-case-2/IdentityProvider/AddLDAPProvider';
import { ProjectDetail as ProjectDetailUC2 } from '@app/use-case-2/Projects/ProjectDetail';

// Use Case 1 (Fleet Admin) - Separate implementation
import { ClustersPage as ClustersPageUC1, ClusterDetailPage as ClusterDetailPageUC1, IdentitiesPage as IdentitiesPageUC1, RolesPage as RolesPageUC1, IdentityProvidersPage as IdentityProvidersPageUC1 } from '@app/use-case-1/navigation';
import { ProjectsPage as ProjectsPageUC1 } from '@app/use-case-1/navigation/core-platforms';
import { GovernancePage as GovernancePageUC1 } from '@app/use-case-1/navigation/governance/GovernancePage';
import { CreatePolicy as CreatePolicyUC1 } from '@app/use-case-1/Governance/CreatePolicy';
import { IdentityDetail as IdentityDetailUC1 } from '@app/use-case-1/Identities/IdentityDetail';
import { GroupDetail as GroupDetailUC1 } from '@app/use-case-1/Identities/GroupDetail';
import CreateGroupUC1 from '@app/use-case-1/Identities/CreateGroup';
import { CreateRole as CreateRoleUC1 } from '@app/use-case-1/Roles/CreateRole';
import { RoleDetail as RoleDetailUC1 } from '@app/use-case-1/Roles/RoleDetail';
import { IdentityProviderDetail as IdentityProviderDetailUC1 } from '@app/use-case-1/IdentityProvider/IdentityProviderDetail';
import { AddLDAPProvider as AddLDAPProviderUC1 } from '@app/use-case-1/IdentityProvider/AddLDAPProvider';
import { ProjectDetail as ProjectDetailUC1 } from '@app/use-case-1/Projects/ProjectDetail';

// Use Case AAQ (Virtualization Admin) - AAQ-specific implementation
import { QuotasPage as QuotasPageAAQ, VirtualizationWrapper as VirtualizationWrapperAAQ } from '@app/use-case-aaq/navigation';
import { QuotaDetail as QuotaDetailAAQ } from '@app/use-case-aaq/Quotas/QuotaDetail';
import { CreateQuota as CreateQuotaAAQ } from '@app/use-case-aaq/Quotas/CreateQuota';

// Export wrapped components
export const ClustersPage: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <ClustersPageUC1 /> : <ClustersPageUC2 />;
};

export const ClusterDetailPage: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <ClusterDetailPageUC1 /> : <ClusterDetailPageUC2 />;
};

export const IdentitiesPage: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <IdentitiesPageUC1 /> : <IdentitiesPageUC2 />;
};

export const RolesPage: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <RolesPageUC1 /> : <RolesPageUC2 />;
};

export const IdentityProvidersPage: React.FC<{ showClustersColumn: boolean }> = ({ showClustersColumn }) => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' 
    ? <IdentityProvidersPageUC1 showClustersColumn={showClustersColumn} /> 
    : <IdentityProvidersPageUC2 showClustersColumn={showClustersColumn} />;
};

export const ProjectsPage: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <ProjectsPageUC1 /> : <ProjectsPageUC2 />;
};

export const GovernancePage: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <GovernancePageUC1 /> : <GovernancePageUC2 />;
};

export const CreatePolicy: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <CreatePolicyUC1 /> : <CreatePolicyUC2 />;
};

export const IdentityDetail: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <IdentityDetailUC1 /> : <IdentityDetailUC2 />;
};

export const GroupDetail: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <GroupDetailUC1 /> : <GroupDetailUC2 />;
};

export const CreateGroup: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <CreateGroupUC1 /> : <CreateGroupUC2 />;
};

export const CreateRole: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <CreateRoleUC1 /> : <CreateRoleUC2 />;
};

export const RoleDetail: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <RoleDetailUC1 /> : <RoleDetailUC2 />;
};

export const IdentityProviderDetail: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <IdentityProviderDetailUC1 /> : <IdentityProviderDetailUC2 />;
};

export const AddLDAPProvider: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <AddLDAPProviderUC1 /> : <AddLDAPProviderUC2 />;
};

export const ProjectDetail: React.FC = () => {
  const { useCase } = useUseCaseContext();
  return useCase === 'use-case-1' ? <ProjectDetailUC1 /> : <ProjectDetailUC2 />;
};

// AAQ-specific exports
export const QuotasPage: React.FC = () => {
  return <QuotasPageAAQ />;
};

export const QuotaDetail: React.FC = () => {
  return <QuotaDetailAAQ />;
};

export const CreateQuota: React.FC = () => {
  return <CreateQuotaAAQ />;
};

export const VirtualizationOverview: React.FC = () => {
  return <VirtualizationWrapperAAQ />;
};

