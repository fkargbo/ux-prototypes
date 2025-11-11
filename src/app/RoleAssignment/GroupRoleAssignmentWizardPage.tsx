import * as React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Title,
  Content,
  Radio,
  SearchInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Checkbox,
  Label,
  Flex,
  FlexItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Pagination,
  PaginationVariant,
  Card,
  CardBody,
  Divider,
  Drawer,
  DrawerPanelContent,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelBody,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { CaretDownIcon, FilterIcon, EllipsisVIcon } from '@patternfly/react-icons';
import { getAllUsers, getAllGroups, getAllRoles, getAllClusters, getAllNamespaces, getAllClusterSets } from '@app/data';

const dbUsers = getAllUsers();
const dbGroups = getAllGroups();
const dbRoles = getAllRoles();
const dbClusters = getAllClusters();
const dbNamespaces = getAllNamespaces();
const dbClusterSets = getAllClusterSets();

const mockClusters = dbClusters.map((cluster, index) => ({
  id: index + 1,
  name: cluster.name,
  clusterSet: dbClusterSets.find(cs => cs.id === cluster.clusterSetId)?.name || 'Unknown',
  status: cluster.status,
  infrastructure: cluster.cloud || 'Amazon Web Services',
  controlPlaneType: 'Standalone',
  distribution: `Kubernetes ${cluster.kubernetesVersion}`,
  distributionUpgrade: false,
  labels: 3,
  nodes: cluster.nodes,
  addOns: 4,
  creationDate: new Date(2024, 0, 15 + index).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
}));

const mockClusterSets = dbClusterSets.map((clusterSet, index) => ({
  id: index + 1,
  name: clusterSet.name,
  clusterCount: clusterSet.clusterIds.length,
}));

const mockProjects = dbNamespaces.map((ns, index) => {
  // Find the mock cluster ID that corresponds to the database cluster ID
  const dbClusterIndex = dbClusters.findIndex(c => c.id === ns.clusterId);
  const mockClusterId = dbClusterIndex !== -1 ? dbClusterIndex + 1 : null;
  
  return {
    id: index + 1,
    name: ns.name,
    cluster: dbClusters.find(c => c.id === ns.clusterId)?.name || 'Unknown',
    clusterId: mockClusterId,
  };
});

// Map category to display category (plugin/source)
const getCategoryDisplay = (category: string): string => {
  switch (category) {
    case 'kubevirt':
      return 'Virtualization';
    case 'cluster':
      return 'OpenShift Cluster Management';
    case 'namespace':
      return 'OpenShift Namespace Management';
    case 'application':
      return 'Application Management';
    default:
      return 'OpenShift';
  }
};

const mockRoles = dbRoles.map((role, index) => ({
  id: index + 1,
  name: role.name,
  displayName: role.displayName,
  type: role.type === 'default' ? 'Default' : 'Custom',
  category: getCategoryDisplay(role.category),
  description: role.description,
  resources: role.category === 'kubevirt' 
    ? ['VirtualMachines', 'VirtualMachineInstances'] 
    : role.category === 'cluster' 
    ? ['Clusters', 'ClusterSets'] 
    : role.category === 'namespace'
    ? ['Namespaces', 'Projects']
    : ['Applications', 'Deployments'],
  permissions: role.permissions,
}));

