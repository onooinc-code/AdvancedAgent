import { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { Conversation, AgentManager, Message } from '../../types/index.ts';
import * as TitleService from '../../services/analysis/titleService.ts';
import { isConversationArray } from '../../types/utils.ts';
import { safeRender } from '../../services/utils/safeRender.ts';

export const useConversationManager = () => {
    const [conversations, setConversations] = useLocalStorage<Conversation[]>('conversations', []);
    const [activeConversationId, setActiveConversationId] = useLocalStorage<string | null>('active-conversation-id', null);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

    const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

    useEffect(() => {
        if (!activeConversationId && conversations.length > 0) {
            setActiveConversationId(conversations[0].id);
        } else if (conversations.length === 0) {
            setActiveConversationId(null);
        }
    }, [conversations, activeConversationId, setActiveConversationId]);


    const handleNewConversation = () => {
        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            title: 'New Chat',
            messages: [],
            featureFlags: {
                memoryExtraction: true,
                proactiveSuggestions: true,
                autoSummarization: true,
            },
            discussionSettings: {
                enabled: false,
                rules: 'Agents should build on each other\'s ideas and work towards a common goal. Keep responses concise.',
            },
            managerSettings: {
                showManagerInsights: false,
            }
        };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
    };

    const handleDeleteConversation = (conversationId: string) => {
        setConversations(prev => {
            const newConversations = prev.filter(c => c.id !== conversationId);
            if (activeConversationId === conversationId) {
                setActiveConversationId(newConversations.length > 0 ? newConversations[0].id : null);
            }
            return newConversations;
        });
    };

    const handleSelectConversation = (conversationId: string) => {
        setActiveConversationId(conversationId);
    };
    
    const handleUpdateConversation = (conversationId: string, updates: Partial<Conversation>) => {
        const sanitizedUpdates = { ...updates };

        // Sanitize any message content before it enters the state.
        if (sanitizedUpdates.messages) {
            sanitizedUpdates.messages = sanitizedUpdates.messages.map(msg => {
                const sanitizedMsg = { ...msg };
                if (Object.prototype.hasOwnProperty.call(sanitizedMsg, 'text')) {
                    sanitizedMsg.text = safeRender(sanitizedMsg.text);
                }
                if (sanitizedMsg.alternatives) {
                    sanitizedMsg.alternatives = sanitizedMsg.alternatives.map(alt => ({
                        ...alt,
                        text: safeRender(alt.text)
                    }));
                }
                return sanitizedMsg;
            });
        }
        // Sanitize the title if it's being updated.
        if (Object.prototype.hasOwnProperty.call(sanitizedUpdates, 'title')) {
            sanitizedUpdates.title = safeRender(sanitizedUpdates.title);
        }

        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, ...sanitizedUpdates } : c));
    };

    const handleUpdateConversationTitle = (conversationId: string, title: string) => {
        handleUpdateConversation(conversationId, { title });
    };

    const handleGenerateTitle = async (conversationId: string, agentManager: AgentManager, globalApiKey: string) => {
        const conversation = conversations.find(c => c.id === conversationId);
        if (!conversation || conversation.messages.length === 0) return;

        setIsGeneratingTitle(true);
        handleUpdateConversation(conversationId, { isGeneratingTitle: true });
        try {
            const newTitle = await TitleService.generateConversationTitle(conversation.messages, agentManager, globalApiKey);
            handleUpdateConversationTitle(conversationId, newTitle);
        } catch(error) {
            const errorMessage = (error instanceof Error) ? error.message : 'Failed to generate title due to an unexpected error.';
            alert(`Title Generation Failed: ${errorMessage}`);
        } finally {
            setIsGeneratingTitle(false);
            handleUpdateConversation(conversationId, { isGeneratingTitle: false });
        }
    };

    const handleExportConversations = () => {
        try {
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(conversations, null, 2)
            )}`;
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.href = jsonString;
            link.download = `ai-assistant-backup-${date}.json`;
            link.click();
        } catch (error) {
            console.error("Failed to export conversations:", error);
            alert("An error occurred while exporting your conversations.");
        }
    };

    const handleImportConversations = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File content is not readable text.");
                }
                const importedData = JSON.parse(text);

                if (!isConversationArray(importedData)) {
                    throw new Error("Invalid file format. The file must contain an array of conversations.");
                }

                setConversations(prev => {
                    const existingIds = new Set(prev.map(c => c.id));
                    const newConversations = importedData.filter(c => !existingIds.has(c.id));
                    const updatedConversations = [...newConversations, ...prev];
                    return updatedConversations;
                });
                alert(`${importedData.length} conversations were found. New conversations have been added to your list.`);

            } catch (error) {
                console.error("Failed to import conversations:", error);
                alert(`Import failed: ${(error as Error).message}`);
            }
        };
        reader.onerror = () => {
             alert("An error occurred while reading the file.");
        }
        reader.readAsText(file);
    };

    const handleToggleMessageBookmark = (messageId: string) => {
        setConversations(prevConversations => {
            if (!activeConversationId) return prevConversations;
            return prevConversations.map(conv => {
                if (conv.id !== activeConversationId) return conv;
                const updatedMessages = conv.messages.map(msg =>
                    msg.id === messageId ? { ...msg, isBookmarked: !msg.isBookmarked } : msg
                );
                return { ...conv, messages: updatedMessages };
            });
        });
    };
    
    const handleDeleteMessage = (messageId: string) => {
        if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
            return;
        }
        setConversations(prevConversations => {
            if (!activeConversationId) return prevConversations;
            return prevConversations.map(conv => {
                if (conv.id !== activeConversationId) return conv;
                const updatedMessages = conv.messages.filter(msg => msg.id !== messageId);
                return { ...conv, messages: updatedMessages };
            });
        });
    };
    
    const handleToggleMessageEdit = (messageId: string) => {
        setConversations(prevConversations => {
            if (!activeConversationId) return prevConversations;
            return prevConversations.map(conv => {
                if (conv.id !== activeConversationId) return conv;
                const updatedMessages = conv.messages.map(msg => ({
                    ...msg,
                    isEditing: msg.id === messageId ? !msg.isEditing : false,
                }));
                return { ...conv, messages: updatedMessages };
            });
        });
    };
    
    const handleUpdateMessageText = (messageId: string, newText: string) => {
        setConversations(prevConversations => {
            if (!activeConversationId) return prevConversations;
            return prevConversations.map(conv => {
                if (conv.id !== activeConversationId) return conv;
                const updatedMessages = conv.messages.map(msg =>
                    msg.id === messageId ? { ...msg, text: newText, isEditing: false } : msg
                );
                return { ...conv, messages: updatedMessages };
            });
        });
    };

    const handleChangeAlternativeResponse = (messageId: string, direction: 'next' | 'prev') => {
        setConversations(prevConversations => {
            if (!activeConversationId) return prevConversations;
            return prevConversations.map(conv => {
                if (conv.id !== activeConversationId) return conv;
                const updatedMessages = conv.messages.map(msg => {
                    if (msg.id !== messageId) return msg;

                    const totalAlternatives = msg.alternatives?.length ?? 0;
                    let currentIndex = msg.activeAlternativeIndex ?? -1;

                    if (direction === 'next') {
                        currentIndex = Math.min(currentIndex + 1, totalAlternatives - 1);
                    } else {
                        currentIndex = Math.max(currentIndex - 1, -1);
                    }
                    return { ...msg, activeAlternativeIndex: currentIndex };
                });
                return { ...conv, messages: updatedMessages };
            });
        });
    };
    
    const handleAppendToMessageText = (conversationId: string, messageId: string, textChunk: string) => {
        try {
            setConversations(prevConversations => prevConversations.map(conv => {
                if (conv.id !== conversationId) return conv;
                const updatedMessages = conv.messages.map(msg => 
                    msg.id === messageId ? { ...msg, text: safeRender(msg.text || '') + textChunk } : msg
                );
                return { ...conv, messages: updatedMessages };
            }));
        } catch (error) {
            console.error("Error appending to message text:", error);
        }
    };

    const handleFinalizeMessage = (conversationId: string, messageId: string, finalMessageData: Partial<Message>) => {
        try {
            const sanitizedData = { ...finalMessageData };
            if (Object.prototype.hasOwnProperty.call(sanitizedData, 'text')) {
                sanitizedData.text = safeRender(sanitizedData.text);
            }

            setConversations(prevConversations => prevConversations.map(conv => {
                if (conv.id !== conversationId) return conv;
                const updatedMessages = conv.messages.map(msg =>
                    msg.id === messageId ? { ...msg, ...sanitizedData } : msg
                );
                return { ...conv, messages: updatedMessages };
            }));
        } catch (error) {
            console.error("Error finalizing message:", error);
        }
    };

    return {
        conversations,
        activeConversationId,
        activeConversation,
        isGeneratingTitle,
        handleNewConversation,
        handleDeleteConversation,
        handleSelectConversation,
        handleUpdateConversation,
        handleUpdateConversationTitle,
        handleGenerateTitle,
        handleExportConversations,
        handleImportConversations,
        handleToggleMessageBookmark,
        handleDeleteMessage,
        handleToggleMessageEdit,
        handleUpdateMessageText,
        handleChangeAlternativeResponse,
        handleAppendToMessageText,
        handleFinalizeMessage,
    };
};
