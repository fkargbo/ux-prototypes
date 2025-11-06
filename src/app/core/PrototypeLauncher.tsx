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
} from '@patternfly/react-core';
import { CubesIcon, UserIcon, TagIcon, SearchIcon } from '@patternfly/react-icons';
import { usePrototype } from './PrototypeContext';
import { PrototypeModule, PrototypeStatus } from './types';

const PrototypeLauncher: React.FC = () => {
  const { availablePrototypes, loadPrototype } = usePrototype();
  const [activeTab, setActiveTab] = useState<string>('active');
  const [searchValue, setSearchValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  
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

    // Filter by search
    if (searchValue) {
      const search = searchValue.toLowerCase();
      const matchesName = prototype.config.name.toLowerCase().includes(search);
      const matchesDescription = prototype.config.description.toLowerCase().includes(search);
      const matchesTags = prototype.config.tags.some(tag => tag.toLowerCase().includes(search));
      if (!matchesName && !matchesDescription && !matchesTags) {
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
    active: countCardsByStatus('active'),
    draft: countCardsByStatus('draft'),
    archived: countCardsByStatus('archived'),
  };

  const handlePrototypeSelect = (prototypeId: string) => {
    // For standalone prototypes (no parent)
    loadPrototype(prototypeId);
  };

  const getStatusColor = (status: PrototypeStatus): 'blue' | 'green' | 'grey' | 'orange' => {
    switch (status) {
      case 'active':
        return 'green';
      case 'draft':
        return 'blue';
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
      padding: '24px', 
      boxSizing: 'border-box',
      backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
      overflow: 'auto'
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

      {/* Content */}
      <div>
          {/* Filters */}
          <Card>
          <CardBody>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem style={{ flexGrow: 1, maxWidth: '400px' }}>
                  <SearchInput
                    placeholder="Search prototypes..."
                    value={searchValue}
                    onChange={(_event, value) => setSearchValue(value)}
                    onClear={() => setSearchValue('')}
                  />
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
            </CardBody>
          </Card>

        {/* Status Tabs */}
        <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
          <Tabs
            activeKey={activeTab}
            onSelect={(_event, tabKey) => setActiveTab(tabKey as string)}
          >
            <Tab
              eventKey="active"
              title={<TabTitleText>Active ({counts.active})</TabTitleText>}
            />
            <Tab
              eventKey="draft"
              title={<TabTitleText>Draft ({counts.draft})</TabTitleText>}
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

        {/* Prototype Grid */}
        <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
          {filteredCards.length === 0 ? (
            <EmptyState>
              <Title headingLevel="h2" size="lg">
                No prototypes found
              </Title>
              <EmptyStateBody>
                No prototypes match your current filters. Try adjusting your search or filters.
              </EmptyStateBody>
            </EmptyState>
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
                
                // For version groups, get the currently selected version
                const selectedVersion = card.type === 'versionGroup' && children.length > 0
                  ? getSelectedVersion(cardId, children)
                  : null;
                
                // Use selected version's config for display (if version group), otherwise use representative
                const displayPrototype = selectedVersion || prototype;
                
                const defaultChild = children.length > 0 ? getLastUsedChild(cardId, children) : children[0];
                const isDropdownOpen = openDropdowns.has(cardId);
                const isVersionSelectorOpen = openDropdowns.has(`${cardId}-version`);
                
                const hasChildren = children.length > 0;
                const isClickableCard = card.type === 'standalone' && !hasChildren;
                
                return (
                  <GridItem
                    key={cardId}
                    md={6}
                    lg={4}
                  >
                    <Card
                      isClickable={isClickableCard}
                      isSelectable={isClickableCard}
                      onClick={isClickableCard ? () => handlePrototypeSelect(prototype.config.id) : undefined}
                      style={{ 
                        height: '100%', 
                        cursor: isClickableCard ? 'pointer' : 'default',
                        borderLeft: hasChildren ? '4px solid var(--pf-v5-global--primary-color--100)' : undefined
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
                            {displayPrototype.config.persona.name} - {displayPrototype.config.persona.role}
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
                        // Split button ONLY for parent prototypes
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
                              Explore
                            </Button>
                          </FlexItem>
                          <FlexItem>
                            <Dropdown
                              isOpen={isDropdownOpen}
                              onSelect={() => toggleDropdown(cardId)}
                              onOpenChange={(isOpen) => {
                                if (!isOpen) toggleDropdown(cardId);
                              }}
                              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  variant="primary"
                                  isExpanded={isDropdownOpen}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown(cardId);
                                  }}
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
                                  
                                  // For parents, show grouped children
                                  const { grouped, standalone } = groupChildrenByVersion(children);
                                  
                                  // Render grouped versions
                                  grouped.forEach((versions, groupName) => {
                                    const displayName = versions[0].config.name;
                                    
                                    if (versions.length === 1) {
                                      // Single version - show directly
                                      const child = versions[0];
                                      items.push(
                                        <DropdownItem
                                          key={child.config.id}
                                          onClick={(e) => {
                                            e?.stopPropagation();
                                            handlePrototypeSelectWithMemory(child.config.id, prototype.config.id);
                                          }}
                                          description={`${child.config.versionLabel || child.config.version} • ${child.config.persona.role}`}
                                          isDisabled={child.config.id === defaultChild.config.id}
                                        >
                                          {displayName}
                                          {child.config.id === defaultChild.config.id && ' (current)'}
                                        </DropdownItem>
                                      );
                                    } else {
                                      // Multiple versions - show with version selector
                                      items.push(
                                        <DropdownItem
                                          key={`header-${groupName}`}
                                          isDisabled
                                          style={{ fontWeight: 'bold', paddingTop: '12px' }}
                                        >
                                          {displayName}
                                        </DropdownItem>
                                      );
                                      
                                      versions.forEach(child => {
                                        const versionDisplay = child.config.versionLabel || child.config.version;
                                        items.push(
                                          <DropdownItem
                                            key={child.config.id}
                                            onClick={(e) => {
                                              e?.stopPropagation();
                                              handlePrototypeSelectWithMemory(child.config.id, prototype.config.id);
                                            }}
                                            description={child.config.persona.role}
                                            isDisabled={child.config.id === defaultChild.config.id}
                                            style={{ paddingLeft: '32px' }}
                                          >
                                            {versionDisplay}
                                            {child.config.id === defaultChild.config.id && ' (current)'}
                                          </DropdownItem>
                                        );
                                      });
                                    }
                                  });
                                  
                                  // Render standalone children (no version group)
                                  if (standalone.length > 0 && grouped.size > 0) {
                                    items.push(<Divider key="divider-standalone" />);
                                  }
                                  
                                  standalone.forEach(child => {
                                    items.push(
                                      <DropdownItem
                                        key={child.config.id}
                                        onClick={(e) => {
                                          e?.stopPropagation();
                                          handlePrototypeSelectWithMemory(child.config.id, prototype.config.id);
                                        }}
                                        description={child.config.persona.role}
                                        isDisabled={child.config.id === defaultChild.config.id}
                                      >
                                        {child.config.name}
                                        {child.config.id === defaultChild.config.id && ' (current)'}
                                      </DropdownItem>
                                    );
                                  });
                                  
                                  return items;
                                })()}
                              </DropdownList>
                            </Dropdown>
                          </FlexItem>
                        </Flex>
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
                          Explore
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