export const GroupRoleAssignmentWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { groupName } = useParams<{ groupName: string }>();
  const location = useLocation();
  const returnPath = location.state?.returnPath || `/user-management/groups/${groupName}`;

  const [currentStep, setCurrentStep] = React.useState(1);
  const [clustersPage, setClustersPage] = React.useState(1);
  const [clustersPerPage, setClustersPerPage] = React.useState(10);
  
  // Step 1: Resources - Hierarchical progressive disclosure (default to scoped/clusters as most common)
  const [primaryScope, setPrimaryScope] = React.useState<'everything' | 'scoped'>('scoped');
  const [resourceScope, setResourceScope] = React.useState<'everything' | 'cluster-set' | 'clusters' | 'projects' | 'common-project'>('clusters');
  
  // For "Specific project(s)" - selected cluster for filtering projects
  const [selectedProjectCluster, setSelectedProjectCluster] = React.useState<number | null>(null);
  const [isProjectClusterDropdownOpen, setIsProjectClusterDropdownOpen] = React.useState(false);
  
  // For "Common projects" - track which cluster combination is being used
  const [lockedClusterCombination, setLockedClusterCombination] = React.useState<string[] | null>(null);
  
  // Cluster sets selection
  const [selectedClusterSets, setSelectedClusterSets] = React.useState<number[]>([]);
  const [clusterSetSearch, setClusterSetSearch] = React.useState('');
  const [isClusterSetFilterOpen, setIsClusterSetFilterOpen] = React.useState(false);
  const [clusterSetFilterType, setClusterSetFilterType] = React.useState<string[]>([]);
  const [isBulkSelectOpen, setIsBulkSelectOpen] = React.useState(false);
  
  // Clusters selection (can be multiple)
  const [selectedClusters, setSelectedClusters] = React.useState<number[]>([]);
  const [clusterSearch, setClusterSearch] = React.useState('');
  const [isClusterFilterOpen, setIsClusterFilterOpen] = React.useState(false);
  const [clusterFilterType, setClusterFilterType] = React.useState('Name');
  
  // Projects selection
  const [selectedProjects, setSelectedProjects] = React.useState<number[]>([]);
  const [projectSearch, setProjectSearch] = React.useState('');
  const [isProjectFilterOpen, setIsProjectFilterOpen] = React.useState(false);
  const [projectFilterType, setProjectFilterType] = React.useState('Name');
  const [projectsPage, setProjectsPage] = React.useState(1);
  const [projectsPerPage, setProjectsPerPage] = React.useState(10);
  const [isProjectsBulkSelectOpen, setIsProjectsBulkSelectOpen] = React.useState(false);
  
  // Per-cluster project selection (for row actions)
  const [clusterProjectSelections, setClusterProjectSelections] = React.useState<Record<number, number[]>>({});
  
  // Project selection drawer
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = React.useState(false);
  const [currentClusterForProjects, setCurrentClusterForProjects] = React.useState<number | null>(null);
  const [drawerProjectsPage, setDrawerProjectsPage] = React.useState(1);
  const [drawerProjectsPerPage, setDrawerProjectsPerPage] = React.useState(10);
  const [drawerProjectSearch, setDrawerProjectSearch] = React.useState('');
  const [drawerProjectFilter, setDrawerProjectFilter] = React.useState('Name');
  const [isDrawerProjectFilterOpen, setIsDrawerProjectFilterOpen] = React.useState(false);
  const [tempProjectSelections, setTempProjectSelections] = React.useState<number[]>([]);
  const [isDrawerBulkSelectOpen, setIsDrawerBulkSelectOpen] = React.useState(false);
  
  // Substep tracking (showClusterSelection true by default since clusters is the default)
  const [showClusterSetSelection, setShowClusterSetSelection] = React.useState(false);
  const [showClusterSelection, setShowClusterSelection] = React.useState(true);
  const [showScopeSelection, setShowScopeSelection] = React.useState(false);
  const [showProjectSelection, setShowProjectSelection] = React.useState(false);
  const [showProjectScopeSubstep, setShowProjectScopeSubstep] = React.useState(false);
  const [projectScope, setProjectScope] = React.useState<'all' | 'specific'>('all');
  
  // Active substep tracking
  const [activeSubstep, setActiveSubstep] = React.useState<'clusters' | 'scope'>('clusters');
  
  // Step 2: Select role
  const [selectedRole, setSelectedRole] = React.useState<number | null>(null);
  const [roleSearch, setRoleSearch] = React.useState('');
  const [isRoleFilterOpen, setIsRoleFilterOpen] = React.useState(false);
  const [roleFilterType, setRoleFilterType] = React.useState('Category');
  const [rolesPage, setRolesPage] = React.useState(1);
  const [rolesPerPage, setRolesPerPage] = React.useState(10);

  // Filtered lists
  const filteredClusters = mockClusters.filter(cluster => {
    const matchesSearch = cluster.name.toLowerCase().includes(clusterSearch.toLowerCase());
    const matchesClusterSet = clusterSetFilterType.length === 0 || clusterSetFilterType.includes(cluster.clusterSet);
    return matchesSearch && matchesClusterSet;
  });

  // Available projects count (without search filter) for selected clusters
  const availableProjectsCount = React.useMemo(() => {
    if (selectedClusters.length === 0) return 0;
    
    if (selectedClusters.length === 1) {
      // Single cluster: Count all projects from that cluster
      return mockProjects.filter(project => 
        project.clusterId === selectedClusters[0]
      ).length;
    } else {
      // Multiple clusters: Count common projects
      const projectsByName = mockProjects.reduce((acc, project) => {
        if (selectedClusters.includes(project.clusterId!)) {
          if (!acc[project.name]) {
            acc[project.name] = [];
          }
          acc[project.name].push(project);
        }
        return acc;
      }, {} as Record<string, typeof mockProjects>);
      
      return Object.values(projectsByName)
        .filter(projects => projects.length === selectedClusters.length)
        .length;
    }
  }, [selectedClusters]);

  // Auto-switch to "all" if no projects available and user had "specific" selected
  React.useEffect(() => {
    if (availableProjectsCount === 0 && projectScope === 'specific') {
      setProjectScope('all');
    }
  }, [availableProjectsCount, projectScope]);


  // Filtered projects based on selected clusters and search
  const filteredProjects = React.useMemo(() => {
    if (selectedClusters.length === 0) return [];
    
    let projectsList: typeof mockProjects = [];
    
    if (selectedClusters.length === 1) {
      // Single cluster: Show all projects from that cluster
      projectsList = mockProjects.filter(project => 
        project.clusterId === selectedClusters[0]
      );
    } else {
      // Multiple clusters: Show common projects (projects that exist on all selected clusters)
      // Group projects by name
      const projectsByName = mockProjects.reduce((acc, project) => {
        if (selectedClusters.includes(project.clusterId!)) {
          if (!acc[project.name]) {
            acc[project.name] = [];
          }
          acc[project.name].push(project);
        }
        return acc;
      }, {} as Record<string, typeof mockProjects>);
      
      // Find projects that appear on all selected clusters
      projectsList = Object.entries(projectsByName)
        .filter(([_, projects]) => projects.length === selectedClusters.length)
        .map(([_, projects]) => projects[0]); // Take the first instance
    }
    
    // Apply search filter
    return projectsList.filter(project =>
      project.name.toLowerCase().includes(projectSearch.toLowerCase())
    );
  }, [selectedClusters, projectSearch]);

  // Filtered projects for drawer (specific to current cluster)
  const drawerFilteredProjects = currentClusterForProjects 
    ? mockProjects.filter(project => 
        project.clusterId === currentClusterForProjects &&
        project.name.toLowerCase().includes(drawerProjectSearch.toLowerCase())
      )
    : [];

  const filteredRoles = mockRoles.filter(role => {
    const matchesSearch = role.displayName.toLowerCase().includes(roleSearch.toLowerCase()) ||
                         role.name.toLowerCase().includes(roleSearch.toLowerCase());
    return matchesSearch;
  });

  const paginatedRoles = filteredRoles.slice(
    (rolesPage - 1) * rolesPerPage,
    rolesPage * rolesPerPage
  );

  const handleCancel = () => {
    navigate(returnPath);
  };

  const handleComplete = () => {
    // Create the role assignment
    const selectedRoleData = mockRoles.find(r => r.id === selectedRole);
    
    // Navigate back with success state
    navigate(returnPath, { 
      state: { 
        roleAssignmentCreated: true,
        wizardData: {
          resourceScope,
          primaryScope,
          selectedClusters,
          selectedClusterSets,
          selectedProjects,
          roleName: selectedRoleData?.displayName || 'Unknown Role'
        }
      } 
    });
  };

  const canProceedToStep2 = () => {
    // User must select at least one cluster
    return selectedClusters.length > 0;
  };

  const canProceedToStep3 = () => {
    return selectedRole !== null;
  };

  // Drawer handlers
  const handleOpenProjectDrawer = (clusterId: number) => {
    setCurrentClusterForProjects(clusterId);
    setTempProjectSelections(clusterProjectSelections[clusterId] || []);
    setDrawerProjectSearch('');
    setDrawerProjectsPage(1);
    setIsProjectDrawerOpen(true);
  };

  const handleApplyProjectSelections = () => {
    if (currentClusterForProjects !== null) {
      setClusterProjectSelections({
        ...clusterProjectSelections,
        [currentClusterForProjects]: tempProjectSelections,
      });
      // Update global selected projects count
      const allProjectIds = Object.values({
        ...clusterProjectSelections,
        [currentClusterForProjects]: tempProjectSelections,
      }).flat();
      setSelectedProjects(allProjectIds);
    }
    setIsProjectDrawerOpen(false);
  };

  const handleCancelProjectDrawer = () => {
    setIsProjectDrawerOpen(false);
    setTempProjectSelections([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header Section: Breadcrumb, Title, and Description */}
      <div 
        style={{ 
          backgroundColor: '#f0f0f0', 
          borderBottom: '1px solid #d2d2d2',
          flexShrink: 0
        }}>
        <div style={{
          padding: '32px 40px',
          margin: 0
        }}>
          <Breadcrumb style={{ marginBottom: '20px' }}>
            <BreadcrumbItem to="/user-management/identities">Identities</BreadcrumbItem>
            <BreadcrumbItem to={`/user-management/groups/${groupName}`}>{groupName}</BreadcrumbItem>
            <BreadcrumbItem isActive>Create role assignment</BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h1" size="2xl" style={{ marginBottom: '12px', marginTop: 0 }}>
            Create role assignment for {groupName}
          </Title>
          <Content component="p" style={{ margin: 0, color: '#6a6e73', fontSize: '14px' }}>
            Grant role-based access to resources for this group
          </Content>
        </div>
      </div>

      {/* Wizard Steps Container */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left sidebar - Steps navigation - Always visible */}
        <div style={{ 
          width: '240px',
          flexShrink: 0,
          borderRight: '1px solid #d2d2d2',
          padding: '2rem',
          backgroundColor: '#ffffff',
          overflow: 'visible',
          alignSelf: 'stretch'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px', 
                    backgroundColor: currentStep === 1 ? '#f0f0f0' : 'transparent',
                    borderRadius: '6px',
                    cursor: currentStep > 1 ? 'pointer' : 'default'
                  }}
                  onClick={() => {
                    if (currentStep > 1) {
                      setCurrentStep(1);
                      setActiveSubstep('clusters');
                    }
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: currentStep === 1 ? '#0066cc' : 'transparent',
                    color: currentStep === 1 ? '#ffffff' : '#151515',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    1
                  </div>
                  <span style={{ 
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#151515'
                  }}>
                    Scope
                  </span>
                </div>
                
                {/* Substeps under Scope */}
                <div 
                  style={{ 
                    padding: '8px 12px 8px 48px',
                    backgroundColor: currentStep === 1 && activeSubstep === 'clusters' ? '#f0f0f0' : 'transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => {
                    setCurrentStep(1);
                    setActiveSubstep('clusters');
                  }}
                  onMouseEnter={(e) => {
                    if (!(currentStep === 1 && activeSubstep === 'clusters')) {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(currentStep === 1 && activeSubstep === 'clusters')) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ 
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#151515'
                  }}>
                    Select clusters
                  </span>
                </div>
                
                <div 
                  style={{ 
                    padding: '8px 12px 8px 48px',
                    backgroundColor: currentStep === 1 && activeSubstep === 'scope' ? '#f0f0f0' : 'transparent',
                    borderRadius: '6px',
                    cursor: selectedClusters.length > 0 ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s',
                    opacity: selectedClusters.length > 0 ? 1 : 0.5
                  }}
                  onClick={() => {
                    if (selectedClusters.length > 0) {
                      setCurrentStep(1);
                      setActiveSubstep('scope');
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (selectedClusters.length > 0 && !(currentStep === 1 && activeSubstep === 'scope')) {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedClusters.length > 0 && !(currentStep === 1 && activeSubstep === 'scope')) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ 
                    fontSize: '14px',
                    fontWeight: 400,
                    color: selectedClusters.length > 0 ? '#151515' : '#6a6e73'
                  }}>
                    Define granularity
                  </span>
                </div>
                
                <div 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px', 
                    backgroundColor: currentStep === 2 ? '#f0f0f0' : 'transparent',
                    borderRadius: '6px',
                    cursor: currentStep > 2 ? 'pointer' : 'default'
                  }}
                  onClick={() => {
                    if (currentStep > 2) {
                      setCurrentStep(2);
                    }
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: currentStep === 2 ? '#0066cc' : 'transparent',
                    color: currentStep === 2 ? '#ffffff' : currentStep < 2 ? '#6a6e73' : '#151515',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    2
                  </div>
                  <span style={{ 
                    fontSize: '14px',
                    fontWeight: 400,
                    color: currentStep < 2 ? '#6a6e73' : '#151515'
                  }}>
                    Role
                  </span>
                </div>
                <div 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px', 
                    backgroundColor: currentStep === 3 ? '#f0f0f0' : 'transparent',
                    borderRadius: '6px',
                    cursor: currentStep > 3 ? 'pointer' : 'default'
                  }}
                  onClick={() => {
                    if (currentStep > 3) {
                      setCurrentStep(3);
                    }
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: currentStep === 3 ? '#0066cc' : 'transparent',
                    color: currentStep === 3 ? '#ffffff' : currentStep < 3 ? '#6a6e73' : '#151515',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    3
                  </div>
                  <span style={{ 
                    fontSize: '14px',
                    fontWeight: 400,
                    color: currentStep < 3 ? '#6a6e73' : '#151515'
                  }}>
                    Review
                  </span>
                </div>
              </div>
        </div>

        {/* Main content area with Drawer */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
          <Drawer isExpanded={isProjectDrawerOpen} style={{ flex: 1 }} position="right">
            <DrawerContent
              style={{ width: '100%', height: '100%' }}
              panelContent={
                <DrawerPanelContent 
                  widths={{ default: 'width_50' }}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  <DrawerHead>
                    <Title headingLevel="h2" size="xl">
                      {selectedClusters.length === 1 ? 'Select projects' : 'Select common projects'}
                    </Title>
                    <Content component="p" style={{ marginTop: '4px', color: '#6a6e73', fontSize: '14px' }}>
                      {selectedClusters.length === 1 
                        ? `Choose specific projects from ${mockClusters.find(c => c.id === currentClusterForProjects)?.name}`
                        : `Choose projects that exist across ${selectedClusters.length} selected clusters`
                      }
                    </Content>
                    <DrawerActions>
                      <DrawerCloseButton onClick={handleCancelProjectDrawer} />
                    </DrawerActions>
                  </DrawerHead>
                  <DrawerPanelBody hasNoPadding style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '1rem', minHeight: 0, overflow: 'hidden' }}>
                    {/* Toolbar */}
                    <Toolbar style={{ flexShrink: 0 }}>
                      <ToolbarContent>
                        {/* Bulk selector */}
                        <ToolbarItem>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d2d2d2', borderRadius: '4px', height: '36px' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              padding: '0 12px',
                              borderRight: '1px solid #d2d2d2'
                            }}>
                              <input
                                type="checkbox"
                                id="drawer-bulk-select-checkbox"
                                checked={tempProjectSelections.length === drawerFilteredProjects.length && drawerFilteredProjects.length > 0}
                                ref={(input) => {
                                  if (input) {
                                    input.indeterminate = tempProjectSelections.length > 0 && tempProjectSelections.length < drawerFilteredProjects.length;
                                  }
                                }}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTempProjectSelections(drawerFilteredProjects.map(p => p.id));
                                  } else {
                                    setTempProjectSelections([]);
                                  }
                                }}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer',
                                  accentColor: '#0066cc'
                                }}
                              />
                              <span style={{ marginLeft: '8px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                {tempProjectSelections.length > 0 
                                  ? `${tempProjectSelections.length} selected` 
                                  : '0 selected'}
                              </span>
                            </div>
                            <Dropdown
                              isOpen={isDrawerBulkSelectOpen}
                              onSelect={() => setIsDrawerBulkSelectOpen(false)}
                              onOpenChange={(isOpen: boolean) => setIsDrawerBulkSelectOpen(isOpen)}
                              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle 
                                  ref={toggleRef}
                                  onClick={() => setIsDrawerBulkSelectOpen(!isDrawerBulkSelectOpen)}
                                  isExpanded={isDrawerBulkSelectOpen}
                                  variant="plain"
                                  style={{ 
                                    border: 'none',
                                    minWidth: '44px',
                                    padding: '0 8px'
                                  }}
                                >
                                  <CaretDownIcon />
                                </MenuToggle>
                              )}
                              shouldFocusToggleOnSelect
                            >
                              <DropdownList>
                                <DropdownItem onClick={() => setTempProjectSelections([])}>
                                  Select none (0 items)
                                </DropdownItem>
                                <DropdownItem onClick={() => {
                                  const currentPageStart = (drawerProjectsPage - 1) * drawerProjectsPerPage;
                                  const currentPageEnd = currentPageStart + drawerProjectsPerPage;
                                  const pageItems = drawerFilteredProjects.slice(currentPageStart, currentPageEnd);
                                  setTempProjectSelections(pageItems.map(p => p.id));
                                }}>
                                  Select page ({Math.min(drawerProjectsPerPage, drawerFilteredProjects.length - (drawerProjectsPage - 1) * drawerProjectsPerPage)} items)
                                </DropdownItem>
                                <DropdownItem onClick={() => setTempProjectSelections(drawerFilteredProjects.map(p => p.id))}>
                                  Select all ({drawerFilteredProjects.length} items)
                                </DropdownItem>
                              </DropdownList>
                            </Dropdown>
                          </div>
                        </ToolbarItem>

                        {/* Filter */}
                        <ToolbarItem>
                          <Dropdown
                            isOpen={isDrawerProjectFilterOpen}
                            onSelect={() => setIsDrawerProjectFilterOpen(false)}
                            onOpenChange={(isOpen: boolean) => setIsDrawerProjectFilterOpen(isOpen)}
                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                              <MenuToggle 
                                ref={toggleRef} 
                                onClick={() => setIsDrawerProjectFilterOpen(!isDrawerProjectFilterOpen)} 
                                isExpanded={isDrawerProjectFilterOpen}
                                variant="default"
                                icon={<FilterIcon />}
                              >
                                {drawerProjectFilter}
                              </MenuToggle>
                            )}
                            shouldFocusToggleOnSelect
                          >
                            <DropdownList>
                              <DropdownItem onClick={() => { setDrawerProjectFilter('Name'); setIsDrawerProjectFilterOpen(false); }}>
                                Name
                              </DropdownItem>
                            </DropdownList>
                          </Dropdown>
                        </ToolbarItem>

                        {/* Search */}
                        <ToolbarItem>
                          <SearchInput
                            placeholder="Search projects"
                            value={drawerProjectSearch}
                            onChange={(_event, value) => setDrawerProjectSearch(value)}
                            onClear={() => setDrawerProjectSearch('')}
                          />
                        </ToolbarItem>

                        {/* Pagination */}
                        <ToolbarItem align={{ default: 'alignEnd' }}>
                          <Pagination
                            itemCount={drawerFilteredProjects.length}
                            perPage={drawerProjectsPerPage}
                            page={drawerProjectsPage}
                            onSetPage={(_event, pageNumber) => setDrawerProjectsPage(pageNumber)}
                            onPerPageSelect={(_event, perPage) => {
                              setDrawerProjectsPerPage(perPage);
                              setDrawerProjectsPage(1);
                            }}
                            variant="top"
                            isCompact
                          />
                        </ToolbarItem>
                      </ToolbarContent>
                    </Toolbar>

                    {/* Projects Table */}
                    <div style={{ flex: 1, overflow: 'auto', marginTop: '1rem', minHeight: 0 }}>
                      {drawerFilteredProjects.length === 0 ? (
                        <div style={{ 
                          padding: '3rem', 
                          textAlign: 'center', 
                          color: '#6a6e73',
                          fontSize: '14px'
                        }}>
                          {drawerProjectSearch 
                            ? 'No projects match your search.' 
                            : 'No projects found for this cluster.'}
                        </div>
                      ) : (
                        <Table aria-label="Projects table" variant="compact">
                          <Thead>
                            <Tr>
                              <Th width={10}></Th>
                              <Th>Project name</Th>
                              <Th>Status</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {drawerFilteredProjects
                              .slice((drawerProjectsPage - 1) * drawerProjectsPerPage, drawerProjectsPage * drawerProjectsPerPage)
                              .map((project) => (
                              <Tr
                                key={project.id}
                                isSelectable
                                isClickable
                                isRowSelected={tempProjectSelections.includes(project.id)}
                                onRowClick={() => {
                                  if (tempProjectSelections.includes(project.id)) {
                                    setTempProjectSelections(tempProjectSelections.filter(id => id !== project.id));
                                  } else {
                                    setTempProjectSelections([...tempProjectSelections, project.id]);
                                  }
                                }}
                              >
                                <Td>
                                  <Checkbox
                                    id={`drawer-project-${project.id}`}
                                    isChecked={tempProjectSelections.includes(project.id)}
                                    onChange={() => {
                                      if (tempProjectSelections.includes(project.id)) {
                                        setTempProjectSelections(tempProjectSelections.filter(id => id !== project.id));
                                      } else {
                                        setTempProjectSelections([...tempProjectSelections, project.id]);
                                      }
                                    }}
                                  />
                                </Td>
                                <Td dataLabel="Project name">{project.name}</Td>
                                <Td dataLabel="Status">
                                  <Label color="green">Active</Label>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      )}

                      {drawerFilteredProjects.length > 0 && (
                        <Pagination
                          itemCount={drawerFilteredProjects.length}
                          perPage={drawerProjectsPerPage}
                          page={drawerProjectsPage}
                          onSetPage={(_event, pageNumber) => setDrawerProjectsPage(pageNumber)}
                          onPerPageSelect={(_event, perPage) => {
                            setDrawerProjectsPerPage(perPage);
                            setDrawerProjectsPage(1);
                          }}
                          variant="bottom"
                          style={{ marginTop: '1rem' }}
                        />
                      )}
                    </div>

                    {/* Drawer Footer Actions */}
                    <div style={{
                      marginTop: 'auto',
                      paddingTop: '1rem',
                      borderTop: '1px solid #d2d2d2',
                      display: 'flex',
                      gap: '1rem',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '14px', color: '#6a6e73' }}>
                        {tempProjectSelections.length} of {drawerFilteredProjects.length} selected
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="secondary" onClick={handleCancelProjectDrawer}>
                          Cancel
                        </Button>
                        <Button variant="primary" onClick={handleApplyProjectSelections}>
                          Apply
                        </Button>
                      </div>
                    </div>
                    </div>
                  </DrawerPanelBody>
                </DrawerPanelContent>
              }
            >
              <DrawerContentBody>
                {/* Content - scrollable with padding */}
                <div style={{ overflowY: 'auto', padding: '1.5rem' }}>
                  {/* STEP 1: SELECT RESOURCES */}
                  {currentStep === 1 && (
                  <div>
                    {/* Substep 1: Select Clusters */}
                    {activeSubstep === 'clusters' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <Title headingLevel="h2" size="xl" style={{ marginBottom: '0.5rem', marginTop: 0 }}>
                        Select clusters
                      </Title>
                      <Content component="p" style={{ margin: 0, color: '#6a6e73', fontSize: '14px', marginBottom: '1rem' }}>
                        Grant access to one or more clusters. Use the cluster set filter to narrow your selection. Optionally, you can further limit access to specific projects on the selected clusters or to common projects shared across multiple clusters.
                      </Content>

                    {/* Unified Clusters Table with filters and actions */}
                    <Toolbar>
                  <ToolbarContent>
                    {/* Bulk selector */}
                        <ToolbarItem>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d2d2d2', borderRadius: '4px', height: '36px' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              padding: '0 12px',
                              borderRight: '1px solid #d2d2d2'
                            }}>
                              <input
                                type="checkbox"
                                id="bulk-select-checkbox"
                                checked={selectedClusters.length === filteredClusters.length && filteredClusters.length > 0}
                                ref={(input) => {
                                  if (input) {
                                    input.indeterminate = selectedClusters.length > 0 && selectedClusters.length < filteredClusters.length;
                                  }
                                }}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedClusters(filteredClusters.map(c => c.id));
                                  } else {
                                    setSelectedClusters([]);
                                  }
                                }}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer',
                                  accentColor: '#0066cc'
                                }}
                              />
                              <span style={{ marginLeft: '8px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                {selectedClusters.length > 0 
                                  ? `${selectedClusters.length} selected` 
                                  : '0 selected'}
                              </span>
                            </div>
                            <Dropdown
                              isOpen={isBulkSelectOpen}
                              onSelect={() => setIsBulkSelectOpen(false)}
                              onOpenChange={(isOpen: boolean) => setIsBulkSelectOpen(isOpen)}
                              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle 
                                  ref={toggleRef}
                                  onClick={() => setIsBulkSelectOpen(!isBulkSelectOpen)}
                                  isExpanded={isBulkSelectOpen}
                                  variant="plain"
                                  style={{ 
                                    border: 'none',
                                    minWidth: '44px',
                                    padding: '0 8px'
                                  }}
                                >
                                  <CaretDownIcon />
                                </MenuToggle>
                              )}
                              shouldFocusToggleOnSelect
                            >
                              <DropdownList>
                                <DropdownItem onClick={() => setSelectedClusters([])}>
                                  Select none (0 items)
                                </DropdownItem>
                                <DropdownItem onClick={() => {
                                  const currentPageStart = (clustersPage - 1) * clustersPerPage;
                                  const currentPageEnd = currentPageStart + clustersPerPage;
                                  const pageItems = filteredClusters.slice(currentPageStart, currentPageEnd);
                                  setSelectedClusters(pageItems.map(c => c.id));
                                }}>
                                  Select page ({Math.min(clustersPerPage, filteredClusters.length - (clustersPage - 1) * clustersPerPage)} items)
                                </DropdownItem>
                                <DropdownItem onClick={() => setSelectedClusters(filteredClusters.map(c => c.id))}>
                                  Select all ({filteredClusters.length} items)
                                </DropdownItem>
                              </DropdownList>
                            </Dropdown>
                          </div>
                        </ToolbarItem>

                    {/* Cluster set filter */}
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isClusterSetFilterOpen}
                        onOpenChange={(isOpen: boolean) => setIsClusterSetFilterOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle 
                            ref={toggleRef} 
                            onClick={() => setIsClusterSetFilterOpen(!isClusterSetFilterOpen)} 
                            isExpanded={isClusterSetFilterOpen}
                            variant="default"
                            icon={<FilterIcon />}
                          >
                            {clusterSetFilterType.length === 0 
                              ? 'All cluster sets' 
                              : clusterSetFilterType.length === 1 
                                ? clusterSetFilterType[0]
                                : `${clusterSetFilterType.length} cluster sets`}
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem 
                            onClick={() => setClusterSetFilterType([])}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <span>All cluster sets</span>
                              {clusterSetFilterType.length === 0 && (
                                <span style={{ color: '#0066cc', marginLeft: '8px' }}>✓</span>
                              )}
                            </div>
                          </DropdownItem>
                          <Divider />
                          {mockClusterSets.map((clusterSet) => (
                            <DropdownItem 
                              key={clusterSet.id}
                              onClick={() => {
                                if (clusterSetFilterType.includes(clusterSet.name)) {
                                  setClusterSetFilterType(clusterSetFilterType.filter(name => name !== clusterSet.name));
                                } else {
                                  setClusterSetFilterType([...clusterSetFilterType, clusterSet.name]);
                                }
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <span>{clusterSet.name}</span>
                                {clusterSetFilterType.includes(clusterSet.name) && (
                                  <span style={{ color: '#0066cc', marginLeft: '8px' }}>✓</span>
                                )}
                              </div>
                            </DropdownItem>
                          ))}
                        </DropdownList>
                      </Dropdown>
                    </ToolbarItem>

                    {/* Search */}
                    <ToolbarItem>
                      <SearchInput
                        placeholder="Search clusters"
                        value={clusterSearch}
                        onChange={(_event, value) => setClusterSearch(value)}
                        onClear={() => setClusterSearch('')}
                      />
                    </ToolbarItem>

                    {/* Pagination */}
                    <ToolbarItem align={{ default: 'alignEnd' }}>
                      <Pagination
                        itemCount={filteredClusters.length}
                        perPage={clustersPerPage}
                        page={clustersPage}
                        onSetPage={(_event, pageNumber) => setClustersPage(pageNumber)}
                        onPerPageSelect={(_event, perPage) => {
                          setClustersPerPage(perPage);
                          setClustersPage(1);
                        }}
                        variant="top"
                        isCompact
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>

                {/* Clusters Table */}
                <Table aria-label="Clusters table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th width={10}></Th>
                      <Th>Name</Th>
                      <Th>Cluster set</Th>
                      <Th>Status</Th>
                      <Th>Infrastructure</Th>
                      <Th>Control plane type</Th>
                      <Th>Distribution version</Th>
                      <Th>Labels</Th>
                      <Th>Nodes</Th>
                      <Th>Add-ons</Th>
                      <Th>Creation date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredClusters
                      .slice((clustersPage - 1) * clustersPerPage, clustersPage * clustersPerPage)
                      .map((cluster) => (
                      <Tr
                        key={cluster.id}
                        isSelectable
                        isClickable
                        isRowSelected={selectedClusters.includes(cluster.id)}
                        onRowClick={() => {
                          if (selectedClusters.includes(cluster.id)) {
                            setSelectedClusters(selectedClusters.filter(id => id !== cluster.id));
                          } else {
                            setSelectedClusters([...selectedClusters, cluster.id]);
                          }
                        }}
                      >
                        <Td>
                          <Checkbox
                            id={`cluster-${cluster.id}`}
                            isChecked={selectedClusters.includes(cluster.id)}
                            onChange={() => {
                              if (selectedClusters.includes(cluster.id)) {
                                setSelectedClusters(selectedClusters.filter(id => id !== cluster.id));
                              } else {
                                setSelectedClusters([...selectedClusters, cluster.id]);
                              }
                            }}
                          />
                        </Td>
                        <Td dataLabel="Name">{cluster.name}</Td>
                        <Td dataLabel="Cluster set">{cluster.clusterSet}</Td>
                        <Td dataLabel="Status">
                          <Label color={cluster.status === 'Ready' ? 'green' : 'red'}>{cluster.status}</Label>
                        </Td>
                        <Td dataLabel="Infrastructure">{cluster.infrastructure}</Td>
                        <Td dataLabel="Control plane type">{cluster.controlPlaneType}</Td>
                        <Td dataLabel="Distribution version">
                          <div>
                            {cluster.distribution}
                            {cluster.distributionUpgrade && (
                              <Label color="blue" isCompact style={{ marginLeft: '8px' }}>
                                Upgrade available
                              </Label>
                            )}
                          </div>
                        </Td>
                        <Td dataLabel="Labels">{cluster.labels}</Td>
                        <Td dataLabel="Nodes">{cluster.nodes}</Td>
                        <Td dataLabel="Add-ons">{cluster.addOns}</Td>
                        <Td dataLabel="Creation date">{cluster.creationDate}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Pagination
                  itemCount={filteredClusters.length}
                  perPage={clustersPerPage}
                  page={clustersPage}
                  onSetPage={(_event, pageNumber) => setClustersPage(pageNumber)}
                  onPerPageSelect={(_event, perPage) => {
                    setClustersPerPage(perPage);
                    setClustersPage(1);
                  }}
                  variant="bottom"
                />
                    </div>
                    )}
                
                {/* Substep 2: Define Granularity */}
                {activeSubstep === 'scope' && selectedClusters.length > 0 && (
                  <div id="define-project-scope" style={{ marginBottom: '1.5rem', scrollMarginTop: '2rem' }}>
                    <Title headingLevel="h2" size="xl" style={{ marginBottom: '0.5rem', marginTop: 0 }}>
                      Define granularity
                    </Title>
                    
                    <Content component="p" style={{ margin: 0, marginBottom: '1rem', color: '#6a6e73', fontSize: '14px' }}>
                      Grant permissions to specific projects of a cluster or common projects across clusters.
                    </Content>
                    
                    <div style={{ marginBottom: '0' }}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <Radio
                          id="project-scope-all"
                          name="project-scope"
                          label="Cluster role assignment"
                          isChecked={projectScope === 'all'}
                          onChange={() => setProjectScope('all')}
                          description={
                            selectedClusters.length === 1 
                              ? <span>Grant access to <span style={{ fontWeight: 500 }}>all current and future resources</span> on the selected cluster.</span>
                              : <span>Grant access to <span style={{ fontWeight: 500 }}>all current and future resources</span> on the selected clusters.</span>
                          }
                        />
                      </div>
                      <div>
                        <Radio
                          id="project-scope-specific"
                          name="project-scope"
                          label={
                            selectedClusters.length === 1 
                              ? "Project role assignment" 
                              : "Common projects role assignment"
                          }
                          isChecked={projectScope === 'specific'}
                          onChange={() => setProjectScope('specific')}
                          isDisabled={availableProjectsCount === 0}
                          description={
                            availableProjectsCount === 0
                              ? (selectedClusters.length === 1 
                                  ? "No projects available on this cluster"
                                  : "No common projects found across the selected clusters")
                              : (selectedClusters.length === 1 
                                  ? <span>Grant access to <span style={{ fontWeight: 500 }}>specific projects</span> on the cluster.</span>
                                  : "Grant access to projects with the same name across selected clusters.")
                          }
                        />
                      </div>
                    </div>
                    
                    {/* Projects table appears below when specific/common projects is selected */}
                    {projectScope === 'specific' && availableProjectsCount > 0 && (
                  <div id="select-projects" style={{ marginTop: '1.5rem' }}>
                        <div>
                    {/* Projects Toolbar */}
                    <Toolbar>
                      <ToolbarContent>
                        {/* Bulk selector */}
                        <ToolbarItem>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d2d2d2', borderRadius: '4px', height: '36px' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              padding: '0 12px',
                              borderRight: '1px solid #d2d2d2'
                            }}>
                              <input
                                type="checkbox"
                                id="projects-bulk-select-checkbox"
                                checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                                ref={(input) => {
                                  if (input) {
                                    input.indeterminate = selectedProjects.length > 0 && selectedProjects.length < filteredProjects.length;
                                  }
                                }}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProjects(filteredProjects.map(p => p.id));
                                  } else {
                                    setSelectedProjects([]);
                                  }
                                }}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer',
                                  accentColor: '#0066cc'
                                }}
                              />
                              <span style={{ marginLeft: '8px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                {selectedProjects.length > 0 
                                  ? `${selectedProjects.length} selected` 
                                  : '0 selected'}
                              </span>
                            </div>
                            <Dropdown
                              isOpen={isProjectsBulkSelectOpen}
                              onSelect={() => setIsProjectsBulkSelectOpen(false)}
                              onOpenChange={(isOpen: boolean) => setIsProjectsBulkSelectOpen(isOpen)}
                              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle 
                                  ref={toggleRef}
                                  onClick={() => setIsProjectsBulkSelectOpen(!isProjectsBulkSelectOpen)}
                                  isExpanded={isProjectsBulkSelectOpen}
                                  variant="plain"
                                  style={{ 
                                    border: 'none',
                                    minWidth: '44px',
                                    padding: '0 8px'
                                  }}
                                >
                                  <CaretDownIcon />
                                </MenuToggle>
                              )}
                              shouldFocusToggleOnSelect
                            >
                              <DropdownList>
                                <DropdownItem onClick={() => setSelectedProjects([])}>
                                  Select none (0 items)
                                </DropdownItem>
                                <DropdownItem onClick={() => {
                                  const currentPageStart = (projectsPage - 1) * projectsPerPage;
                                  const currentPageEnd = currentPageStart + projectsPerPage;
                                  const pageItems = filteredProjects.slice(currentPageStart, currentPageEnd);
                                  setSelectedProjects(pageItems.map(p => p.id));
                                }}>
                                  Select page ({Math.min(projectsPerPage, filteredProjects.length - (projectsPage - 1) * projectsPerPage)} items)
                                </DropdownItem>
                                <DropdownItem onClick={() => setSelectedProjects(filteredProjects.map(p => p.id))}>
                                  Select all ({filteredProjects.length} items)
                                </DropdownItem>
                              </DropdownList>
                            </Dropdown>
                          </div>
                        </ToolbarItem>
                        
                        {/* Filter */}
                        <ToolbarItem>
                          <Dropdown
                            isOpen={isProjectFilterOpen}
                            onSelect={() => setIsProjectFilterOpen(false)}
                            onOpenChange={(isOpen: boolean) => setIsProjectFilterOpen(isOpen)}
                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                              <MenuToggle 
                                ref={toggleRef} 
                                onClick={() => setIsProjectFilterOpen(!isProjectFilterOpen)} 
                                isExpanded={isProjectFilterOpen}
                                variant="default"
                                icon={<FilterIcon />}
                              >
                                {projectFilterType}
                              </MenuToggle>
                            )}
                            shouldFocusToggleOnSelect
                          >
                            <DropdownList>
                              <DropdownItem onClick={() => { setProjectFilterType('Name'); setIsProjectFilterOpen(false); }}>
                                Name
                              </DropdownItem>
                            </DropdownList>
                          </Dropdown>
                        </ToolbarItem>
                        
                        {/* Search */}
                        <ToolbarItem>
                          <SearchInput
                            placeholder="Search projects"
                            value={projectSearch}
                            onChange={(_event, value) => setProjectSearch(value)}
                            onClear={() => setProjectSearch('')}
                          />
                        </ToolbarItem>
                        
                        {/* Pagination */}
                        <ToolbarItem align={{ default: 'alignEnd' }}>
                          <Pagination
                            itemCount={filteredProjects.length}
                            perPage={projectsPerPage}
                            page={projectsPage}
                            onSetPage={(_event, pageNumber) => setProjectsPage(pageNumber)}
                            onPerPageSelect={(_event, perPage) => {
                              setProjectsPerPage(perPage);
                              setProjectsPage(1);
                            }}
                            variant="top"
                            isCompact
                          />
                        </ToolbarItem>
                      </ToolbarContent>
                    </Toolbar>
                    
                    {/* Projects Table */}
                    <Table aria-label="Projects table" variant="compact">
                      <Thead>
                        <Tr>
                          <Th width={10}></Th>
                          <Th>Project name</Th>
                          {selectedClusters.length > 1 && <Th>Clusters</Th>}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredProjects.length === 0 ? (
                          <Tr>
                            <Td colSpan={selectedClusters.length > 1 ? 3 : 2}>
                              <div style={{ textAlign: 'center', padding: '2rem', color: '#6a6e73' }}>
                                {selectedClusters.length > 1 
                                  ? 'No common projects found across the selected clusters'
                                  : 'No projects found'
                                }
                              </div>
                            </Td>
                          </Tr>
                        ) : (
                          filteredProjects
                            .slice((projectsPage - 1) * projectsPerPage, projectsPage * projectsPerPage)
                            .map((project) => (
                            <Tr 
                              key={project.id}
                              isSelectable
                              isClickable
                              isRowSelected={selectedProjects.includes(project.id)}
                              onRowClick={() => {
                                if (selectedProjects.includes(project.id)) {
                                  setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                                } else {
                                  setSelectedProjects([...selectedProjects, project.id]);
                                }
                              }}
                            >
                              <Td>
                                <Checkbox
                                  id={`project-${project.id}`}
                                  isChecked={selectedProjects.includes(project.id)}
                                  onChange={() => {
                                    if (selectedProjects.includes(project.id)) {
                                      setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                                    } else {
                                      setSelectedProjects([...selectedProjects, project.id]);
                                    }
                                  }}
                                />
                              </Td>
                              <Td dataLabel="Project name">{project.name}</Td>
                              {selectedClusters.length > 1 && (
                                <Td dataLabel="Clusters">
                                  {mockClusters
                                    .filter(c => selectedClusters.includes(c.id))
                                    .map(c => c.name)
                                    .join(', ')}
                                </Td>
                              )}
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                    
                    <Pagination
                      itemCount={filteredProjects.length}
                      perPage={projectsPerPage}
                      page={projectsPage}
                      onSetPage={(_event, pageNumber) => setProjectsPage(pageNumber)}
                      onPerPageSelect={(_event, perPage) => {
                        setProjectsPerPage(perPage);
                        setProjectsPage(1);
                      }}
                      variant="bottom"
                    />
                        </div>
                  </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: SELECT ROLE */}
            {currentStep === 2 && (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <Title headingLevel="h2" size="xl" style={{ marginBottom: '0.5rem', marginTop: 0 }}>
                    Role
                  </Title>
                  <Content component="p" style={{ margin: 0, color: '#6a6e73', fontSize: '14px' }}>
                    Choose the role to assign to this group for the selected resources.
                  </Content>
                </div>
                
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isRoleFilterOpen}
                        onSelect={() => setIsRoleFilterOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsRoleFilterOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle 
                            ref={toggleRef} 
                            onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)} 
                            isExpanded={isRoleFilterOpen}
                            variant="default"
                            icon={<FilterIcon />}
                          >
                            {roleFilterType}
                          </MenuToggle>
                        )}
                        shouldFocusToggleOnSelect
                      >
                        <DropdownList>
                          <DropdownItem onClick={() => { setRoleFilterType('Category'); setIsRoleFilterOpen(false); }}>
                            Category
                          </DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </ToolbarItem>
                    <ToolbarItem>
                      <SearchInput
                        placeholder="Search roles"
                        value={roleSearch}
                        onChange={(_event, value) => setRoleSearch(value)}
                        onClear={() => setRoleSearch('')}
                      />
                    </ToolbarItem>
                    <ToolbarItem align={{ default: 'alignEnd' }}>
                      <Pagination
                        itemCount={mockRoles.length}
                        perPage={rolesPerPage}
                        page={rolesPage}
                        onSetPage={(_event, pageNumber) => setRolesPage(pageNumber)}
                        onPerPageSelect={(_event, perPage) => {
                          setRolesPerPage(perPage);
                          setRolesPage(1);
                        }}
                        variant="top"
                        isCompact
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>
                
                <Table aria-label="Roles table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th width={10}></Th>
                      <Th>Role</Th>
                      <Th>Description</Th>
                      <Th>Category</Th>
                      <Th>Type</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {mockRoles
                      .slice((rolesPage - 1) * rolesPerPage, rolesPage * rolesPerPage)
                      .map((role) => (
                      <Tr
                        key={role.id}
                        isSelectable
                        isClickable
                        isRowSelected={selectedRole === role.id}
                        onRowClick={() => setSelectedRole(role.id)}
                      >
                        <Td>
                          <Radio
                            id={`role-${role.id}`}
                            name="role-selection"
                            isChecked={selectedRole === role.id}
                            onChange={() => setSelectedRole(role.id)}
                          />
                        </Td>
                        <Td dataLabel="Role">
                          <div>
                            <div style={{ fontWeight: 600 }}>{role.displayName}</div>
                            <div style={{ fontSize: '13px', color: '#6a6e73' }}>{role.name}</div>
                          </div>
                        </Td>
                        <Td dataLabel="Description">{role.description}</Td>
                        <Td dataLabel="Category">{role.category}</Td>
                        <Td dataLabel="Type">
                          <Label color={role.type === 'Default' ? 'blue' : 'purple'}>
                            {role.type}
                          </Label>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Pagination
                  itemCount={mockRoles.length}
                  perPage={rolesPerPage}
                  page={rolesPage}
                  onSetPage={(_event, pageNumber) => setRolesPage(pageNumber)}
                  onPerPageSelect={(_event, perPage) => {
                    setRolesPerPage(perPage);
                    setRolesPage(1);
                  }}
                  variant="bottom"
                />
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {currentStep === 3 && (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <Title headingLevel="h2" size="xl" style={{ marginBottom: '0.5rem', marginTop: 0 }}>
                    Review
                  </Title>
                  <Content component="p" style={{ margin: 0, color: '#6a6e73', fontSize: '14px' }}>
                    Review the role assignment details before creating.
                  </Content>
                </div>
                
                <Card>
                  <CardBody>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: '16px' }}>
                      Assignment details
                    </Title>
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px' }}>
                      <div style={{ fontWeight: 600 }}>Group:</div>
                      <div>{groupName}</div>
                      
                      <div style={{ fontWeight: 600 }}>Role:</div>
                      <div>
                        {selectedRole && mockRoles.find(r => r.id === selectedRole)?.displayName}
                        <div style={{ fontSize: '13px', color: '#6a6e73', marginTop: '4px' }}>
                          {selectedRole && mockRoles.find(r => r.id === selectedRole)?.name}
                        </div>
                      </div>
                      
                      <div style={{ fontWeight: 600 }}>Resources:</div>
                      <div>
                        {selectedClusters.length > 0 && (
                          <div>
                            <strong>Clusters:</strong> {selectedClusters.length} selected
                            <div style={{ fontSize: '13px', color: '#6a6e73', marginTop: '4px' }}>
                              {mockClusters
                                .filter(c => selectedClusters.includes(c.id))
                                .map(c => c.name)
                                .join(', ')}
                            </div>
                          </div>
                        )}
                        {selectedProjects.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <strong>Projects:</strong> {selectedProjects.length} specified
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
                </div>
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>

          {/* Footer actions - outside drawer, at bottom */}
          <div style={{ 
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #d2d2d2',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.12)',
            zIndex: 100,
            flexShrink: 0
          }}>
            {(currentStep > 1 || (currentStep === 1 && activeSubstep === 'scope')) && (
              <Button 
                variant="secondary" 
                onClick={() => {
                  if (currentStep === 1 && activeSubstep === 'scope') {
                    setActiveSubstep('clusters');
                  } else {
                    setCurrentStep(currentStep - 1);
                  }
                }}
              >
                Back
              </Button>
            )}
            {currentStep === 1 && (
              <Button 
                variant="primary" 
                onClick={() => {
                  // Navigate through substeps
                  if (activeSubstep === 'clusters' && selectedClusters.length > 0) {
                    setActiveSubstep('scope');
                  } else if (activeSubstep === 'scope') {
                    setCurrentStep(2);
                  }
                }}
                isDisabled={selectedClusters.length === 0 || (activeSubstep === 'scope' && projectScope === 'specific' && selectedProjects.length === 0)}
              >
                Next
              </Button>
            )}
            {currentStep === 2 && (
              <Button 
                variant="primary" 
                onClick={() => setCurrentStep(3)}
                isDisabled={!canProceedToStep3()}
              >
                Next
              </Button>
            )}
            {currentStep === 3 && (
              <Button 
                variant="primary" 
                onClick={handleComplete}
              >
                Create role assignment
              </Button>
            )}
            <Button 
              variant="link" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
