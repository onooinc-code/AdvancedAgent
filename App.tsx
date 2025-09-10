
import React, { useEffect, useState } from 'react';
import { Header } from './components/Header.tsx';
import { MessageList } from './components/MessageList.tsx';
import { ManualSuggestions } from './components/ManualSuggestions.tsx';
import { MessageInput } from './components/MessageInput.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { HistoryModal } from './components/HistoryModal.tsx';
import { ConversationList } from './components/ConversationList.tsx';
import { ConversationSettingsModal } from './components/ConversationSettingsModal.tsx';
import { HtmlPreviewModal } from './components/HtmlPreviewModal.tsx';
import { ActionResponseModal } from './components/ActionResponseModal.tsx';
import { CognitiveInspectorModal } from './components/CognitiveInspectorModal.tsx';
import { PromptInspectorModal } from './components/PromptInspectorModal.tsx';
import { StatusBar } from './components/StatusBar.tsx';
import { LiveStatusIndicator } from './components/LiveStatusIndicator.tsx';
import { useAppContext } from './contexts/StateProvider.tsx';
import { AgentStatsModal } from './components/AgentStatsModal.tsx';
import { TeamGeneratorModal } from './components/TeamGeneratorModal.tsx';
import { ApiUsageModal } from './components/ApiUsageModal.tsx';
import { BookmarkedMessagesPanel } from './components/BookmarkedMessagesPanel.tsx';

export default function App() {
  const { 
    activeConversation,
    messagesEndRef, 
    conversationMode,
    isSettingsOpen,
    setIsSettingsOpen,
    isHistoryOpen,
    setIsHistoryOpen,
    isConversationSettingsOpen,
    setIsConversationSettingsOpen,
    setConversationMode,
    handleShowHistory,
    isBookmarksPanelOpen
  } = useAppContext();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Scroll to bottom of messages on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, messagesEndRef]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close modals with Escape key
      if (e.key === 'Escape') {
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isHistoryOpen) setIsHistoryOpen(false);
        if (isConversationSettingsOpen) setIsConversationSettingsOpen(false);
      }

      // Alt-based shortcuts
      if (e.altKey) {
        e.preventDefault();
        switch (e.key) {
          case '1':
            setConversationMode('Dynamic');
            break;
          case '2':
            setConversationMode('AI');
            break;
          case '3':
            setConversationMode('Manual');
            break;
          case 's':
            setIsSettingsOpen(true);
            break;
          case 'o':
            if (activeConversation) setIsConversationSettingsOpen(true);
            break;
          case 'c':
            if(activeConversation) handleShowHistory();
            break;
          case 'f':
            document.documentElement.requestFullscreen().catch(console.error);
            break;
          case 'm':
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(console.error);
            }
            break;
          case 'n': // New chat
            // handleNewConversation(); // will be in context
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettingsOpen, isHistoryOpen, isConversationSettingsOpen, setIsSettingsOpen, setIsHistoryOpen, setIsConversationSettingsOpen, setConversationMode, handleShowHistory, activeConversation]);

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-gray-200 overflow-hidden" style={{fontFamily: "'Inter', sans-serif"}}>
        <ConversationList isOpen={isSidebarOpen} />
        <div className="flex flex-1 min-w-0">
            <main className="flex flex-col flex-1">
                <Header 
                  isSidebarOpen={isSidebarOpen} 
                  toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  conversation={activeConversation}
                />
                <div className="flex-1 flex flex-col min-h-0">
                  <MessageList conversation={activeConversation} />
                  {activeConversation && conversationMode === 'Manual' && <ManualSuggestions />}
                  {activeConversation && <LiveStatusIndicator />}
                  {activeConversation && <MessageInput />}
                </div>
                <StatusBar />
            </main>
            <BookmarkedMessagesPanel isOpen={isBookmarksPanelOpen} />
        </div>
        <SettingsModal />
        <HistoryModal />
        <ConversationSettingsModal />
        <HtmlPreviewModal />
        <ActionResponseModal />
        <CognitiveInspectorModal />
        <PromptInspectorModal />
        <AgentStatsModal />
        <TeamGeneratorModal />
        <ApiUsageModal />
    </div>
  );
}