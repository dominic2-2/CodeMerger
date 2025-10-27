import React, { useCallback, useState, useRef } from 'react';
import { DocumentPlusIcon, FolderOpenIcon } from './Icons';

interface FileInputProps {
    onFilesSelected: (files: File[]) => void;
    fileCount: number;
}

const FileInput: React.FC<FileInputProps> = ({ onFilesSelected, fileCount }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onFilesSelected(Array.from(event.target.files));
        }
        event.target.value = ''; // Reset input to allow re-selecting the same folder/files
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const getFilesFromEntry = async (entry: any): Promise<File[]> => {
        if (entry.isFile) {
            return new Promise((resolve) => {
                entry.file((file: File) => resolve([file]));
            });
        }
        if (entry.isDirectory) {
            const reader = entry.createReader();
            const entries = await new Promise<any[]>((resolve) => reader.readEntries(resolve));
            const nestedFiles = await Promise.all(entries.map(getFilesFromEntry));
            return nestedFiles.flat();
        }
        return [];
    };

    const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const items = e.dataTransfer.items;
        if (items && items.length > 0) {
            const promises = Array.from(items).map(item => {
                const entry = item.webkitGetAsEntry();
                if (entry) {
                    return getFilesFromEntry(entry);
                }
                return Promise.resolve([]);
            });
            const fileArrays = await Promise.all(promises);
            onFilesSelected(fileArrays.flat());
        }
    }, [onFilesSelected]);

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-md p-8 w-full flex flex-col items-center justify-center text-center transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-gray-700/50' : 'border-gray-600 hover:border-indigo-500 bg-gray-700'}`}
        >
            <input id="file-upload" ref={fileInputRef} name="file-upload" type="file" multiple className="sr-only" onChange={handleFilesChange} />
            <input id="folder-upload" ref={folderInputRef} name="folder-upload" type="file" {...{ directory: "", webkitdirectory: "" }} className="sr-only" onChange={handleFilesChange} />

            {fileCount > 0 ? (
                <div className="text-center">
                    <span className="block text-xl font-semibold text-gray-300">
                        {fileCount} file{fileCount > 1 ? 's' : ''} selected
                    </span>
                    <span className="block text-sm text-gray-400 mt-1">
                        Select more files, a folder, or drag and drop to add.
                    </span>
                </div>
            ) : (
                <div className="text-center">
                    <FolderOpenIcon className="w-12 h-12 text-gray-500 mb-2 mx-auto" />
                    <span className="block text-xl font-semibold text-gray-300">
                        Select files or a folder
                    </span>
                    <span className="block text-sm text-gray-400 mt-1">
                        Or drag and drop here
                    </span>
                </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
                >
                    <DocumentPlusIcon className="w-5 h-5 mr-2" />
                    Select Files
                </button>
                <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="flex items-center justify-center px-5 py-2.5 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
                >
                    <FolderOpenIcon className="w-5 h-5 mr-2" />
                    Select Folder
                </button>
            </div>
        </div>
    );
};

export default FileInput;
