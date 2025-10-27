import React, { useState, useCallback } from 'react';
import { MergedFile } from './types';
import { summarizeCode } from './services/geminiService';
import FileInput from './components/FileInput';
import FileList from './components/FileList';
import CodeDisplay from './components/CodeDisplay';
import { SparklesIcon, DocumentDuplicateIcon, CodeBracketIcon } from './components/Icons';

const getFileKey = (file: File): string => {
    return `${(file as any).webkitRelativePath || file.name}-${file.size}-${file.lastModified}`;
};

const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};


const App: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<Map<string, File>>(new Map());
    const [mergedContent, setMergedContent] = useState<string>('');
    const [summary, setSummary] = useState<string>('');
    const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFilesSelected = useCallback((files: File[]) => {
        setSelectedFiles(prevMap => {
            const newMap = new Map(prevMap);
            files.forEach(file => {
                // Don't add empty files that can result from empty directories.
                if (file.size > 0) {
                    newMap.set(getFileKey(file), file);
                }
            });
            return newMap;
        });
        setMergedContent('');
        setSummary('');
        setError(null);
    }, []);

    const handleRemoveFile = useCallback((fileKey: string) => {
        setSelectedFiles(prevMap => {
            const newMap = new Map(prevMap);
            newMap.delete(fileKey);
            return newMap;
        });
        setMergedContent('');
        setSummary('');
    }, []);

    const readFileAsText = (file: File): Promise<MergedFile> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({ name: (file as any).webkitRelativePath || file.name, content: reader.result as string });
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };
    
    const filesArray = Array.from(selectedFiles.values());

    const handleMergeFiles = useCallback(async () => {
        if (filesArray.length === 0) return;
        
        setError(null);
        setSummary('');

        try {
            const fileContents = await Promise.all(filesArray.map(readFileAsText));
            const merged = fileContents.map(file => 
                `/* --- File: ${file.name} --- */\n\n${file.content}\n\n/* --- End of File: ${file.name} --- */`
            ).join('\n\n');
            setMergedContent(merged);
            // Immediately trigger the download
            downloadTextFile(merged, 'merged_code.txt');
        } catch (err) {
            setError('Error reading files. Please ensure they are valid text files.');
            console.error(err);
        }
    }, [filesArray]);

    const handleSummarize = useCallback(async () => {
        if (!mergedContent) return;
        
        setIsLoadingSummary(true);
        setError(null);
        setSummary('');

        try {
            const result = await summarizeCode(mergedContent);
            setSummary(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred with the Gemini API.';
            setError(`Failed to generate summary: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoadingSummary(false);
        }
    }, [mergedContent]);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                        Code Merger & AI Summarizer
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">
                        Combine local files into one, then get an AI-powered summary.
                    </p>
                </header>

                <main className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                        <h2 className="text-2xl font-semibold mb-4 flex items-center">
                            <span className="text-3xl mr-3">1.</span> Select Your Code Files
                        </h2>
                        <FileInput onFilesSelected={handleFilesSelected} fileCount={selectedFiles.size} />
                        {selectedFiles.size > 0 && <FileList files={filesArray} onRemove={handleRemoveFile} getFileKey={getFileKey} />}
                    </div>

                    {selectedFiles.size > 0 && (
                        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                             <h2 className="text-2xl font-semibold mb-4 flex items-center">
                                <span className="text-3xl mr-3">2.</span> Merge Files
                            </h2>
                            <button
                                onClick={handleMergeFiles}
                                disabled={filesArray.length === 0}
                                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                            >
                                <CodeBracketIcon className="w-5 h-5 mr-2" />
                                Merge {filesArray.length} Files and Download
                            </button>
                        </div>
                    )}

                    {mergedContent && (
                        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                            <h2 className="text-2xl font-semibold mb-4 flex items-center">
                                <DocumentDuplicateIcon className="w-6 h-6 mr-3" />
                                Merged Code Preview
                            </h2>
                            <CodeDisplay title="Merged Code" content={mergedContent} />
                            <div className="mt-4">
                                <button
                                    onClick={handleSummarize}
                                    disabled={isLoadingSummary}
                                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-wait transition-opacity"
                                >
                                    {isLoadingSummary ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing Code...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="w-5 h-5 mr-2" />
                                            Generate AI Summary
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                         <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {summary && (
                        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                            <h2 className="text-2xl font-semibold mb-4 flex items-center">
                                <SparklesIcon className="w-6 h-6 mr-3 text-yellow-300" />
                                AI Summary
                            </h2>
                            <CodeDisplay title="AI Summary" content={summary} isSummary={true} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;