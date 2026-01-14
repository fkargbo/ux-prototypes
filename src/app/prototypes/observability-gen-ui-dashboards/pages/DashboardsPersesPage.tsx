import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Title,
  Content,
  Breadcrumb,
  BreadcrumbItem,
  PageSection,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  DrawerPanelBody,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Button,
  SearchInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Badge,
  Label,
  LabelGroup,
  Flex,
  FlexItem,
  Pagination,
  PaginationVariant,
  Tooltip,
} from '@patternfly/react-core';
import {
  UserIcon,
  RobotIcon,
  FilterIcon,
  StarIcon,
  EllipsisVIcon,
  CaretDownIcon,
} from '@patternfly/react-icons';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@patternfly/react-table';
import Chatbot, { ChatbotDisplayMode } from '@patternfly/chatbot/dist/dynamic/Chatbot';
import { ChatbotContent } from '@patternfly/chatbot/dist/dynamic/ChatbotContent';
import { ChatbotWelcomePrompt } from '@patternfly/chatbot/dist/dynamic/ChatbotWelcomePrompt';
import { ChatbotFooter } from '@patternfly/chatbot/dist/dynamic/ChatbotFooter';
import ChatbotToggle from '@patternfly/chatbot/dist/dynamic/ChatbotToggle';
import { MessageBar } from '@patternfly/chatbot/dist/dynamic/MessageBar';
import { MessageBox } from '@patternfly/chatbot/dist/dynamic/MessageBox';
import Message from '@patternfly/chatbot/dist/dynamic/Message';
import '@patternfly/chatbot/dist/css/main.css';
import './dashboards-perses.css';

/**
 * Message interface
 */
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'bot';
  timestamp: Date;
}

/**
 * Dashboard interface
 */
interface Dashboard {
  id: string;
  name: string;
  project: string;
  type: 'Global-scoped' | 'Project-scoped';
  createdBy: string;
  labels: string[];
  createdOn: string;
  lastModified: string;
}

/**
 * Dashboards (Perses) Page
 * 
 * This page displays the PatternFly AI compact chatbot for Perses dashboards.
 * Based on the PatternFly compact chatbot demo pattern.
 */
