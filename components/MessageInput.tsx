
import React, { useState, useRef } from 'react';
import { Attachment } from '../types/index.ts';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { SendIcon, AttachmentIcon, CloseIcon } from './Icons.tsx';

interface MessageInputProps {}

const MAX_FILE_SIZE_MB = 4;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const MessageInput: React.FC<MessageInputProps> = () => {
    const { handleSendMessage, isLoading, sendOnEnter } = useAppContext();
    const [text, setText] = useState('');
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Only image files are supported.');
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setAttachment({ base64: base64String, mimeType: file.type });
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = () => {
        if (!text.trim() && !attachment) return;
        handleSendMessage(text, attachment || undefined);
        setText('');
        setAttachment(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (sendOnEnter) {
            // Send on Enter, new line with Shift+Enter
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        } else {
            // Send on Ctrl+Enter, new line with Enter
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSend();
            }
        }
    };

    const removeAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    return (
        <footer className="glass-pane p-4 z-10">
            {error && <p className="text-red-400 text-sm text-center mb-2">{error}</p>}
            {attachment && (
                <div className="mb-2 p-2 bg-black/20 rounded-lg flex items-center justify-between animate-fade-in-up">
                    <div className="flex items-center gap-2">
                        <img 
                            src={`data:${attachment.mimeType};base64,${attachment.base64}`} 
                            alt="Attachment preview" 
                            className="w-12 h-12 object-cover rounded"
                        />
                        <span className="text-sm text-gray-300">Image attached</span>
                    </div>
                    <button onClick={removeAttachment} className="p-1 rounded-full hover:bg-white/10" title="Remove attachment">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
            <div className="flex items-center gap-2 glass-pane rounded-xl p-2 neon-focus-ring transition-shadow duration-300">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="file-input"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Attach file"
                    disabled={isLoading}
                    title="Attach an image (max 4MB)"
                >
                    <AttachmentIcon className="w-6 h-6" />
                </button>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message, Shift+Enter for new line"
                    className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none max-h-40"
                    rows={1}
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    className="p-3 bg-indigo-600 rounded-full hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 disabled:scale-100 neon-glow-indigo hover-glow-indigo"
                    disabled={(!text.trim() && !attachment) || isLoading}
                    aria-label="Send message"
                    title={sendOnEnter ? "Send (Enter)" : "Send (Ctrl+Enter)"}
                >
                    <SendIcon className="w-5 h-5"/>
                </button>
            </div>
        </footer>
    );
};