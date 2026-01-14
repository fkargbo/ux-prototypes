import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Title,
  Content,
  Breadcrumb,
  BreadcrumbItem,
  PageSection,
  Page,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  DrawerPanelBody,
} from '@patternfly/react-core';
import { UserIcon, RobotIcon } from '@patternfly/react-icons';
import Chatbot, { ChatbotDisplayMode } from '@patternfly/chatbot/dist/dynamic/Chatbot';
import { ChatbotContent } from '@patternfly/chatbot/dist/dynamic/ChatbotContent';
import { ChatbotWelcomePrompt } from '@patternfly/chatbot/dist/dynamic/ChatbotWelcomePrompt';
import { ChatbotFooter } from '@patternfly/chatbot/dist/dynamic/ChatbotFooter';
import ChatbotToggle from '@patternfly/chatbot/dist/dynamic/ChatbotToggle';
import { MessageBar } from '@patternfly/chatbot/dist/dynamic/MessageBar';
import { MessageBox } from '@patternfly/chatbot/dist/dynamic/MessageBox';
import Message from '@patternfly/chatbot/dist/dynamic/Message';
import '@patternfly/chatbot/dist/css/main.css';

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
            {/* Regular template page - inside drawer content body so it slides left when drawer opens */}
            <Page className="pf-v6-c-page">
              {/* Breadcrumbs Section - 16px padding */}
              <div className="template-page-breadcrumb">
                <Breadcrumb>
                  <BreadcrumbItem to="#" onClick={() => navigate('/')}>
                    Home
                  </BreadcrumbItem>
                  <BreadcrumbItem to="#" onClick={() => navigate('/core/observe')}>
                    Observe
                  </BreadcrumbItem>
                  <BreadcrumbItem isActive>Dashboards (Perses)</BreadcrumbItem>
                </Breadcrumb>
              </div>

              {/* Heading Section - 24px padding */}
              <div className="template-page-heading">
                <Title headingLevel="h1" size="2xl" style={{ marginBottom: 'var(--pf-v5-global--spacer--sm)' }}>
                  Dashboards (Perses)
                </Title>
                <Content>
                  <p>AI-powered assistant for Perses dashboards. Ask questions about your dashboards, metrics, and observability data.</p>
                </Content>
              </div>

              {/* Content Area - 24px padding */}
              <div className="template-page-content">
                <PageSection hasBodyWrapper>
                  <Content>
                    <p>Dashboard content goes here. Click the floating button in the bottom right corner to open the AI assistant.</p>
                  </Content>
                </PageSection>
              </div>
            </Page>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>

      {/* Floating toggle button - positioned outside drawer, always visible */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
        <ChatbotToggle onClick={() => setIsDrawerOpen(!isDrawerOpen)} />
      </div>
    </>
  );
};
