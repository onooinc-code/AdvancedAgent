
import { getGenAIClient } from '../gemini/client.ts';
import { Agent, Message, Attachment, PipelineStep, LongTermMemoryData } from '../../types/index.ts';
import { buildContext } from '../utils/contextBuilder.ts';
import { handleAndThrowError } from '../utils/errorHandler.ts';

export const generateResponse = async (
    latestText: string, 
    agent: Agent, 
    messages: Message[], 
    attachment: Attachment | undefined,
    systemInstructionOverride: string | undefined,
    longTermMemory: LongTermMemoryData,
    onStream: (chunk: string) => void,
    task: string | undefined,
    globalApiKey: string,
): Promise<{ finalResult: string; pipeline: PipelineStep[] }> => {
    const pipeline: PipelineStep[] = [];
    const startTime = performance.now();
    let fullText = '';

    const context = buildContext(messages);
    const baseSystemInstruction = systemInstructionOverride || agent.systemInstruction;
    let finalSystemInstruction = baseSystemInstruction;

    if (agent.knowledge && agent.knowledge.trim()) {
        finalSystemInstruction = `You have the following background knowledge. Use it to inform your responses, but do not mention it directly unless asked.\n\n--- BACKGROUND KNOWLEDGE ---\n${agent.knowledge}\n--- END KNOWLEDGE ---\n\nYour instructions are:\n${finalSystemInstruction}`;
    }

    const memoryString = JSON.stringify(longTermMemory);
    if (memoryString !== '{}') {
        finalSystemInstruction = `Remember the following facts about the user and the ongoing context. This is your long-term memory.\n\n--- LONG-TERM MEMORY ---\n${memoryString}\n--- END MEMORY ---\n\n${finalSystemInstruction}`;
    }

    const contentParts: any[] = [];
    if (attachment) {
        contentParts.push({
            inlineData: {
                mimeType: attachment.mimeType,
                data: attachment.base64,
            },
        });
    }
    
    const userPrompt = task 
        ? `Your specific task for this turn is: "${task}"`
        : `User's latest message: "${latestText}"`;

    contentParts.push(
        { text: `Conversation History:\n${context}\n\n${userPrompt}\n\nYour response:` },
    );
    
    const fullPrompt = {
        parts: contentParts,
        systemInstruction: finalSystemInstruction
    };

    pipeline.push({
        stage: 'Context Assembly',
        input: {
            latestText,
            task,
            messageCount: messages.length,
            agentName: agent.name,
            hasAttachment: !!attachment,
        },
        output: fullPrompt,
    });
    
    const apiKey = agent.apiKey || globalApiKey;
    if (!apiKey) {
        throw new Error(`API Key not configured for agent "${agent.name}". Please set a global key or an agent-specific key in the settings.`);
    }

    try {
        const ai = getGenAIClient(apiKey);
        const stream = await ai.models.generateContentStream({
            model: agent.model,
            contents: { parts: contentParts },
            config: {
                systemInstruction: finalSystemInstruction,
            }
        });

        for await (const chunk of stream) {
            const chunkText = chunk.text;
            if (chunkText) {
                onStream(chunkText);
                fullText += chunkText;
            }
        }
        
        const modelDuration = performance.now() - startTime;

        pipeline.push({
            stage: `Model Invocation for ${agent.name} (streaming)`,
            input: fullPrompt,
            output: { text: fullText },
            durationMs: Math.round(modelDuration),
        });

        return { finalResult: fullText, pipeline };
    } catch (error) {
        // Pass the partially generated text to the error handler
        handleAndThrowError(error, `generateResponse for ${agent.name}`, fullPrompt, fullText);
    }
};