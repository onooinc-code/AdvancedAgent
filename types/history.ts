
import { Message } from './message.ts';

export interface HistoryView {
    fullMessages: Message[];
    summarizedMessages: { id: string; summary: string }[];
    overallSummary: string;
    topics: string[];
}