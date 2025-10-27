import React from 'react';
import { XCircleIcon } from './Icons';

interface FileListProps {
    files: File[];
    onRemove: (fileKey: string) => void;
    getFileKey: (file: File) => string;
}

const FileList: React.FC<FileListProps> = ({ files, onRemove, getFileKey }) => {
    return (
        <div className="mt-6 space-y-2">
            <h3 className="text-lg font-medium text-gray-300">Selected Files:</h3>
            <ul className="max-h-48 overflow-y-auto rounded-md bg-gray-900/50 p-2 border border-gray-700">
                {files.map(file => {
                    const key = getFileKey(file);
                    const displayName = (file as any).webkitRelativePath || file.name;
                    return (
                        <li key={key} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700 transition-colors">
                            <span className="text-sm text-gray-300 truncate" title={displayName}>
                                {displayName}
                            </span>
                            <button
                                onClick={() => onRemove(key)}
                                className="text-gray-500 hover:text-red-400 focus:outline-none focus:text-red-400 transition-colors flex-shrink-0"
                                aria-label={`Remove ${displayName}`}
                            >
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default FileList;
