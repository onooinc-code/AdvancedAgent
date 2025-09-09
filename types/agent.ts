
export interface Agent {
  id: string;
  name: string;
  job: string; // This is the Job Title
  role?: string;
  goals?: string[];
  specializations?: string[];
  model: string;
  systemInstruction: string;
  apiKey?: string;
  color: string;
  textColor: string;
  outputFormat?: string;
  knowledge?: string;
}

export interface AgentManager {
  model: string;
  systemInstruction: string;
  apiKey?: string;
}