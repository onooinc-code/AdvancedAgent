import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { UsageMetrics } from '../../types/index.ts';

const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const useUsageTracker = () => {
    const [usageMetrics, setUsageMetrics] = useLocalStorage<UsageMetrics>('usage-metrics', {
        totalTokens: 0,
        totalRequests: 0,
        dailyUsage: [],
        agentUsage: {},
    });

    const logUsage = (tokens: number, agentId?: string, requestCount?: number) => {
        const todayStr = getTodayDateString();
        // Handle the case where requestCount is not provided. Default to 1 if an agentId exists, otherwise 0.
        const finalRequestCount = requestCount ?? (agentId ? 1 : 0);

        setUsageMetrics(prev => {
            const newTotalTokens = (prev.totalTokens || 0) + tokens;
            const newTotalRequests = (prev.totalRequests || 0) + finalRequestCount;
            
            // Update global daily usage
            const globalDaily = [...(prev.dailyUsage || [])];
            let globalTodayUsage = globalDaily.find(d => d.date === todayStr);
            if (globalTodayUsage) {
                globalTodayUsage.tokens += tokens;
                globalTodayUsage.requests += finalRequestCount;
            } else {
                globalDaily.push({ date: todayStr, tokens, requests: finalRequestCount });
            }

            // Update agent-specific usage only if an agentId is provided
            const agentUsage = { ...(prev.agentUsage || {}) };
            if (agentId) {
                const currentAgentUsage = agentUsage[agentId] || { totalMessages: 0, dailyUsage: [] };
                
                // For regular agents, a usage log is 1 message. For the manager, it's the number of requests.
                const messageIncrement = agentId === 'manager' ? finalRequestCount : 1;
                currentAgentUsage.totalMessages += messageIncrement;
                
                let agentTodayUsage = currentAgentUsage.dailyUsage.find(d => d.date === todayStr);
                if (agentTodayUsage) {
                    agentTodayUsage.tokens += tokens;
                    agentTodayUsage.messages += messageIncrement;
                } else {
                    currentAgentUsage.dailyUsage.push({ date: todayStr, tokens, messages: messageIncrement });
                }
                agentUsage[agentId] = {
                    ...currentAgentUsage,
                    dailyUsage: currentAgentUsage.dailyUsage.slice(-30) // Prune old data
                };
            }
            
            return { 
                totalTokens: newTotalTokens, 
                totalRequests: newTotalRequests,
                dailyUsage: globalDaily.slice(-30), // Prune old data
                agentUsage
            };
        });
    };

    return { usageMetrics, logUsage };
};