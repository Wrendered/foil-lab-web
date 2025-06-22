'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  selectedFile?: File | null;
}

export function FileUpload({ onFileSelect, isLoading, selectedFile }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/gpx+xml': ['.gpx'],
    },
    multiple: false,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-all duration-200
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
        ${selectedFile ? 'bg-green-50 border-green-300' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-2">
        {isLoading ? (
          <>
            <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
            <p className="text-lg font-medium">Analyzing track...</p>
          </>
        ) : selectedFile ? (
          <>
            <FileText className="h-12 w-12 text-green-600" />
            <p className="text-lg font-medium text-green-600">
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500">
              Click or drop a new file to change
            </p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-gray-400" />
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop the GPX file here' : 'Drag & drop a GPX file here'}
            </p>
            <p className="text-sm text-gray-500">or click to select</p>
          </>
        )}
      </div>
    </div>
  );
}
