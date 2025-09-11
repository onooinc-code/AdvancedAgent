
import React from 'react';
import { useAppContext } from '../contexts/StateProvider.tsx';
import { CloseIcon } from './Icons.tsx';

export const HtmlPreviewModal: React.FC = () => {
    const { isHtmlPreviewOpen, htmlPreviewContent, handleCloseHtmlPreview } = useAppContext();

    return (
        <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 modal-overlay ${isHtmlPreviewOpen ? 'open' : ''}`} onClick={handleCloseHtmlPreview}>
            <div className="glass-pane rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col modal-content shadow-indigo-500/20" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">HTML Preview</h2>
                    <button onClick={handleCloseHtmlPreview} className="p-1 rounded-full hover:bg-white/10">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 p-1 bg-white rounded-b-lg">
                    <iframe
                        srcDoc={htmlPreviewContent}
                        title="HTML Preview"
                        className="w-full h-full border-0 rounded-b-md"
                        sandbox=""
                    />
                </div>
            </div>
        </div>
    );
};