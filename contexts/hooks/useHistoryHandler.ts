
import { useState } from 'react';
import { Conversation, AgentManager, HistoryView, Message } from '../../types/index.ts';
import * as HistoryService from '../../services/analysis/historyService.ts';
import { HISTORY_CONFIG } from '../../constants.ts';

export const useHistoryHandler = () => {
    const [historyView, setHistoryView] = useState<HistoryView | null>(null);
    const [isGeneratingHistory, setIsLoading] = useState(false);

    const handleShowHistory = async (conversation: Conversation | null, agentManager: AgentManager, globalApiKey: string): Promise<boolean> => {
        if (!conversation) return false;

        setIsLoading(true);
        setHistoryView(null);
        
        try {
            const messages = conversation.messages;
            const fullMessages = messages.slice(-HISTORY_CONFIG.FULL_MESSAGE_COUNT);
            const olderMessages = messages.slice(0, -HISTORY_CONFIG.FULL_MESSAGE_COUNT);
            
            const summarizedMessages: { id: string; summary: string }[] = [];
            if (olderMessages.length > 0) {
                const chunks: Message[][] = [];
                for (let i = 0; i < olderMessages.length; i += HISTORY_CONFIG.SUMMARIZED_CHUNK_SIZE) {
                    chunks.push(olderMessages.slice(i, i + HISTORY_CONFIG.SUMMARIZED_CHUNK_SIZE));
                }

                const summaries = await Promise.all(
                    chunks.map(chunk => HistoryService.summarizeMessageChunk(chunk, agentManager, globalApiKey))
                );

                summaries.forEach((summary, index) => {
                    summarizedMessages.push({ id: `chunk-${index}`, summary });
                });
            }

            const { overallSummary, topics } = await HistoryService.generateOverallSummaryAndTopics(messages, agentManager, globalApiKey);
            
            setHistoryView({
                fullMessages,
                summarizedMessages,
                overallSummary,
                topics,
            });
        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : 'Failed to generate history view.';
            setHistoryView({
                fullMessages: [],
                summarizedMessages: [],
                overallSummary: `Error: ${errorMessage}`,
                topics: [],
            });
        } finally {
            setIsLoading(false);
        }
        return true; // Signal that the process is complete
    };

    return {
        historyView,
        isGeneratingHistory,
        handleShowHistory
    };
};