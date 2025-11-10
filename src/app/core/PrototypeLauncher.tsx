/**
 * Prototype Launcher
 * 
 * UI for selecting and launching prototypes
 */

import React, { useState } from 'react';
import {
  Title,
  Card,
  CardBody,
  CardTitle,
  CardHeader,
  Grid,
  GridItem,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Label,
  LabelGroup,
  Badge,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  EmptyState,
  EmptyStateBody,
  SearchInput,
  Tabs,
  Tab,
  TabTitleText,
  Divider,
  Content,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Flex,
  FlexItem,
  Button,
  Dropdown,
  DropdownList,
  DropdownItem,
  CardFooter,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { CubesIcon, UserIcon, TagIcon, SearchIcon, ThIcon, ListIcon } from '@patternfly/react-icons';
import { usePrototype } from './PrototypeContext';
import { PrototypeModule, PrototypeStatus } from './types';

type ViewMode = 'card' | 'table';

const PrototypeLauncher: React.FC = () => {
  const { availablePrototypes, loadPrototype } = usePrototype();
  const [activeTab, setActiveTab] = useState<string>('in-progress');
  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  
  // Track selected version for each version group card
  const [selectedVersions, setSelectedVersions] = useState<Map<string, string>>(new Map());
  
  // Get the selected version for a card (or default to last used / first)
  const getSelectedVersion = (cardId: string, versions: PrototypeModule[]): PrototypeModule => {
    // Check if user has selected a version in this session
    const sessionSelected = selectedVersions.get(cardId);
    if (sessionSelected) {
      const found = versions.find(v => v.config.id === sessionSelected);
      if (found) return found;
    }
    
    // Fall back to last used from localStorage
    const storageKey = `lastUsedChild_${cardId}`;
    const lastUsedId = localStorage.getItem(storageKey);
    const lastUsed = versions.find(v => v.config.id === lastUsedId);
    if (lastUsed) return lastUsed;
    
    // Default to first version
    return versions[0];
  };
  
  // Handle version selection from dropdown
  const handleVersionSelect = (cardId: string, versionId: string) => {
    setSelectedVersions(prev => {
      const next = new Map(prev);
      next.set(cardId, versionId);
      return next;
    });
  };
  
  // Get last used child for each parent from localStorage
  const getLastUsedChild = (parentId: string, children: PrototypeModule[]): PrototypeModule => {
    const storageKey = `lastUsedChild_${parentId}`;
    const lastUsedId = localStorage.getItem(storageKey);
    
    // Find the last used child, or default to first
    const lastUsed = children.find(c => c.config.id === lastUsedId);
    return lastUsed || children[0];
  };
  
  // Group children by versionGroup to show versions together
  const groupChildrenByVersion = (children: PrototypeModule[]) => {
    const grouped = new Map<string, PrototypeModule[]>();
    const standalone: PrototypeModule[] = [];
    
    children.forEach(child => {
      if (child.config.versionGroup) {
        if (!grouped.has(child.config.versionGroup)) {
          grouped.set(child.config.versionGroup, []);
        }
        grouped.get(child.config.versionGroup)!.push(child);
      } else {
        standalone.push(child);
      }
    });
    
    // Sort versions within each group
    grouped.forEach((versions) => {
      versions.sort((a, b) => {
        // Put 'final' last, otherwise alphabetical
        if (a.config.version === 'final') return 1;
        if (b.config.version === 'final') return -1;
        return a.config.version.localeCompare(b.config.version);
      });
    });
    
    return { grouped, standalone };
  };
  
  // Save last used child when launching
  const handlePrototypeSelectWithMemory = (prototypeId: string, parentId?: string) => {
    // If this is a child of a parent, remember it
    if (parentId) {
      const storageKey = `lastUsedChild_${parentId}`;
      localStorage.setItem(storageKey, prototypeId);
    }
    
    loadPrototype(prototypeId);
  };

  // Get all unique tags
  const allTags = Array.from(
    new Set(availablePrototypes.flatMap(p => p.config.tags))
  ).sort();

  // Get all unique owners
  const allOwners = Array.from(
    new Set(availablePrototypes.map(p => p.config.owner.name))
  ).sort();

  // Separate top-level (parents + standalones) from children
  const topLevelPrototypes = availablePrototypes.filter(p => !p.config.parentId);
  const childPrototypes = availablePrototypes.filter(p => p.config.parentId);
  
  // Group standalone prototypes by versionGroup
  const groupStandalonesByVersion = (prototypes: PrototypeModule[]) => {
    const versionGroups = new Map<string, PrototypeModule[]>();
    const trueStandalones: PrototypeModule[] = [];
    
    prototypes.forEach(proto => {
      if (proto.config.versionGroup && !proto.config.parentId) {
        // This is a versioned standalone
        if (!versionGroups.has(proto.config.versionGroup)) {
          versionGroups.set(proto.config.versionGroup, []);
        }
        versionGroups.get(proto.config.versionGroup)!.push(proto);
      } else if (!proto.config.isParent) {
        // True standalone (no versions, not a parent)
        trueStandalones.push(proto);
      }
    });
    
    // Sort versions within each group
    versionGroups.forEach((versions) => {
      versions.sort((a, b) => {
        if (a.config.version === 'final') return 1;
        if (b.config.version === 'final') return -1;
        return a.config.version.localeCompare(b.config.version);
      });
    });
    
    return { versionGroups, trueStandalones };
  };
  
  const { versionGroups, trueStandalones } = groupStandalonesByVersion(topLevelPrototypes);
  
  // Build cards to display: parents, version groups (as single cards), and true standalones
  const cardsToDisplay: Array<{
    type: 'parent' | 'versionGroup' | 'standalone';
    representative: PrototypeModule; // The prototype to show metadata for
    versions?: PrototypeModule[]; // For version groups
  }> = [];
  
  // Add parent prototypes
  topLevelPrototypes.filter(p => p.config.isParent).forEach(parent => {
    cardsToDisplay.push({
      type: 'parent',
      representative: parent,
    });
  });
  
  // Add version groups (as single cards)
  versionGroups.forEach((versions, groupName) => {
    // Use the first version as representative for metadata
    cardsToDisplay.push({
      type: 'versionGroup',
      representative: versions[0],
      versions,
    });
  });
  
  // Add true standalones
  trueStandalones.forEach(standalone => {
    cardsToDisplay.push({
      type: 'standalone',
      representative: standalone,
    });
  });

  // Filter cards to display
  const filteredCards = cardsToDisplay.filter(card => {
    const prototype = card.representative;
    
    // Filter by status (tab)
    if (activeTab !== 'all' && prototype.config.status !== activeTab) {
      return false;
    }

    // Filter by search (name, owner, persona)
    if (searchValue) {
      const search = searchValue.toLowerCase();
      const matchesName = prototype.config.name.toLowerCase().includes(search);
      const matchesDescription = prototype.config.description.toLowerCase().includes(search);
      const matchesOwner = prototype.config.owner.name.toLowerCase().includes(search);
      const matchesPersonaName = prototype.config.persona.name.toLowerCase().includes(search);
      const matchesPersonaRole = prototype.config.persona.role.toLowerCase().includes(search);
      const matchesTags = prototype.config.tags.some(tag => tag.toLowerCase().includes(search));
      if (!matchesName && !matchesDescription && !matchesOwner && !matchesPersonaName && !matchesPersonaRole && !matchesTags) {
        return false;
      }
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      const hasTag = selectedTags.some(tag => prototype.config.tags.includes(tag));
      if (!hasTag) return false;
    }

    // Filter by owner
    if (selectedOwner && prototype.config.owner.name !== selectedOwner) {
      return false;
    }

    return true;
  });

  // Get children for a parent
  const getChildren = (parentId: string) => {
    return childPrototypes
      .filter(p => p.config.parentId === parentId)
      .sort((a, b) => (a.config.childOrder || 0) - (b.config.childOrder || 0));
  };

  // Toggle dropdown for parent cards
  const toggleDropdown = (parentId: string) => {
    setOpenDropdowns(prev => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  };

  // Count by status - count top-level cards only
  const countCardsByStatus = (status: string) => {
    return cardsToDisplay.filter(card => {
      if (status === 'all') return true;
      return card.representative.config.status === status;
    }).length;
  };
  
  const counts = {
    all: cardsToDisplay.length,
    'in-progress': countCardsByStatus('in-progress'),
    done: countCardsByStatus('done'),
    archived: countCardsByStatus('archived'),
  };

  const handlePrototypeSelect = (prototypeId: string) => {
    // For standalone prototypes (no parent)
    loadPrototype(prototypeId);
  };

  const getStatusColor = (status: PrototypeStatus): 'blue' | 'green' | 'grey' | 'orange' => {
    switch (status) {
      case 'in-progress':
        return 'green';
      case 'done':
        return 'green';
      case 'archived':
        return 'grey';
      case 'paused':
        return 'orange';
      default:
        return 'grey';
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      boxSizing: 'border-box',
      backgroundColor: '#f5f5f5',
      overflow: 'auto'
    }}>
      {/* Header, Filters, and Tabs - All White Background */}
      <div style={{ 
        padding: '24px',
        paddingBottom: '0',
        backgroundColor: '#ffffff'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
          <Title headingLevel="h1" size="2xl">
            Prototype Launcher
          </Title>
          <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
            Select a prototype to start testing. Each prototype is an isolated environment for exploring specific user experiences.
          </Content>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem style={{ flexGrow: 1, maxWidth: '400px' }}>
                <SearchInput
                  placeholder="Search by name, owner, or persona..."
                  value={searchValue}
                  onChange={(_event, value) => setSearchValue(value)}
                  onClear={() => setSearchValue('')}
                />
              </ToolbarItem>
              <ToolbarItem>
                <ToggleGroup aria-label="View mode">
                  <ToggleGroupItem
                    icon={<ThIcon />}
                    aria-label="Card view"
                    buttonId="card-view"
                    isSelected={viewMode === 'card'}
                    onChange={() => setViewMode('card')}
                  />
                  <ToggleGroupItem
                    icon={<ListIcon />}
                    aria-label="Table view"
                    buttonId="table-view"
                    isSelected={viewMode === 'table'}
                    onChange={() => setViewMode('table')}
                  />
                </ToggleGroup>
              </ToolbarItem>
              <ToolbarItem>
                <LabelGroup categoryName="Tags">
                  {selectedTags.map(tag => (
                    <Label
                      key={tag}
                      color="blue"
                      isCompact
                      onClose={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                    >
                      {tag}
                    </Label>
                  ))}
                </LabelGroup>
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </div>

        {/* Status Tabs */}
        <div>
          <Tabs
            activeKey={activeTab}
            onSelect={(_event, tabKey) => setActiveTab(tabKey as string)}
          >
            <Tab
              eventKey="in-progress"
              title={<TabTitleText>In-progress ({counts['in-progress']})</TabTitleText>}
            />
            <Tab
              eventKey="done"
              title={<TabTitleText>Done ({counts.done})</TabTitleText>}
            />
            <Tab
              eventKey="archived"
              title={<TabTitleText>Archived ({counts.archived})</TabTitleText>}
            />
            <Tab
              eventKey="all"
              title={<TabTitleText>All ({counts.all})</TabTitleText>}
            />
          </Tabs>
        </div>
      </div>

              {/* Prototype Grid/Table */}
              <div style={{ 
                padding: '24px'
              }}>
                <div style={{ 
                  minHeight: '400px'
                }}>
          {filteredCards.length === 0 ? (
            <EmptyState>
              <Title headingLevel="h2" size="lg">
                No prototypes found
              </Title>
              <EmptyStateBody>
                No prototypes match your current filters. Try adjusting your search or filters.
              </EmptyStateBody>
            </EmptyState>
          ) : viewMode === 'table' ? (
            <Card className="prototype-launcher-card">
              <Table aria-label="Prototypes table" variant="compact">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Description</Th>
                    <Th>Owner</Th>
                    <Th>Status</Th>
                    <Th>Persona</Th>
                    <Th>Version</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredCards.map(card => {
                    const prototype = card.representative;
                    const cardId = card.type === 'versionGroup' ? card.versions![0].config.versionGroup! : prototype.config.id;
                    
                    // Get children/versions based on card type
                    let children: PrototypeModule[] = [];
                    if (card.type === 'parent') {
                      children = getChildren(prototype.config.id);
                    } else if (card.type === 'versionGroup') {
                      children = card.versions || [];
                    }
                    
                    const selectedVersion = card.type === 'versionGroup' && children.length > 0
                      ? getSelectedVersion(cardId, children)
                      : null;
                    
                    const displayPrototype = selectedVersion || prototype;
                    const defaultChild = children.length > 0 ? getLastUsedChild(cardId, children) : children[0];
                    const hasChildren = children.length > 0;
                    
                    return (
                      <Tr key={cardId}>
                        <Td dataLabel="Title">{prototype.config.name}</Td>
                        <Td dataLabel="Description">{displayPrototype.config.description}</Td>
                        <Td dataLabel="Owner">{displayPrototype.config.owner.name}</Td>
                        <Td dataLabel="Status">
                          <Label color={getStatusColor(displayPrototype.config.status)} isCompact>
                            {displayPrototype.config.status}
                          </Label>
                        </Td>
                        <Td dataLabel="Persona">
                          {prototype.config.id === 'acm-rbac-parent' ? (
                            // For ACM RBAC parent, show both personas
                            (() => {
                              const fleetAdmin = childPrototypes.find(p => p.config.id === 'fleet-admin-rbac');
                              const tenantAdmin = childPrototypes.find(p => p.config.id === 'tenant-admin-access');
                              const personas: string[] = [];
                              if (tenantAdmin) {
                                personas.push(`${tenantAdmin.config.persona.name} (${tenantAdmin.config.persona.role})`);
                              }
                              if (fleetAdmin) {
                                personas.push(`${fleetAdmin.config.persona.name} (${fleetAdmin.config.persona.role})`);
                              }
                              return personas.join(', ');
                            })()
                          ) : (
                            // For other prototypes, show single persona
                            `${displayPrototype.config.persona.name} (${displayPrototype.config.persona.role})`
                          )}
                        </Td>
                        <Td dataLabel="Version">{displayPrototype.config.version}</Td>
                        <Td dataLabel="Actions">
                          {card.type === 'parent' && hasChildren ? (
                            <div style={{ display: 'flex', gap: 0 }}>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  if (defaultChild) {
                                    handlePrototypeSelectWithMemory(defaultChild.config.id, cardId);
                                  }
                                }}
                                style={{
                                  borderTopRightRadius: 0,
                                  borderBottomRightRadius: 0,
                                  borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                                }}
                              >
                                {prototype.config.id === 'virtualization-parent' ? 'Explore quotas' : prototype.config.id === 'acm-rbac-parent' ? 'Explore RBAC' : prototype.config.id === 'cross-cluster-migration' ? 'Explore CCLM' : prototype.config.id === 'operator-lifecycle' ? 'Explore OperatorHub' : 'Explore'}
                              </Button>
                              <Dropdown
                                isOpen={openDropdowns.has(cardId)}
                                onSelect={() => toggleDropdown(cardId)}
                                onOpenChange={(isOpen) => {
                                  if (!isOpen) toggleDropdown(cardId);
                                }}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    variant="primary"
                                    isExpanded={openDropdowns.has(cardId)}
                                    onClick={() => toggleDropdown(cardId)}
                                    style={{
                                      borderTopLeftRadius: 0,
                                      borderBottomLeftRadius: 0,
                                      minWidth: '32px',
                                      height: '28px',
                                    }}
                                  />
                                )}
                              >
                                <DropdownList>
                                  {(() => {
                                    // Special handling for AAQ parent
                                    if (prototype.config.id === 'virtualization-parent') {
                                      return children.map(child => {
                                        if (child.config.id === 'virtualization-quotas') {
                                          return (
                                            <DropdownItem
                                              key={child.config.id}
                                              onClick={() => handlePrototypeSelectWithMemory(child.config.id, cardId)}
                                              description="Explore quota management and resource allocation workflows"
                                            >
                                              Explore quotas
                                            </DropdownItem>
                                          );
                                        } else if (child.config.id === 'aaq-empty-states') {
                                          return (
                                            <DropdownItem
                                              key={child.config.id}
                                              onClick={() => handlePrototypeSelectWithMemory(child.config.id, cardId)}
                                              description="Review and evaluate empty state designs for quota management"
                                            >
                                              Empty state
                                            </DropdownItem>
                                          );
                                        }
                                        return null;
                                      });
                                    }
                                    
                                    // Special handling for ACM RBAC parent
                                    if (prototype.config.id === 'acm-rbac-parent') {
                                      return children.map(child => {
                                        if (child.config.id === 'fleet-admin-rbac') {
                                          return (
                                            <DropdownItem
                                              key={child.config.id}
                                              onClick={() => handlePrototypeSelectWithMemory(child.config.id, cardId)}
                                              description="Explore how fleet administrators delegate cluster set access to tenant admins"
                                            >
                                              Fleet admin → Tenant admin rbac delegation
                                            </DropdownItem>
                                          );
                                        } else if (child.config.id === 'tenant-admin-access') {
                                          return (
                                            <DropdownItem
                                              key={child.config.id}
                                              onClick={() => handlePrototypeSelectWithMemory(child.config.id, cardId)}
                                              description="Explore how tenant administrators grant team access to projects spanning multiple clusters"
                                            >
                                              Tenant admin → project access
                                            </DropdownItem>
                                          );
                                        } else if (child.config.id === 'acm-empty-states') {
                                          return (
                                            <DropdownItem
                                              key={child.config.id}
                                              onClick={() => handlePrototypeSelectWithMemory(child.config.id, cardId)}
                                              description="Review and evaluate empty state designs for RBAC workflows"
                                            >
                                              Empty states
                                            </DropdownItem>
                                          );
                                        }
                                        return null;
                                      });
                                    }
                                    
                                    // Default handling for other parents
                                    return children.map(child => (
                                      <DropdownItem
                                        key={child.config.id}
                                        onClick={() => handlePrototypeSelectWithMemory(child.config.id, cardId)}
                                        description={child.config.persona.role}
                                      >
                                        {child.config.name}
                                      </DropdownItem>
                                    ));
                                  })()}
                                </DropdownList>
                              </Dropdown>
                            </div>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                if (card.type === 'versionGroup' && selectedVersion) {
                                  handlePrototypeSelectWithMemory(selectedVersion.config.id, cardId);
                                } else {
                                  handlePrototypeSelect(prototype.config.id);
                                }
                              }}
                            >
                              Explore
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Card>
          ) : (
            <Grid hasGutter>
              {filteredCards.map(card => {
                const prototype = card.representative;
                const cardId = card.type === 'versionGroup' ? card.versions![0].config.versionGroup! : prototype.config.id;
                
                // Get children/versions based on card type
                let children: PrototypeModule[] = [];
                if (card.type === 'parent') {
                  children = getChildren(prototype.config.id);
                } else if (card.type === 'versionGroup') {
                  children = card.versions || [];
                }
                
                // For parent cards, check if children have versions
                let parentVersions: PrototypeModule[] = [];
                let selectedParentVersion: PrototypeModule | null = null;
                let filteredChildren: PrototypeModule[] = children;
                
                if (card.type === 'parent' && children.length > 0) {
                  // Group children by versionGroup to find versions
                  const { grouped } = groupChildrenByVersion(children);
                  
                  // Collect all versions from children
                  grouped.forEach((versions) => {
                    parentVersions.push(...versions);
                  });
                  
                  // If we have versions, get selected version and filter children
                  if (parentVersions.length > 0) {
                    // Get unique version groups
                    const versionGroups = Array.from(new Set(parentVersions.map(v => v.config.versionGroup!)));
                    
                    // For now, use the first version group's versions
                    // In the future, we could support multiple version groups
                    const firstVersionGroup = versionGroups[0];
                    const versionsForGroup = parentVersions.filter(v => v.config.versionGroup === firstVersionGroup);
                    
                    if (versionsForGroup.length > 1) {
                      // We have multiple versions - show dropdown
                      selectedParentVersion = getSelectedVersion(`${cardId}-parent-version`, versionsForGroup);
                      
                      // Filter children based on selected version
                      const selectedVersionGroup = selectedParentVersion.config.versionGroup;
                      const selectedVersionValue = selectedParentVersion.config.version;
                      
                      filteredChildren = children.filter(child => {
                        // If child has versionGroup, only show if it matches the selected version
                        if (child.config.versionGroup) {
                          // Must match both the versionGroup AND the specific version
                          return child.config.versionGroup === selectedVersionGroup && 
                                 child.config.version === selectedVersionValue;
                        }
                        // For children without versionGroup, only show them when v1.0 is selected
                        // (v1.1 should only show the versioned child)
                        return selectedVersionValue === 'v1.0';
                      });
                    } else if (versionsForGroup.length === 1) {
                      // Only one version exists - still need to filter children to match that version
                      selectedParentVersion = versionsForGroup[0];
                      const selectedVersionGroup = selectedParentVersion.config.versionGroup;
                      const selectedVersionValue = selectedParentVersion.config.version;
                      
                      filteredChildren = children.filter(child => {
                        if (child.config.versionGroup) {
                          return child.config.versionGroup === selectedVersionGroup && 
                                 child.config.version === selectedVersionValue;
                        }
                        return selectedVersionValue === 'v1.0';
                      });
                    }
                  }
                }
                
                // For version groups, get the currently selected version
                const selectedVersion = card.type === 'versionGroup' && children.length > 0
                  ? getSelectedVersion(cardId, children)
                  : null;
                
                // Use selected version's config for display (if version group), otherwise use representative
                const displayPrototype = selectedVersion || prototype;
                
                // Use filtered children for parent cards with versions, otherwise use all children
                const displayChildren = (card.type === 'parent' && selectedParentVersion) ? filteredChildren : children;
                const defaultChild = displayChildren.length > 0 ? getLastUsedChild(cardId, displayChildren) : displayChildren[0];
                const isDropdownOpen = openDropdowns.has(cardId);
                const isVersionSelectorOpen = openDropdowns.has(`${cardId}-version`);
                const isParentVersionSelectorOpen = openDropdowns.has(`${cardId}-parent-version`);
                        
                const hasChildren = displayChildren.length > 0;
                const hasMultipleChildren = displayChildren.length > 1;
                
                return (
                  <GridItem
                    key={cardId}
                    md={6}
                    lg={4}
                  >
                    <Card
                      className="prototype-launcher-card"
                      style={{ 
                        cursor: 'default',
                      }}
                    >
                    <CardTitle>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>{prototype.config.name}</FlexItem>
                        <FlexItem>
                          <Label color={getStatusColor(displayPrototype.config.status)} isCompact>
                            {displayPrototype.config.status}
                          </Label>
                        </FlexItem>
                      </Flex>
                    </CardTitle>
                    <CardBody>
                      <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                        {displayPrototype.config.description}
                      </Content>

                      <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }} />

                      <DescriptionList isCompact isHorizontal>
                        <DescriptionListGroup>
                          <DescriptionListTerm>
                            <UserIcon /> Owner
                          </DescriptionListTerm>
                          <DescriptionListDescription>
                            {displayPrototype.config.owner.name}
                            {displayPrototype.config.owner.slack && (
                              <> ({displayPrototype.config.owner.slack})</>
                            )}
                          </DescriptionListDescription>
                        </DescriptionListGroup>

                        <DescriptionListGroup>
                          <DescriptionListTerm>Persona</DescriptionListTerm>
                          <DescriptionListDescription>
                            {prototype.config.id === 'acm-rbac-parent' ? (
                              // For ACM RBAC parent, show both personas
                              (() => {
                                const fleetAdmin = childPrototypes.find(p => p.config.id === 'fleet-admin-rbac');
                                const tenantAdmin = childPrototypes.find(p => p.config.id === 'tenant-admin-access');
                                const personas: string[] = [];
                                if (tenantAdmin) {
                                  personas.push(`${tenantAdmin.config.persona.name} (${tenantAdmin.config.persona.role})`);
                                }
                                if (fleetAdmin) {
                                  personas.push(`${fleetAdmin.config.persona.name} (${fleetAdmin.config.persona.role})`);
                                }
                                return personas.join(', ');
                              })()
                            ) : (
                              // For other prototypes, show single persona
                              `${displayPrototype.config.persona.name} (${displayPrototype.config.persona.role})`
                            )}
                          </DescriptionListDescription>
                        </DescriptionListGroup>

                        <DescriptionListGroup>
                          <DescriptionListTerm>Version</DescriptionListTerm>
                          <DescriptionListDescription>
                            {card.type === 'versionGroup' && children.length > 0 ? (
                              <Select
                                isOpen={isVersionSelectorOpen}
                                onSelect={(_, value) => {
                                  handleVersionSelect(cardId, value as string);
                                  toggleDropdown(`${cardId}-version`);
                                }}
                                onOpenChange={(isOpen) => {
                                  if (isOpen) {
                                    setOpenDropdowns(prev => new Set(prev).add(`${cardId}-version`));
                                  } else {
                                    setOpenDropdowns(prev => {
                                      const next = new Set(prev);
                                      next.delete(`${cardId}-version`);
                                      return next;
                                    });
                                  }
                                }}
                                toggle={(toggleRef) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    onClick={() => toggleDropdown(`${cardId}-version`)}
                                    isExpanded={isVersionSelectorOpen}
                                    variant="secondary"
                                    style={{ minWidth: '150px' }}
                                  >
                                    {selectedVersion?.config.version || 'Select version'}
                                  </MenuToggle>
                                )}
                              >
                                <SelectList>
                                  {children.map(version => (
                                    <SelectOption
                                      key={version.config.id}
                                      value={version.config.id}
                                      isSelected={version.config.id === selectedVersion?.config.id}
                                    >
                                      {version.config.version}
                                    </SelectOption>
                                  ))}
                                </SelectList>
                              </Select>
                            ) : card.type === 'parent' && parentVersions.length > 1 ? (
                              // Parent card with versions - show version dropdown
                              (() => {
                                const versionGroups = Array.from(new Set(parentVersions.map(v => v.config.versionGroup!)));
                                const firstVersionGroup = versionGroups[0];
                                const versionsForGroup = parentVersions.filter(v => v.config.versionGroup === firstVersionGroup);
                                
                                return (
                                  <Select
                                    isOpen={isParentVersionSelectorOpen}
                                    onSelect={(_, value) => {
                                      handleVersionSelect(`${cardId}-parent-version`, value as string);
                                      toggleDropdown(`${cardId}-parent-version`);
                                    }}
                                    onOpenChange={(isOpen) => {
                                      if (isOpen) {
                                        setOpenDropdowns(prev => new Set(prev).add(`${cardId}-parent-version`));
                                      } else {
                                        setOpenDropdowns(prev => {
                                          const next = new Set(prev);
                                          next.delete(`${cardId}-parent-version`);
                                          return next;
                                        });
                                      }
                                    }}
                                    toggle={(toggleRef) => (
                                      <MenuToggle
                                        ref={toggleRef}
                                        onClick={() => toggleDropdown(`${cardId}-parent-version`)}
                                        isExpanded={isParentVersionSelectorOpen}
                                        variant="secondary"
                                        style={{ minWidth: '120px', fontSize: '14px' }}
                                      >
                                        {selectedParentVersion?.config.version || versionsForGroup[0]?.config.version || 'Select'}
                                      </MenuToggle>
                                    )}
                                  >
                                    <SelectList>
                                      {versionsForGroup.map(version => (
                                        <SelectOption
                                          key={version.config.id}
                                          value={version.config.id}
                                          isSelected={version.config.id === selectedParentVersion?.config.id}
                                        >
                                          {version.config.version}
                                        </SelectOption>
                                      ))}
                                    </SelectList>
                                  </Select>
                                );
                              })()
                            ) : (
                              displayPrototype.config.version
                            )}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    </CardBody>
                    
                    {/* Footer with launch button - all cards get one */}
                    <CardFooter>
                      {card.type === 'parent' && hasChildren ? (
                        // Show split button if multiple children, simple button if one child
                        hasMultipleChildren ? (
                          // Split button for multiple children
                          <Flex spaceItems={{ default: 'spaceItemsNone' }} justifyContent={{ default: 'justifyContentFlexStart' }}>
                            <FlexItem>
                              <Button
                                variant="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (defaultChild) {
                                    handlePrototypeSelectWithMemory(defaultChild.config.id, cardId);
                                  }
                                }}
                                style={{
                                  borderTopRightRadius: 0,
                                  borderBottomRightRadius: 0,
                                  borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                                }}
                              >
                                {prototype.config.id === 'virtualization-parent' ? 'Explore quotas' : prototype.config.id === 'acm-rbac-parent' ? 'Explore RBAC' : prototype.config.id === 'cross-cluster-migration' ? 'Explore CCLM' : prototype.config.id === 'operator-lifecycle' ? 'Explore OperatorHub' : 'Explore'}
                              </Button>
                            </FlexItem>
                            <FlexItem>
                              <Dropdown
                                isOpen={isDropdownOpen && hasMultipleChildren}
                                onSelect={() => {
                                  if (hasMultipleChildren) {
                                    toggleDropdown(cardId);
                                  }
                                }}
                                onOpenChange={(isOpen) => {
                                  if (!isOpen && hasMultipleChildren) {
                                    toggleDropdown(cardId);
                                  }
                                }}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    variant="primary"
                                    isExpanded={isDropdownOpen && hasMultipleChildren}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (hasMultipleChildren) {
                                        toggleDropdown(cardId);
                                      }
                                    }}
                                    isDisabled={!hasMultipleChildren}
                                    style={{
                                      borderTopLeftRadius: 0,
                                      borderBottomLeftRadius: 0,
                                      minWidth: '44px',
                                    }}
                                  />
                                )}
                              >
                                <DropdownList>
                                  {(() => {
                                    const items: React.ReactNode[] = [];
                                    
                                    // Use filtered children (based on selected version)
                                    displayChildren.forEach(child => {
                                      // Special handling for AAQ parent
                                      if (prototype.config.id === 'virtualization-parent') {
                                        if (child.config.id === 'virtualization-quotas') {
                                        items.push(
                                          <DropdownItem
                                            key={child.config.id}
                                            onClick={(e) => {
                                              e?.stopPropagation();
                                              handlePrototypeSelectWithMemory(child.config.id, prototype.config.id);
                                            }}
                                            description="Explore quota management and resource allocation workflows"
                                          >
                                            Explore quotas
                                          </DropdownItem>
                                        );
                                      } else if (child.config.id === 'aaq-empty-states') {
                                        items.push(
                                          <DropdownItem
                                            key={child.config.id}
                                            onClick={(e) => {
                                              e?.stopPropagation();
                                              handlePrototypeSelectWithMemory(child.config.id, prototype.config.id);
                                            }}
                                            description="Review and evaluate empty state designs for quota management"
                                          >
                                            Empty state
                                          </DropdownItem>
                                        );
                                      }
                                      // Special handling for ACM RBAC parent
                                    } else if (prototype.config.id === 'acm-rbac-parent') {
                                        if (child.config.id === 'fleet-admin-rbac') {
                                          items.push(
                                            <DropdownItem
                                              key={child.config.id}
                                              onClick={(e) => {
                                                e?.stopPropagation();
                                                handlePrototypeSelectWithMemory(child.config.id, prototype.config.id);
                                              }}
                                              description="Explore how fleet administrators delegate cluster set access to tenant admins"
                                            >
                                              Fleet admin → Tenant admin rbac delegation
                                            </DropdownItem>
                                          );
                                        } else if (child.config.id === 'tenant-admin-access') {
                                          items.push(
                                            <DropdownItem
                                              key={child.config.id}
                                              onClick={(e) => {
                                                e?.stopPropagation();
                                                handlePrototypeSelectWithMemory(child.config.id, prototype.config.id);
                                              }}
                                              description="Explore how tenant administrators grant team access to projects spanning multiple clusters"
                                            >
                                              Tenant admin → project access
                                            </DropdownItem>
                                          );
                                        } else if (child.config.id === 'acm-empty-states') {
                                          items.push(
                                            <DropdownItem
                                              key={child.config.id}
                                              onClick={(e) => {
                                                e?.stopPropagation();
                                                handlePrototypeSelectWithMemory(child.config.id, prototype.config.id);
                                              }}
                                              description="Review and evaluate empty state designs for RBAC workflows"
                                            >
                                              Empty states
                                            </DropdownItem>
                                          );
                                        }
                                      } else {
                                        // Generic handling for other parents
                                        items.push(
                                          <DropdownItem
                                            key={child.config.id}
                                            onClick={(e) => {
                                              e?.stopPropagation();
                                              handlePrototypeSelectWithMemory(child.config.id, prototype.config.id);
                                            }}
                                          >
                                            {child.config.name}
                                          </DropdownItem>
                                        );
                                      }
                                    });
                                    
                                    return items;
                                  })()}
                                </DropdownList>
                              </Dropdown>
                            </FlexItem>
                          </Flex>
                        ) : (
                          // Simple button for single child
                          <Button
                            variant="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (defaultChild) {
                                handlePrototypeSelectWithMemory(defaultChild.config.id, cardId);
                              }
                            }}
                          >
                            {prototype.config.id === 'virtualization-parent' ? 'Explore quotas' : prototype.config.id === 'acm-rbac-parent' ? 'Explore RBAC' : prototype.config.id === 'cross-cluster-migration' ? 'Explore CCLM' : prototype.config.id === 'operator-lifecycle' ? 'Explore OperatorHub' : 'Explore'}
                          </Button>
                        )
                      ) : (
                        // Single button for version groups and standalone cards
                        <Button
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (card.type === 'versionGroup' && selectedVersion) {
                              // For version groups, launch selected version
                              handlePrototypeSelectWithMemory(selectedVersion.config.id, cardId);
                            } else {
                              // For standalones, launch directly
                              handlePrototypeSelect(prototype.config.id);
                            }
                          }}
                        >
                          {prototype.config.id === 'cross-cluster-migration' ? 'Explore CCLM' : prototype.config.id === 'operator-lifecycle' ? 'Explore OperatorHub' : 'Explore'}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </GridItem>
              );
              })}
            </Grid>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrototypeLauncher;
