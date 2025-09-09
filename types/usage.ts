
export interface DailyUsage {
    date: string; // YYYY-MM-DD
    tokens: number;
    requests: number;
}

export interface DailyAgentUsage {
    date: string; // YYYY-MM-DD
    tokens: number;
    messages: number;
}

export interface AgentUsage {
    totalMessages: number;
    dailyUsage: DailyAgentUsage[];
}

export interface UsageMetrics {
    totalTokens: number;
    totalRequests: number;
    dailyUsage: DailyUsage[];
    agentUsage: Record<string, AgentUsage>; // Key is agentId
}