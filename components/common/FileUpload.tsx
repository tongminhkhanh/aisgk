import React, { useState, useCallback, ChangeEvent } from 'react';
import { UploadIcon, FileIcon, TrashIcon } from '../icons/Icons';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedTypes: string;
  isProcessing?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, acceptedTypes, isProcessing = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative w-full h-40 border-2 border-dashed rounded-lg flex flex-col justify-center items-center transition-colors duration-200 ${
          dragActive ? 'border-primary bg-sky-900/20' : 'border-border-color hover:border-sky-500'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept={acceptedTypes}
        />
        <UploadIcon className="w-8 h-8 text-text-secondary mb-2" />
        <p className="text-text-secondary">
          <span className="font-semibold text-sky-400">Kéo và thả ảnh vào đây</span>
        </p>
        <p className="text-xs text-slate-500">hoặc nhấn để chọn</p>
      </div>

      {selectedFile && (
        <div className="mt-4 bg-slate-700 p-3 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-3 min-w-0">
                {isProcessing ? (
                  <svg className="animate-spin h-6 w-6 text-sky-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FileIcon className="w-6 h-6 text-sky-400 flex-shrink-0"/>
                )}
                <span className="text-sm text-text-primary truncate">{selectedFile.name}</span>
            </div>
          <button 
            onClick={clearFile} 
            className="p-1 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            <TrashIcon className="w-5 h-5"/>
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;