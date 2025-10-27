import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Title,
  Tabs,
  Tab,
  TabTitleText,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  Content,
  Card,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Pagination,
  PaginationVariant,
  Flex,
  FlexItem,
  Icon,
  Tooltip,
  Label,
  ToolbarGroup,
  Divider,
  ButtonVariant,
  Alert,
  AlertGroup,
  AlertActionCloseButton,
} from '@patternfly/react-core';
import { CubesIcon, FilterIcon, InfoCircleIcon, EllipsisVIcon, CheckIcon, SyncAltIcon } from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td, ActionsColumn } from '@patternfly/react-table';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { GroupRoleAssignmentWizard } from '@app/RoleAssignment/GroupRoleAssignmentWizard';
import { getAllGroups, getUsersByGroup, getAllClusters, getAllClusterSets, getAllNamespaces, getAllRoles } from '@app/data';

const GroupDetail: React.FunctionComponent = () => {
  const { groupName } = useParams<{ groupName: string }>();
  const navigate = useNavigate();
  
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  
  // Role assignments state
  interface RoleAssignment {
    id: string;
    name: string;
    type: 'User' | 'Group';
    clusterSet?: string;
    clusters: string[];
    projects: string[];
    roles: Array<{
      name: string;
      displayName: string;
      category: string;
    }>;
    status: 'Active' | 'Inactive';
    assignedDate: string;
    assignedBy: string;
    origin: string;
  }
  
  const [roleAssignments, setRoleAssignments] = React.useState<RoleAssignment[]>([]);
  const [showSuccessAlert, setShowSuccessAlert] = React.useState(false);
  
  useDocumentTitle(`ACM | ${groupName}`);

  const handleTabClick = (_event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const handleCreateRoleAssignment = () => {
    setIsWizardOpen(true);
  };

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number) => {
    setPerPage(newPerPage);
  };

  const handleWizardComplete = (wizardData: any) => {
    // Get data from database
    const allClusters = getAllClusters();
    const allClusterSets = getAllClusterSets();
    const allNamespaces = getAllNamespaces();
    const allRoles = getAllRoles();
    
    // Create mock mappings like the wizard does (numeric ID to actual data)
    const mockClusters = allClusters.map((cluster, index) => ({
      id: index + 1,
      dbId: cluster.id,
      name: cluster.name,
    }));
    
    const mockProjects = allNamespaces.map((namespace, index) => ({
      id: index + 1,
      name: namespace.name,
    }));
    
    const mockClusterSets = allClusterSets.map((clusterSet, index) => ({
      id: index + 1,
      dbId: clusterSet.id,
      name: clusterSet.name,
    }));
    
    // Extract cluster set name, cluster names and project names from wizard data
    let clusterSetName: string | undefined = undefined;
    const clusterNames: string[] = [];
    const projectNames: string[] = [];
    
    if (wizardData.resourceScope === 'everything') {
      clusterSetName = 'All cluster sets';
      clusterNames.push('All resources');
      projectNames.push('All projects');
    } else if (wizardData.resourceScope === 'cluster-sets') {
      // Handle cluster sets
      if (wizardData.selectedClusterSets && wizardData.selectedClusterSets.length > 0) {
        // Get cluster set name using numeric IDs
        const clusterSetNames = wizardData.selectedClusterSets
          .map((id: number) => mockClusterSets.find(cs => cs.id === id)?.name)
          .filter(Boolean);
        clusterSetName = clusterSetNames.length > 0 ? clusterSetNames.join(', ') : undefined;
        
        if (wizardData.selectedClusters && wizardData.selectedClusters.length > 0) {
          const selectedClusterNames = wizardData.selectedClusters
            .map((id: number) => mockClusters.find(c => c.id === id)?.name)
            .filter(Boolean);
          clusterNames.push(...selectedClusterNames);
          
          if (wizardData.selectedProjects && wizardData.selectedProjects.length > 0) {
            const selectedProjectNames = wizardData.selectedProjects
              .map((id: number) => mockProjects.find(p => p.id === id)?.name)
              .filter(Boolean);
            projectNames.push(...selectedProjectNames);
          } else {
            projectNames.push('All projects');
          }
        } else {
          projectNames.push('All projects');
        }
      }
    } else if (wizardData.resourceScope === 'clusters') {
      // Handle individual clusters
      if (wizardData.selectedClusters && wizardData.selectedClusters.length > 0) {
        const selectedClusterNames = wizardData.selectedClusters
          .map((id: number) => mockClusters.find(c => c.id === id)?.name)
          .filter(Boolean);
        clusterNames.push(...selectedClusterNames);
        
        if (wizardData.selectedProjects && wizardData.selectedProjects.length > 0) {
          const selectedProjectNames = wizardData.selectedProjects
            .map((id: number) => mockProjects.find(p => p.id === id)?.name)
            .filter(Boolean);
          projectNames.push(...selectedProjectNames);
        } else {
          projectNames.push('All projects');
        }
      }
    }
    
    // Get full role information
    const selectedRole = allRoles.find(r => r.name === wizardData.roleName);
    
    const roleInfo = {
      name: selectedRole?.name || wizardData.roleName || 'Unknown Role',
      displayName: selectedRole?.displayName || wizardData.roleName || 'Unknown Role',
      category: selectedRole?.category || 'openshift',
    };
    
    // Create new role assignment
    const newAssignment: RoleAssignment = {
      id: `ra-${Date.now()}`,
      name: groupName || 'Unknown Group',
      type: 'Group',
      clusterSet: clusterSetName,
      clusters: clusterNames.length > 0 ? clusterNames : ['All clusters'],
      projects: projectNames.length > 0 ? projectNames : ['All projects'],
      roles: [roleInfo],
      status: 'Active',
      assignedDate: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
      assignedBy: 'Walter Joseph Kovacs',
      origin: 'Hub cluster',
    };
    
    setRoleAssignments([...roleAssignments, newAssignment]);
    setIsWizardOpen(false);
    setShowSuccessAlert(true);
  };

  const DetailsTab = () => {
    // Get group data from centralized database
    const allGroups = getAllGroups();
    const currentGroup = allGroups.find(g => g.name === groupName);
    const groupUsers = currentGroup ? getUsersByGroup(currentGroup.id) : [];
    
    // Determine sync source and last synced (same logic as GroupsTable)
    const groupIndex = allGroups.findIndex(g => g.name === groupName);
    const isLocal = groupName === 'local-admins' || groupName === 'test-group' || groupIndex % 7 === 0;
    
    const syncSources = ['PeteMobile LDAP', 'PeteMobile SSO', 'GitHub Enterprise'];
    const syncSource = isLocal ? 'Local' : syncSources[groupIndex % syncSources.length];
    
    const syncTimes = ['2 hours ago', '5 hours ago', '1 day ago', '3 days ago', 'Yesterday'];
    const lastSynced = isLocal ? null : syncTimes[groupIndex % syncTimes.length];
    
    return (
      <Card>
        <CardBody>
          <Title headingLevel="h3" size="md" className="pf-v6-u-mb-md">
            General information
          </Title>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>Group name</DescriptionListTerm>
              <DescriptionListDescription>{groupName}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Sync source</DescriptionListTerm>
              <DescriptionListDescription>
                {isLocal ? (
                  <Label color="grey">{syncSource}</Label>
                ) : (
                  <Label color="blue" icon={<SyncAltIcon />}>{syncSource}</Label>
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
            {lastSynced && (
              <DescriptionListGroup>
                <DescriptionListTerm>Last synced</DescriptionListTerm>
                <DescriptionListDescription>{lastSynced}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
            <DescriptionListGroup>
              <DescriptionListTerm>Created</DescriptionListTerm>
              <DescriptionListDescription>2024-01-15</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Number of users</DescriptionListTerm>
              <DescriptionListDescription>{groupUsers.length}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>
    );
  };

  const YAMLTab = () => (
    <Card>
      <CardBody>
        <div style={{ 
          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)', 
          border: '1px solid var(--pf-t--global--border--color--default)', 
          borderRadius: 'var(--pf-t--global--border--radius--medium)',
          padding: 'var(--pf-t--global--spacer--md)',
          fontFamily: 'var(--pf-t--global--font--family--mono)',
          fontSize: 'var(--pf-t--global--font--size--body--sm)',
          lineHeight: 'var(--pf-t--global--font--line-height--body)',
          overflow: 'auto',
          maxHeight: '400px'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`kind: Group
apiVersion: user.openshift.io/v1
metadata:
  name: ${groupName?.toLowerCase().replace(/\s+/g, '-')}
  uid: 78d9f67c-e1da-431c-947a-b053adb39001
  resourceVersion: '9570553'
  creationTimestamp: '2025-07-24T02:08:30Z'
  labels:
    app: frontend
managedFields:
  - manager: htpasswd
    operation: Update
    apiVersion: user.openshift.io/v1
    time: '2025-07-24T02:08:30Z'
    fieldsType: FieldsV1
    fieldsV1:
      f:users: {}
users:
  - user1
  - user2`}
          </pre>
        </div>
      </CardBody>
    </Card>
  );

  const RoleAssignmentsTab = () => {
    const [selectedAssignments, setSelectedAssignments] = React.useState<Set<string>>(new Set());
    const [isBulkActionsOpen, setIsBulkActionsOpen] = React.useState(false);
    const [filterValue, setFilterValue] = React.useState<string>('all');

    const areAllSelected = selectedAssignments.size === roleAssignments.length && roleAssignments.length > 0;
    const areSomeSelected = selectedAssignments.size > 0;

    const handleSelectAll = (isSelecting: boolean) => {
      if (isSelecting) {
        setSelectedAssignments(new Set(roleAssignments.map(a => a.id)));
      } else {
        setSelectedAssignments(new Set());
      }
    };

    const handleSelectAssignment = (assignmentId: string, isSelecting: boolean) => {
      const newSelected = new Set(selectedAssignments);
      if (isSelecting) {
        newSelected.add(assignmentId);
      } else {
        newSelected.delete(assignmentId);
      }
      setSelectedAssignments(newSelected);
    };

    const handleBulkDelete = () => {
      const updatedAssignments = roleAssignments.filter(a => !selectedAssignments.has(a.id));
      setRoleAssignments(updatedAssignments);
      setSelectedAssignments(new Set());
      setIsBulkActionsOpen(false);
    };

    const handleDeleteAssignment = (assignmentId: string) => {
      const updatedAssignments = roleAssignments.filter(a => a.id !== assignmentId);
      setRoleAssignments(updatedAssignments);
    };

    // Filter and paginate assignments
    const filteredAssignments = roleAssignments.filter(assignment => {
      const matchesSearch = assignment.name.toLowerCase().includes(searchValue.toLowerCase());
      const matchesFilter = filterValue === 'all' || 
        (filterValue === 'user' && assignment.type === 'User') ||
        (filterValue === 'group' && assignment.type === 'Group') ||
        (filterValue === 'active' && assignment.status === 'Active');
      return matchesSearch && matchesFilter;
    });

    const paginatedAssignments = filteredAssignments.slice(
      (page - 1) * perPage,
      page * perPage
    );

    if (roleAssignments.length === 0) {
      return (
        <Card>
          <CardBody>
            <EmptyState>
              <CubesIcon />
              <Title headingLevel="h2" size="lg">
                No role assignment created yet
              </Title>
              <EmptyStateBody>
                Role assignments grant users or groups the specific permissions they need to perform specific actions within a project.
              </EmptyStateBody>
              <EmptyStateActions>
                <Button variant="primary" onClick={handleCreateRoleAssignment}>
                  Create role assignment
                </Button>
              </EmptyStateActions>
              <EmptyStateBody>
                <Button component="a" href="#" variant="link">
                  Learn more about role assignments
                </Button>
              </EmptyStateBody>
            </EmptyState>
          </CardBody>
        </Card>
      );
    }

    return (
      <div className="table-content-card">
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Dropdown
                isOpen={isFilterOpen}
                onSelect={() => setIsFilterOpen(false)}
                onOpenChange={(isOpen: boolean) => setIsFilterOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    variant="plain"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    isExpanded={isFilterOpen}
                  >
                    Filter
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="all" onClick={() => setFilterValue('all')}>
                    All
                  </DropdownItem>
                  <DropdownItem key="user" onClick={() => setFilterValue('user')}>
                    User
                  </DropdownItem>
                  <DropdownItem key="group" onClick={() => setFilterValue('group')}>
                    Group
                  </DropdownItem>
                  <DropdownItem key="active" onClick={() => setFilterValue('active')}>
                    Active
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem>
              <SearchInput
                placeholder="Search role assignments"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem variant="separator" />
            <ToolbarItem>
              <Dropdown
                isOpen={isBulkActionsOpen}
                onSelect={() => setIsBulkActionsOpen(false)}
                onOpenChange={(isOpen) => setIsBulkActionsOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsBulkActionsOpen(!isBulkActionsOpen)}
                    isExpanded={isBulkActionsOpen}
                    variant="secondary"
                    isDisabled={!areSomeSelected}
                  >
                    Actions {areSomeSelected ? `(${selectedAssignments.size} selected)` : ''}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="delete" onClick={handleBulkDelete}>
                    Delete selected
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem>
              <Button variant="primary" onClick={handleCreateRoleAssignment}>
                Create role assignment
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        
        <Table aria-label="Role assignments table" variant="compact">
          <Thead>
            <Tr>
              <Th
                select={{
                  onSelect: (_event, isSelecting) => handleSelectAll(isSelecting),
                  isSelected: areAllSelected,
                }}
              />
              <Th sort={{ sortBy: {}, columnIndex: 0 }}>Cluster set</Th>
              <Th sort={{ sortBy: {}, columnIndex: 1 }}>Clusters</Th>
              <Th sort={{ sortBy: {}, columnIndex: 2 }}>Projects</Th>
              <Th sort={{ sortBy: {}, columnIndex: 3 }}>Roles</Th>
              <Th sort={{ sortBy: {}, columnIndex: 4 }}>Status</Th>
              <Th sort={{ sortBy: {}, columnIndex: 5 }}>Assigned date</Th>
              <Th sort={{ sortBy: {}, columnIndex: 6 }}>Assigned by</Th>
              <Th sort={{ sortBy: {}, columnIndex: 7 }}>Origin</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedAssignments.map((assignment, rowIndex) => (
              <Tr key={assignment.id}>
                <Td
                  select={{
                    rowIndex,
                    onSelect: (_event, isSelecting) => handleSelectAssignment(assignment.id, isSelecting),
                    isSelected: selectedAssignments.has(assignment.id),
                  }}
                />
                <Td dataLabel="Cluster set">
                  {assignment.clusterSet ? (
                    <Button variant="link" isInline style={{ paddingLeft: 0 }}>
                      {assignment.clusterSet}
                    </Button>
                  ) : (
                    <span>-</span>
                  )}
                </Td>
                <Td dataLabel="Clusters">
                  {assignment.clusters.map((cluster, idx) => (
                    <span key={idx}>
                      <Button variant="link" isInline style={{ paddingLeft: 0 }}>
                        {cluster}
                      </Button>
                      {idx < assignment.clusters.length - 1 && ', '}
                    </span>
                  ))}
                </Td>
                <Td dataLabel="Projects">
                  {assignment.projects.map((project, idx) => (
                    <span key={idx}>
                      <Button variant="link" isInline style={{ paddingLeft: 0 }}>
                        {project}
                      </Button>
                      {idx < assignment.projects.length - 1 && ', '}
                    </span>
                  ))}
                </Td>
                <Td dataLabel="Roles">
                  {assignment.roles.map((role, idx) => (
                    <span key={idx}>
                      <div>
                        <Button variant="link" isInline style={{ paddingLeft: 0 }}>
                          {role.displayName}
                        </Button>
                        <div className="pf-v6-u-font-size-sm pf-v6-u-color-200">
                          {role.name}
                        </div>
                      </div>
                      {idx < assignment.roles.length - 1 && ', '}
                    </span>
                  ))}
                </Td>
                <Td dataLabel="Status">
                  <Label color="green" icon={<span>✓</span>}>
                    {assignment.status}
                  </Label>
                </Td>
                <Td dataLabel="Assigned date">{assignment.assignedDate}</Td>
                <Td dataLabel="Assigned by">{assignment.assignedBy}</Td>
                <Td dataLabel="Origin">{assignment.origin}</Td>
                <Td isActionCell>
                  <ActionsColumn
                    items={[
                      {
                        title: 'Edit',
                        onClick: () => console.log('Edit', assignment.id)
                      },
                      {
                        isSeparator: true
                      },
                      {
                        title: 'Delete',
                        onClick: () => handleDeleteAssignment(assignment.id)
                      }
                    ]}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
              <Pagination
                itemCount={filteredAssignments.length}
                page={page}
                perPage={perPage}
                onSetPage={onSetPage}
                onPerPageSelect={onPerPageSelect}
                variant={PaginationVariant.bottom}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </div>
    );
  };

  const UsersTab = () => {
    // Get group data from centralized database
    const allGroups = getAllGroups();
    const currentGroup = allGroups.find(g => g.name === groupName);
    const groupUsers = currentGroup ? getUsersByGroup(currentGroup.id) : [];
    
    // Determine if group is synced from Identity Provider (same logic as GroupsTable)
    const groupIndex = allGroups.findIndex(g => g.name === groupName);
    const isLocal = groupName === 'local-admins' || groupName === 'test-group' || groupIndex % 7 === 0;
    const isSynced = !isLocal;
    
    // Transform users from database to component format
    const mockUsers = groupUsers.map((user, index) => ({
      id: index + 1,
      name: `${user.firstName} ${user.lastName}`,
      username: user.username,
      identityProvider: 'LDAP',
      created: new Date(user.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));

    const [selectedUsers, setSelectedUsers] = React.useState<Set<number>>(new Set());
    const [isBulkActionOpen, setIsBulkActionOpen] = React.useState(false);

    const filteredUsers = mockUsers.filter(user =>
      user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.username.toLowerCase().includes(searchValue.toLowerCase())
    );

    const paginatedUsers = filteredUsers.slice(
      (page - 1) * perPage,
      page * perPage
    );

    const isAllSelected = selectedUsers.size === filteredUsers.length && filteredUsers.length > 0;
    const isPartiallySelected = selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length;

    const handleSelectAll = (isSelecting: boolean) => {
      if (isSelecting) {
        setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
      } else {
        setSelectedUsers(new Set());
      }
    };

    const handleSelectUser = (userId: number, isSelecting: boolean) => {
      const newSelected = new Set(selectedUsers);
      if (isSelecting) {
        newSelected.add(userId);
      } else {
        newSelected.delete(userId);
      }
      setSelectedUsers(newSelected);
    };

    const handleBulkAction = (action: string) => {
      console.log(`Bulk action: ${action} for users:`, Array.from(selectedUsers));
      setIsBulkActionOpen(false);
      // Here you would implement the actual bulk action logic
    };

    const handleAddUser = () => {
      console.log('Add user to group');
      // Implement add user logic
    };

    const handleRemoveUser = () => {
      console.log('Remove selected users from group');
      // Implement remove user logic
    };

    return (
      <Card>
        <CardBody>
          <Toolbar>
            <ToolbarContent>
              {!isSynced && selectedUsers.size > 0 && (
                <>
                  <ToolbarGroup>
                    <ToolbarItem>
                      <Content component="p" className="pf-v6-u-font-weight-bold">
                        {selectedUsers.size} selected
                      </Content>
                    </ToolbarItem>
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isBulkActionOpen}
                        onSelect={() => setIsBulkActionOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsBulkActionOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsBulkActionOpen(!isBulkActionOpen)}
                            isExpanded={isBulkActionOpen}
                            variant="primary"
                          >
                            Actions
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem key="remove" onClick={() => handleBulkAction('remove')}>
                            Remove from group
                          </DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </ToolbarItem>
                  </ToolbarGroup>
                  <ToolbarItem>
                    <Divider orientation={{ default: 'vertical' }} />
                  </ToolbarItem>
                </>
              )}
              <ToolbarItem>
                <Dropdown
                  isOpen={isFilterOpen}
                  onSelect={() => setIsFilterOpen(false)}
                  onOpenChange={(isOpen: boolean) => setIsFilterOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      variant="plain"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      isExpanded={isFilterOpen}
                    >
                      <FilterIcon /> User
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem key="all">All users</DropdownItem>
                    <DropdownItem key="ldap">LDAP</DropdownItem>
                    <DropdownItem key="local">Local</DropdownItem>
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
              <ToolbarItem>
                <SearchInput
                  placeholder="Search for a user"
                  value={searchValue}
                  onChange={(_event, value) => setSearchValue(value)}
                  onClear={() => setSearchValue('')}
                />
              </ToolbarItem>
              {!isSynced && (
                <>
                  <ToolbarItem>
                    <Button variant={ButtonVariant.primary} onClick={handleAddUser}>
                      Add user
                    </Button>
                  </ToolbarItem>
                  <ToolbarItem>
                    <Button variant={ButtonVariant.secondary} onClick={handleRemoveUser}>
                      Remove user
                    </Button>
                  </ToolbarItem>
                </>
              )}
              <ToolbarItem align={{ default: 'alignEnd' }}>
                <Pagination
                  itemCount={filteredUsers.length}
                  page={page}
                  perPage={perPage}
                  onSetPage={onSetPage}
                  onPerPageSelect={onPerPageSelect}
                  variant={PaginationVariant.top}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          
          <Table aria-label="Users table" variant="compact">
            <Thead>
              <Tr>
              {!isSynced && (
                <Th
                  select={{
                    onSelect: (_event, isSelecting) => handleSelectAll(isSelecting),
                    isSelected: isAllSelected,
                  }}
                />
              )}
                <Th width={40} sort={{ columnIndex: 0, sortBy: { index: 0, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Name</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about user names">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                <Th width={20} sort={{ columnIndex: 1, sortBy: { index: 1, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Identity provider</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about identity providers">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                <Th width={20} sort={{ columnIndex: 2, sortBy: { index: 2, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Created</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about creation date">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                {!isSynced && <Th width={10}>Actions</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {paginatedUsers.map((user) => (
                <Tr key={user.id}>
                  {!isSynced && (
                    <Td
                      select={{
                        rowIndex: user.id,
                        onSelect: (_event, isSelecting) => handleSelectUser(user.id, isSelecting),
                        isSelected: selectedUsers.has(user.id),
                      }}
                    />
                  )}
                  <Td dataLabel="Name">
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          backgroundColor: 'var(--pf-t--global--color--brand--default)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'var(--pf-t--global--color--nonstatus--white--default)',
                          fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
                          fontSize: 'var(--pf-t--global--font--size--body--default)'
                        }}>
                          {user.name.charAt(0)}
                        </div>
                      </FlexItem>
                      <FlexItem>
                        <div>
                          <Button variant="link" isInline className="pf-v6-u-p-0">
                            {user.name}
                          </Button>
                          <div className="pf-v6-u-font-size-sm pf-v6-u-color-200">
                            {user.username}
                          </div>
                        </div>
                      </FlexItem>
                    </Flex>
                  </Td>
                  <Td dataLabel="Identity provider">
                    <Label color="blue">{user.identityProvider}</Label>
                  </Td>
                  <Td dataLabel="Created">{user.created}</Td>
                  {!isSynced && (
                    <Td dataLabel="Actions">
                      <Button variant="plain" aria-label="Actions">
                        <Icon><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></Icon>
                      </Button>
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
          
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem align={{ default: 'alignEnd' }}>
                <Pagination
                  itemCount={filteredUsers.length}
                  page={page}
                  perPage={perPage}
                  onSetPage={onSetPage}
                  onPerPageSelect={onPerPageSelect}
                  variant={PaginationVariant.bottom}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </CardBody>
      </Card>
    );
  };

  return (
    <>
      <div className="identities-page-container">
        <div className="page-header-section">
          <Breadcrumb className="pf-v6-u-mb-md">
            <BreadcrumbItem
              to="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/user-management/identities');
              }}
            >
              User management
            </BreadcrumbItem>
            <BreadcrumbItem
              to="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/user-management/identities');
              }}
            >
              Identities
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{groupName}</BreadcrumbItem>
          </Breadcrumb>

          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexEnd' }} className="pf-v6-u-mb-md">
            <FlexItem>
              <Title headingLevel="h1" size="lg">
                {groupName}
              </Title>
            </FlexItem>
            <FlexItem>
              <Button variant="plain" isInline>
                Actions <Icon><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></Icon>
              </Button>
            </FlexItem>
          </Flex>

          <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Group detail tabs">
            <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>} aria-label="Details tab" />
            <Tab eventKey={1} title={<TabTitleText>YAML</TabTitleText>} aria-label="YAML tab" />
            <Tab eventKey={2} title={<TabTitleText>Role assignments</TabTitleText>} aria-label="Role assignments tab" />
            <Tab eventKey={3} title={<TabTitleText>Users</TabTitleText>} aria-label="Users tab" />
          </Tabs>
        </div>

        <div className="page-content-section">
          {activeTabKey === 0 && <DetailsTab />}
          {activeTabKey === 1 && <YAMLTab />}
          {activeTabKey === 2 && <RoleAssignmentsTab />}
          {activeTabKey === 3 && <UsersTab />}
        </div>
      </div>

      <GroupRoleAssignmentWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleWizardComplete}
        groupName={groupName || 'Unknown'}
      />

      {/* Success Alert */}
      <AlertGroup isToast isLiveRegion>
        {showSuccessAlert && (
          <Alert
            variant="success"
            title="Role assignment created"
            actionClose={
              <AlertActionCloseButton onClose={() => setShowSuccessAlert(false)} />
            }
            timeout={10000}
            onTimeout={() => setShowSuccessAlert(false)}
          />
        )}
      </AlertGroup>
    </>
  );
};

export { GroupDetail };
