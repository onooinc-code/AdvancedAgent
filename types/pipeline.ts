
export interface PipelineStep {
    stage: string; // e.g., "Context Assembly", "Model Invocation"
    input: any;    // The data that went into this stage
    output: any;   // The data that came out
    durationMs?: number;
}