export const DashboardsPersesPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotToggleRef = useRef<HTMLDivElement>(null);

  // Table state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNameFilterOpen, setIsNameFilterOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Sample dashboard data
  const allDashboards: Dashboard[] = [
    {
      id: '1',
      name: 'dashboard-1',
      project: 'project-1',
      type: 'Global-scoped',
      createdBy: 'kube:admin',
      labels: ['category: infrastructure', 'task: resource-consumption'],
      createdOn: 'Jun 5, 2025, 1:25 AM',
      lastModified: 'Jun 5, 2025, 1:25 AM',
    },
    {
      id: '2',
      name: 'alerts-overview',
      project: 'project 2',
      type: 'Project-scoped',
      createdBy: 'j.doe',
      labels: ['component: observability'],
      createdOn: 'Jun 4, 2025, 3:15 PM',
      lastModified: 'Jun 4, 2025, 3:15 PM',
    },
    {
      id: '3',
      name: 'dashboard-3',
      project: 'project-1',
      type: 'Global-scoped',
      createdBy: 'kube:admin',
      labels: ['category: infrastructure'],
      createdOn: 'Jun 3, 2025, 10:00 AM',
      lastModified: 'Jun 3, 2025, 10:00 AM',
    },
  ];

  // Filter and search
  const filteredDashboards = useMemo(() => {
    return allDashboards.filter(dashboard => {
      if (searchValue && !dashboard.name.toLowerCase().includes(searchValue.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [searchValue]);

  // Pagination
  const paginatedDashboards = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredDashboards.slice(start, end);
  }, [filteredDashboards, page, perPage]);

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle sending messages
  const handleSendMessage = useCallback((message: string | number) => {
    const messageText = String(message);
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: messageText,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        content: `I received your message: "${messageText}". This is a demo response. In a real implementation, this would connect to an AI service to help with Perses dashboard queries.`,
        role: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Chatbot component for drawer panel
  const chatbotPanel = (
    <DrawerPanelContent widths={{ default: 'width_33', lg: 'width_33', xl: 'width_25' }} style={{ minWidth: '400px' }}>
      <DrawerPanelBody style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Chatbot displayMode={ChatbotDisplayMode.drawer}>
          <ChatbotContent>
            {messages.length === 0 && (
              <ChatbotWelcomePrompt
                title="Perses Dashboard Assistant"
                description="How can I help you with your dashboards today?"
              />
            )}
            <MessageBox>
              {messages.map((message) => (
                <Message
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  avatar={(message.role === 'user' ? <UserIcon /> : <RobotIcon />) as any}
                />
              ))}
              {isLoading && (
                <Message
                  role="bot"
                  content="Thinking..."
                  isLoading={true}
                  avatar={<RobotIcon /> as any}
                />
              )}
              <div ref={messagesEndRef} />
            </MessageBox>
          </ChatbotContent>
          <ChatbotFooter>
            <MessageBar onSendMessage={handleSendMessage} />
          </ChatbotFooter>
        </Chatbot>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <>
      {/* Drawer wraps everything - when expanded, page slides left */}
      <Drawer isExpanded={isDrawerOpen} position="end">
        <DrawerContent panelContent={isDrawerOpen ? chatbotPanel : undefined}>
          <DrawerContentBody>
            {/* Regular template page content - using plain divs to avoid Page component conflicts */}
            {/* Breadcrumbs Section - 16px padding */}
            <div className="template-page-breadcrumb">
              <Breadcrumb>
                <BreadcrumbItem to="#" onClick={() => navigate('/core/observe')}>
                  Observe
                </BreadcrumbItem>
                <BreadcrumbItem isActive>Dashboards</BreadcrumbItem>
              </Breadcrumb>
            </div>

            {/* Heading Section - 24px padding */}
            <div className="template-page-heading">
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                <FlexItem>
                  <Title headingLevel="h1" size="2xl" style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                    Dashboards
                  </Title>
                  <Content>
                    <p>View and manage dashboards.</p>
                  </Content>
                </FlexItem>
                <FlexItem>
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Button variant="plain" aria-label="Favorite">
                        <StarIcon />
                      </Button>
                    </FlexItem>
                    <FlexItem>
                      <Dropdown
                        isOpen={isCreateDropdownOpen}
                        onSelect={() => setIsCreateDropdownOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsCreateDropdownOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                            isExpanded={isCreateDropdownOpen}
                            variant="primary"
                          >
                            Create
                            <CaretDownIcon />
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem key="create-dashboard">Create dashboard</DropdownItem>
                          <DropdownItem key="create-from-template">Create from template</DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </FlexItem>
                    <FlexItem>
                      <Button variant="secondary">Import dashboard</Button>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
            </div>

            {/* Content Area - 24px padding */}
            <div className="template-page-content">
              <div className="table-content-card">
                {/* Toolbar with filters and search */}
                <Toolbar>
                  <ToolbarContent style={{ gap: '8px' }}>
                    {/* Filters Dropdown */}
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isFilterOpen}
                        onSelect={() => setIsFilterOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsFilterOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            isExpanded={isFilterOpen}
                            variant="default"
                          >
                            <FilterIcon /> Filters
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem key="type">Type</DropdownItem>
                          <DropdownItem key="project">Project</DropdownItem>
                          <DropdownItem key="created-by">Created by</DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </ToolbarItem>

                    {/* Name Dropdown */}
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isNameFilterOpen}
                        onSelect={() => setIsNameFilterOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsNameFilterOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsNameFilterOpen(!isNameFilterOpen)}
                            isExpanded={isNameFilterOpen}
                            variant="default"
                          >
                            Name
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem key="name">Name</DropdownItem>
                          <DropdownItem key="label">Label</DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </ToolbarItem>

                    {/* Search Bar */}
                    <ToolbarItem>
                      <SearchInput
                        placeholder="Search by name..."
                        value={searchValue}
                        onChange={(_event, value) => setSearchValue(value)}
                        onClear={() => setSearchValue('')}
                      />
                    </ToolbarItem>

                    {/* Pagination at top */}
                    <ToolbarItem align={{ default: 'alignEnd' }}>
                      <Pagination
                        itemCount={filteredDashboards.length}
                        perPage={perPage}
                        page={page}
                        onSetPage={onSetPage}
                        onPerPageSelect={onPerPageSelect}
                        variant={PaginationVariant.top}
                        isCompact
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>

                {/* Table */}
                <Table aria-label="Dashboards table">
                  <Thead>
                    <Tr>
                      <Th>Dashboard name</Th>
                      <Th>Project</Th>
                      <Th>Type</Th>
                      <Th>Created by</Th>
                      <Th>Labels</Th>
                      <Th>Created on</Th>
                      <Th>Last modified</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedDashboards.map((dashboard) => (
                      <Tr key={dashboard.id}>
                        <Td>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                            <FlexItem>
                              <Badge style={{ backgroundColor: '#0066CC', color: 'white' }}>D</Badge>
                            </FlexItem>
                            <FlexItem>
                              <Button variant="link" isInline>
                                {dashboard.name}
                              </Button>
                            </FlexItem>
                          </Flex>
                        </Td>
                        <Td>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                            <FlexItem>
                              <Badge style={{ backgroundColor: '#3E8635', color: 'white' }}>PR</Badge>
                            </FlexItem>
                            <FlexItem>
                              <Button variant="link" isInline>
                                {dashboard.project}
                              </Button>
                            </FlexItem>
                          </Flex>
                        </Td>
                        <Td>
                          <Badge
                            isRead
                            style={{
                              backgroundColor: dashboard.type === 'Global-scoped' 
                                ? 'var(--pf-t--global--color--nonstatus--blue--default)' 
                                : 'var(--pf-t--global--color--nonstatus--purple--default)',
                              color: 'white'
                            }}
                          >
                            {dashboard.type}
                          </Badge>
                        </Td>
                        <Td>{dashboard.createdBy}</Td>
                        <Td>
                          <LabelGroup>
                            {dashboard.labels.map((label, idx) => (
                              <Label key={idx} isCompact color="grey">
                                {label}
                              </Label>
                            ))}
                          </LabelGroup>
                        </Td>
                        <Td>{dashboard.createdOn}</Td>
                        <Td>{dashboard.lastModified}</Td>
                        <Td>
                          <Button variant="plain" aria-label="Actions">
                            <EllipsisVIcon />
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                {/* Pagination at bottom */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0' }}>
                  <Pagination
                    itemCount={filteredDashboards.length}
                    perPage={perPage}
                    page={page}
                    onSetPage={onSetPage}
                    onPerPageSelect={onPerPageSelect}
                    variant={PaginationVariant.bottom}
                  />
                </div>
              </div>
            </div>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>

      {/* Floating toggle button - positioned outside drawer, always visible */}
      <div 
        ref={chatbotToggleRef}
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}
        aria-describedby="chatbot-toggle-tooltip"
      >
        <ChatbotToggle 
          onClick={() => setIsDrawerOpen(!isDrawerOpen)} 
          aria-label="AI assistant"
        />
        <Tooltip 
          id="chatbot-toggle-tooltip"
          content="AI assistant"
          reference={chatbotToggleRef}
          position="left"
        />
      </div>
    </>
  );
};
