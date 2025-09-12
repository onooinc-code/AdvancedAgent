
import React, { useEffect, useRef, useState } from 'react';
import { Message, Agent, Conversation } from '../types/index.ts';
import { MANAGER_COLOR } from '../constants.ts';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { Avatar } from './Avatar.tsx';
import { 
    CopyIcon, BookmarkIcon, EditIcon, TrashIcon, RegenerateIcon, SummarizeIcon, RewriteIcon, 
    CodeIcon, WorkflowIcon, AlignLeftIcon, AlignRightIcon, ZoomInIcon, ZoomOutIcon, 
    TextLtrIcon, TextRtlIcon, TokenIcon, BookmarkFilledIcon
} from './Icons.tsx';

import { PlanDisplay } from './PlanDisplay.tsx';
import * as TokenCounter from '../services/utils/tokenCounter.ts';
import { safeRender } from '../services/utils/safeRender.ts';

declare const marked: any;
declare const DOMPurify: any;
declare const hljs: any;

interface MessageBubbleProps {
    message: Message;
    agent?: Agent;
    featureFlags?: Conversation['featureFlags'];
}

const LONG_MESSAGE_LINES = 20;
const LONG_MESSAGE_CHARS = 1000;

const ActionButton: React.FC<{onClick: () => void, title: string, 'aria-label': string, children: React.ReactNode, className?: string, disabled?: boolean}> = ({ onClick, title, 'aria-label': ariaLabel, children, className, disabled }) => (
    <button onClick={onClick} title={title} aria-label={ariaLabel} className={`p-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`} disabled={disabled}>
        {children}
    </button>
);

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, agent, featureFlags }) => {
    const { 
        handleShowHtmlPreview, 
        handleUpdateMessageText, 
        handleToggleMessageEdit,
        handleChangeAlternativeResponse,
        handleToggleMessageBookmark,
        handleDeleteMessage,
        handleSummarizeMessage,
        handleRewritePrompt,
        handleRegenerateResponse,
        openInspectorModal,
        openPromptInspectorModal,
        agentBubbleSettings,
        setAgentBubbleSettings,
        userBubbleSettings,
        setUserBubbleSettings,
    } = useAppContext();
    
    const contentRef = useRef<HTMLDivElement>(null);
    const [editText, setEditText] = useState(() => safeRender(message.text));
    const editTextAreaRef = useRef<HTMLTextAreaElement>(null);
    const tokenCount = TokenCounter.estimateTokens(message);

    const activeAlternativeIndex = message.activeAlternativeIndex ?? -1;
    const currentMessageText = activeAlternativeIndex > -1 && message.alternatives?.[activeAlternativeIndex]
        ? message.alternatives[activeAlternativeIndex].text
        : message.text;

    useEffect(() => {
        if (message.isEditing) {
            setEditText(safeRender(message.text));
            setTimeout(() => {
                if (editTextAreaRef.current) {
                    editTextAreaRef.current.focus();
                    editTextAreaRef.current.style.height = 'auto';
                    editTextAreaRef.current.style.height = `${editTextAreaRef.current.scrollHeight}px`;
                }
            }, 0);
        }
    }, [message.isEditing, message.text]);

    const isUser = message.sender === 'user';
    const settings = isUser ? userBubbleSettings : agentBubbleSettings;
    const setSettings = isUser ? setUserBubbleSettings : setAgentBubbleSettings;

    const handleAlignment = (align: 'left' | 'right') => {
        setSettings(prev => ({ ...prev, alignment: align }));
    };
    const handleTextDirection = (dir: 'ltr' | 'rtl') => {
        setSettings(prev => ({ ...prev, textDirection: dir }));
    };
    const handleZoom = (direction: 'in' | 'out') => {
        setSettings(prev => ({ ...prev, scale: Math.max(0.5, Math.min(1.5, prev.scale + (direction === 'in' ? 0.1 : -0.1))) }));
    };
    const handleFontSize = (direction: 'up' | 'down') => {
        setSettings(prev => ({ ...prev, fontSize: Math.max(0.75, Math.min(1.5, prev.fontSize + (direction === 'up' ? 0.1 : -0.1))) }));
    };


    const isPotentiallyLong = !isUser && (safeRender(currentMessageText).split('\n').length > LONG_MESSAGE_LINES || safeRender(currentMessageText).length > LONG_MESSAGE_CHARS);
    const isLongMessageEnabled = !message.isStreaming && isPotentiallyLong && featureFlags?.autoSummarization;
    const [isExpanded, setIsExpanded] = useState(!isLongMessageEnabled);
    
    let _senderName = 'You';
    let _senderJob = 'User';
    let agentColorIndicator = 'bg-indigo-500';

    if (!isUser) {
        if (agent) {
            _senderName = agent.name;
            _senderJob = agent.job;
            agentColorIndicator = typeof agent.color === 'string' ? agent.color : 'bg-gray-500';
        } else if (message.sender === 'system') {
            _senderName = message.messageType === 'insight' ? 'Manager Insight' : 'System';
            _senderJob = 'Manager';
            agentColorIndicator = MANAGER_COLOR.bg;
        }
    }

    const senderName = safeRender(_senderName);
    const senderJob = safeRender(_senderJob);
    
    const handleSaveEdit = () => {
        if (editText.trim()) {
            handleUpdateMessageText(message.id, editText.trim());
        }
    };
    
    const handleCancelEdit = () => {
        handleToggleMessageEdit(message.id);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelEdit();
        }
    };
    
    const handleCopy = () => navigator.clipboard.writeText(safeRender(currentMessageText));

    const getMessageContent = () => {
        const textToRender = safeRender(currentMessageText);
        if (isExpanded) {
            return DOMPurify.sanitize(marked.parse(textToRender));
        }
        const lines = textToRender.split('\n');
        let truncatedText = textToRender;
        if (lines.length > LONG_MESSAGE_LINES) {
            truncatedText = lines.slice(0, LONG_MESSAGE_LINES).join('\n') + '\n...';
        } else if (truncatedText.length > LONG_MESSAGE_CHARS) {
            truncatedText = truncatedText.substring(0, LONG_MESSAGE_CHARS) + '...';
        }
        return DOMPurify.sanitize(marked.parse(truncatedText));
    };

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block as HTMLElement);
            });
            contentRef.current.querySelectorAll('pre').forEach((preElement) => {
                if (preElement.querySelector('.code-toolbar')) return;
                const code = preElement.querySelector('code');
                const lang = Array.from(code?.classList || []).find(cls => cls.startsWith('language-'))?.replace('language-', '') || '';
                const toolbar = document.createElement('div');
                toolbar.className = 'code-toolbar glass-pane rounded-t-md px-3 py-1 flex justify-between items-center text-xs';
                const langSpan = document.createElement('span');
                langSpan.className = 'text-white font-mono';
                langSpan.innerText = lang;
                const buttonsWrapper = document.createElement('div');
                buttonsWrapper.className = 'flex items-center gap-2';
                if (lang === 'html') {
                    const viewButton = document.createElement('button');
                    viewButton.className = 'flex items-center gap-1 text-white hover:text-cyan-400';
                    viewButton.innerHTML = 'View HTML';
                    viewButton.onclick = () => handleShowHtmlPreview(code?.innerText || '');
                    buttonsWrapper.appendChild(viewButton);
                }
                const copyButton = document.createElement('button');
                copyButton.className = 'flex items-center gap-1 text-white hover:text-cyan-400';
                copyButton.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Copy`;
                copyButton.onclick = () => navigator.clipboard.writeText(code?.innerText || '');
                buttonsWrapper.appendChild(copyButton);
                toolbar.appendChild(langSpan);
                toolbar.appendChild(buttonsWrapper);
                preElement.parentNode?.insertBefore(toolbar, preElement);
            });
        }
    }, [currentMessageText, handleShowHtmlPreview, isExpanded]);

    const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (message.isEditing) {
        return (
            <div className="flex w-full px-4 md:px-8 mb-6 animate-fade-in-up">
                 <Avatar name={senderName} color={agentColorIndicator} />
                <div className="flex flex-col w-full ml-4">
                    <div className="rounded-lg p-4 bg-gray-700">
                        <textarea
                            ref={editTextAreaRef}
                            value={editText}
                            onChange={(e) => {
                                setEditText(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            onKeyDown={handleEditKeyDown}
                            className="w-full bg-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            rows={1}
                        />
                        <div className="mt-2 flex justify-end gap-2">
                            <button onClick={handleCancelEdit} className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 rounded">Cancel</button>
                            <button onClick={handleSaveEdit} className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 rounded">Save & Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    const hasAlternatives = message.alternatives && message.alternatives.length > 0;
    const currentResponseIndex = (message.activeAlternativeIndex ?? -1);
    const totalResponses = 1 + (message.alternatives?.length ?? 0);

    const isInsight = message.messageType === 'insight';

    const alignmentClass = {
        left: 'justify-start',
        right: 'justify-end',
    }[settings.alignment];

    return (
        <div id={message.id} className={`w-full px-4 md:px-8 mb-6 animate-fade-in-up flex ${alignmentClass}`}>
            <div className={`flex items-start w-auto max-w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar name={senderName} color={agentColorIndicator} />
                <div 
                    className={`flex flex-col w-full max-w-3xl rounded-xl shadow-md overflow-hidden border ${isUser ? 'border-indigo-700' : 'border-slate-700'} ${isInsight ? '!border-yellow-500/50' : ''} ${isUser ? 'ml-0 mr-4' : 'ml-4'} transition-transform duration-300`}
                    style={{ transform: `scale(${settings.scale})`}}
                >
                    {/* Header */}
                    <div className={`flex items-center justify-between p-3 bg-primary-header ${isInsight ? '!bg-yellow-900/50' : ''} ${isUser ? 'flex-row-reverse' : ''}`} style={{backgroundColor: isInsight ? '' : 'var(--color-primary-header)'}}>
                         <div className={`flex items-center ${isUser ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-3 h-3 rounded-sm ${agentColorIndicator}`}></div>
                            <div className={`mx-3 text-sm font-semibold ${isUser ? 'text-right' : 'text-left'}`}>
                                <p className="text-white">{senderName}</p>
                                <p className="text-white text-xs">{senderJob}</p>
                            </div>
                        </div>
                         <div className="flex items-center text-xs text-gray-500">
                            {hasAlternatives && (
                                <div className="flex items-center gap-2 mr-2 text-white">
                                    <button onClick={() => handleChangeAlternativeResponse(message.id, 'prev')} disabled={currentResponseIndex <= -1} className="disabled:opacity-50">&lt;</button>
                                    <span>{currentResponseIndex + 2} / {totalResponses}</span>
                                    <button onClick={() => handleChangeAlternativeResponse(message.id, 'next')} disabled={currentResponseIndex >= totalResponses - 2} className="disabled:opacity-50">&gt;</button>
                                </div>
                            )}
                            <span>{formattedTime}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div
                        className={`p-4 ${isUser ? 'content-bg-user prose-user' : 'content-bg-agent prose-agent'}`}
                        dir={settings.textDirection}
                        style={{ fontSize: `${settings.fontSize}rem` }}
                    >
                        {message.plan ? (
                            <PlanDisplay plan={message.plan} />
                        ) : (
                            <>
                                <div
                                    ref={contentRef}
                                    className="prose max-w-none prose-p:my-2 prose-headings:my-3"
                                    dangerouslySetInnerHTML={{ __html: getMessageContent() }}
                                />
                                {message.isStreaming && <span className="streaming-cursor"></span>}
                            </>
                        )}
                        
                        {isLongMessageEnabled && (
                             <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold mt-2 focus:outline-none bg-black bg-opacity-5 px-2 py-1 rounded"
                            >
                                {isExpanded ? 'Show Less' : 'Show More'}
                            </button>
                        )}
                         {message.attachment && (
                            <div className="mt-2">
                                <img src={`data:${message.attachment.mimeType};base64,${message.attachment.base64}`} alt="Attachment" className="max-w-xs rounded-lg border-2 border-gray-200" />
                            </div>
                        )}
                    </div>
                    
                    {/* Footer Toolbar */}
                    <div className={`flex items-center p-2 bg-primary-header/70 ${isUser ? 'flex-row-reverse' : ''}`} style={{backgroundColor: 'var(--color-primary-header)'}}>
                        <div className={`flex items-center gap-1 ${isUser ? 'text-white' : 'text-white'}`}>
                           {!isUser && (
                                <>
                                    <ActionButton onClick={() => handleSummarizeMessage(message.id)} title="Summarize message" aria-label="Summarize message" className="hover:bg-gray-700 hover:text-white">
                                        <SummarizeIcon className="w-5 h-5" />
                                    </ActionButton>
                                    <ActionButton onClick={() => handleRegenerateResponse(message.id)} title="Regenerate response" aria-label="Regenerate response" className="hover:bg-gray-700 hover:text-white">
                                        <RegenerateIcon className="w-5 h-5" />
                                    </ActionButton>
                                </>
                            )}
                            {isUser && (
                                <>
                                     <ActionButton onClick={() => handleRewritePrompt(message.id)} title="Rewrite prompt with AI" aria-label="Rewrite prompt" className="hover:bg-indigo-500">
                                        <RewriteIcon className="w-5 h-5" />
                                    </ActionButton>
                                    <ActionButton onClick={() => handleToggleMessageEdit(message.id)} title="Edit message" aria-label="Edit message" className="hover:bg-indigo-500">
                                        <EditIcon className="w-5 h-5" />
                                    </ActionButton>
                                </>
                            )}
                            {message.pipeline && message.pipeline.length > 0 && !isUser && (
                                 <ActionButton onClick={() => openPromptInspectorModal(message)} title="View full prompt & response" aria-label="Inspect prompt" className="hover:bg-gray-700 hover:text-white">
                                    <CodeIcon className="w-5 h-5" />
                                </ActionButton>
                            )}
                             {message.pipeline && message.pipeline.length > 0 && !isUser && (
                                 <ActionButton onClick={() => openInspectorModal(message.pipeline!)} title="View Workflow" aria-label="View AI Workflow" className="hover:bg-gray-700 hover:text-white">
                                    <WorkflowIcon className="w-5 h-5" />
                                </ActionButton>
                            )}
                        </div>
                        <div className="flex-grow"></div>
                         <div className={`flex items-center gap-2 ${isUser ? 'text-white' : 'text-white'}`}>
                            {tokenCount > 0 && (
                                <span className="font-mono text-xs flex items-center gap-1 opacity-80" title={`Estimated Tokens: ${tokenCount}`}>
                                    <TokenIcon className="w-3.5 h-3.5" />
                                    {tokenCount}
                                </span>
                            )}
                            {message.responseTimeMs && <span className="font-mono text-xs opacity-80" title="Response Time">{message.responseTimeMs}ms</span>}
                            
                            {(tokenCount > 0 || message.responseTimeMs) && <div className="w-px h-4 bg-white/10 mx-1"></div>}

                            <ActionButton onClick={() => handleAlignment('left')} title="Align Left" aria-label="Align message left" className={isUser ? "hover:bg-indigo-500" : "hover:bg-gray-700 hover:text-white"}><AlignLeftIcon className="w-5 h-5"/></ActionButton>
                            <ActionButton onClick={() => handleAlignment('right')} title="Align Right" aria-label="Align message right" className={isUser ? "hover:bg-indigo-500" : "hover:bg-gray-700 hover:text-white"}><AlignRightIcon className="w-5 h-5"/></ActionButton>
                            <ActionButton onClick={() => handleTextDirection('ltr')} title="Text LTR" aria-label="Set text direction to left-to-right" className={isUser ? "hover:bg-indigo-500" : "hover:bg-gray-700 hover:text-white"}><TextLtrIcon className="w-5 h-5"/></ActionButton>
                            <ActionButton onClick={() => handleTextDirection('rtl')} title="Text RTL" aria-label="Set text direction to right-to-left" className={isUser ? "hover:bg-indigo-500" : "hover:bg-gray-700 hover:text-white"}><TextRtlIcon className="w-5 h-5"/></ActionButton>
                            <ActionButton onClick={() => handleFontSize('down')} title="Decrease Font Size" aria-label="Decrease font size" disabled={settings.fontSize <= 0.75} className={isUser ? "hover:bg-indigo-500" : "hover:bg-gray-700 hover:text-white"}><ZoomOutIcon className="w-5 h-5"/></ActionButton>
                            <ActionButton onClick={() => handleFontSize('up')} title="Increase Font Size" aria-label="Increase font size" disabled={settings.fontSize >= 1.5} className={isUser ? "hover:bg-indigo-500" : "hover:bg-gray-700 hover:text-white"}><ZoomInIcon className="w-5 h-5"/></ActionButton>
                            <ActionButton onClick={handleCopy} title="Copy message text" aria-label="Copy message" className={isUser ? "hover:bg-indigo-500" : "hover:bg-gray-700 hover:text-white"}>
                                <CopyIcon className="w-5 h-5" />
                            </ActionButton>
                            <ActionButton onClick={() => handleToggleMessageBookmark(message.id)} title="Bookmark message" aria-label="Bookmark message" className={isUser ? "hover:bg-indigo-500" : "hover:bg-gray-700 hover:text-white"}>
                                {message.isBookmarked ? <BookmarkFilledIcon className="w-5 h-5 text-indigo-400" /> : <BookmarkIcon className="w-5 h-5" />}
                            </ActionButton>
                             <ActionButton onClick={() => handleDeleteMessage(message.id)} title="Delete message" aria-label="Delete message" className="text-red-400 hover:bg-red-500/50 hover:text-white">
                                <TrashIcon className="w-5 h-5" />
                            </ActionButton>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
