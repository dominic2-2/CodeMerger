
import React, { useState, useCallback } from 'react';
import { ClipboardIcon, CheckIcon, ArrowDownTrayIcon } from './Icons';

interface CodeDisplayProps {
    title: string;
    content: string;
    isSummary?: boolean;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ title, content, isSummary = false }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [content]);

    const handleDownload = useCallback(() => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = isSummary ? 'summary.md' : 'merged_code.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [content, isSummary]);

    return (
        <div className="relative">
            <div className="absolute top-2 right-2 flex items-center space-x-2">
                <button
                    onClick={handleCopy}
                    className="p-2 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all"
                    aria-label="Copy to clipboard"
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                </button>
                <button
                    onClick={handleDownload}
                    className="p-2 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all"
                    aria-label="Download file"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
            </div>
            <pre className={`w-full p-4 rounded-md bg-gray-900/70 text-sm text-gray-300 overflow-x-auto max-h-96 ${isSummary ? 'whitespace-pre-wrap' : 'font-mono'}`}>
                <code>{content}</code>
            </pre>
        </div>
    );
};

export default CodeDisplay;
