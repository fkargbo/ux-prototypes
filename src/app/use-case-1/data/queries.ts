// Use Case 1 (Fleet Admin) - Query functions using globalMockDatabase
import { globalMockDatabase } from '@app/data/globalMockDatabase';

// Debug logging
console.log('📦 USE CASE 1 queries.ts - globalMockDatabase.clusters.length:', globalMockDatabase.clusters.length);

// Re-export all data from globalMockDatabase
export const getAllClusters = () => globalMockDatabase.clusters;
export const getAllClusterSets = () => globalMockDatabase.clusterSets;
export const getAllNamespaces = () => globalMockDatabase.namespaces;
export const getAllUsers = () => globalMockDatabase.users;
export const getAllGroups = () => globalMockDatabase.groups;
export const getAllServiceAccounts = () => globalMockDatabase.serviceAccounts;
export const getAllIdentityProviders = () => globalMockDatabase.identityProviders;
export const getAllRoles = () => globalMockDatabase.roles;
export const getAllRoleBindings = () => globalMockDatabase.roleBindings;
export const getAllVirtualMachines = () => globalMockDatabase.virtualMachines;
export const getAllInstanceTypes = () => globalMockDatabase.instanceTypes;
export const getAllTemplates = () => globalMockDatabase.templates;

// Query functions with filtering
export const getClustersByClusterSet = (clusterSetId: string) => 
  globalMockDatabase.clusters.filter(c => c.clusterSetId === clusterSetId);

export const getNamespacesByCluster = (clusterId: string) =>
  globalMockDatabase.namespaces.filter(ns => ns.clusterId === clusterId);

export const getUsersByGroup = (groupId: string) =>
  globalMockDatabase.users.filter(u => u.groupIds.includes(groupId));

export const getGroupsForUser = (userId: string) => {
  const user = globalMockDatabase.users.find(u => u.id === userId);
  if (!user) return [];
  return globalMockDatabase.groups.filter(g => user.groupIds.includes(g.id));
};

export const getUsersByIdentityProvider = (identityProviderId: string) =>
  globalMockDatabase.users.filter(u => u.identityProviderId === identityProviderId);

export const getClustersByIdentityProvider = (identityProviderId: string) => {
  const idp = globalMockDatabase.identityProviders.find(i => i.id === identityProviderId);
  if (!idp) return [];
  return globalMockDatabase.clusters.filter(c => idp.clusterIds.includes(c.id));
};

export const getIdentityProviderById = (id: string) =>
  globalMockDatabase.identityProviders.find(i => i.id === id);

export const getGroupByName = (name: string) =>
  globalMockDatabase.groups.find(g => g.name === name);

export const getClusterById = (id: string) =>
  globalMockDatabase.clusters.find(c => c.id === id);

export const getClusterSetById = (id: string) =>
  globalMockDatabase.clusterSets.find(cs => cs.id === id);

export const getRoleById = (id: string) =>
  globalMockDatabase.roles.find(r => r.id === id);

export const getUserById = (id: string) =>
  globalMockDatabase.users.find(u => u.id === id);

