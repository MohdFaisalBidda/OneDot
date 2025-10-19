'use client';

import { useState, useRef, useCallback, forwardRef, useImperativeHandle, type DragEvent, type ChangeEvent } from 'react';
import { useR2Upload } from '@/hooks/use-r2-upload';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  X, 
  ImageIcon, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  FileImage 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Configuration constants
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp','image/avif'];

export interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

interface R2FileUploaderProps {
  prefix?: string;
  multiple?: boolean;
  maxFileSize?: number;
  acceptedTypes?: string[];
  autoUpload?: boolean; // If false, parent must handle upload
  onUploadComplete?: (files: Array<{ key?: string; url?: string }>) => void;
  onFilesChange?: (files: FileWithPreview[]) => void;
  onFilesSelected?: (files: File[]) => void; // Called when files selected (for manual upload mode)
  className?: string;
}

export interface R2FileUploaderRef {
  resetFiles: () => void;
}

export const R2FileUploader = forwardRef<R2FileUploaderRef, R2FileUploaderProps>(
  (props, ref) => {
  const {
    prefix = 'uploads',
    multiple = false,
    maxFileSize = MAX_FILE_SIZE,
    acceptedTypes = ACCEPTED_IMAGE_TYPES,
    autoUpload = true,
    onUploadComplete,
    onFilesChange,
    onFilesSelected,
    className,
  } = props;
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadingFileIds, setUploadingFileIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFile, uploadMultipleFiles, isUploading } = useR2Upload({
    prefix,
    showToast: true,
    onUploadSuccess: (result) => {
      onUploadComplete?.([result]);
    },
  });

  // Reset files method
  const resetFiles = useCallback(() => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setError('');
    onFilesChange?.([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [files, onFilesChange]);

  // Expose resetFiles method to parent via ref
  useImperativeHandle(ref, () => ({
    resetFiles,
  }), [resetFiles]);

  // Validate file size and type
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2);
      return `File "${file.name}" exceeds ${maxSizeMB}MB limit`;
    }

    if (!acceptedTypes.includes(file.type)) {
      return `File "${file.name}" has an unsupported format. Please upload: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }

    return null;
  }, [maxFileSize, acceptedTypes]);

  // Check for duplicates
  const isDuplicate = useCallback((file: File): boolean => {
    return files.some(f => 
      f.file.name === file.name && 
      f.file.size === file.size && 
      f.file.lastModified === file.lastModified
    );
  }, [files]);

  // Process and add files
  const processFiles = useCallback((fileList: FileList | File[]) => {
    setError('');
    const filesArray = Array.from(fileList);
    
    // Check if adding files would exceed limit
    if (!multiple && filesArray.length > 1) {
      setError('Only one file can be uploaded at a time');
      return;
    }

    if (!multiple && files.length > 0) {
      setError('Please remove the current file before uploading a new one');
      return;
    }

    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    filesArray.forEach(file => {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
        return;
      }

      // Check for duplicates
      if (isDuplicate(file)) {
        errors.push(`File "${file.name}" is already selected`);
        return;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      const id = `${file.name}-${file.lastModified}-${Math.random()}`;
      
      validFiles.push({ file, preview, id });
    });

    if (errors.length > 0) {
      setError(errors.join('. '));
    }

    if (validFiles.length > 0) {
      const newFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(newFiles);
      onFilesChange?.(newFiles);
      
      // If not auto-uploading, notify parent of selected files
      if (!autoUpload) {
        onFilesSelected?.(newFiles.map(f => f.file));
      }
    }
  }, [files, multiple, validateFile, isDuplicate, onFilesChange, autoUpload, onFilesSelected]);

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  // Handle drag events
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Remove file
  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      const newFiles = prev.filter(f => f.id !== id);
      onFilesChange?.(newFiles);
      return newFiles;
    });
    setError('');
  }, [onFilesChange]);

  // Change/replace file (for single mode)
  const handleChangeFile = () => {
    if (files.length > 0) {
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
    }
    fileInputRef.current?.click();
  };

  // Upload files
  const handleUpload = async () => {
    if (files.length === 0) return;

    setError('');
    const fileIds = new Set(files.map(f => f.id));
    setUploadingFileIds(fileIds);

    try {
      if (multiple) {
        const result = await uploadMultipleFiles(files.map(f => f.file));
        
        if (result.success) {
          const uploadedFiles = result.results.map(r => ({
            key: r.key,
            url: r.url,
          }));
          onUploadComplete?.(uploadedFiles);
          
          // Clear files after successful upload
          files.forEach(f => URL.revokeObjectURL(f.preview));
          setFiles([]);
          onFilesChange?.([]);
        } else {
          setError(result.error || 'Upload failed');
        }
      } else {
        const result = await uploadFile(files[0].file);
        
        if (result.success) {
          onUploadComplete?.([{ key: result.key, url: result.url }]);
          
          // Clear file after successful upload
          URL.revokeObjectURL(files[0].preview);
          setFiles([]);
          onFilesChange?.([]);
        } else {
          setError(result.error || 'Upload failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingFileIds(new Set());
    }
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Cleanup previews on unmount
  useState(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview));
    };
  });

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        aria-label={multiple ? 'Upload multiple images' : 'Upload image'}
      />

      {/* Drag and drop zone */}
      {files.length === 0 && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Click or drag files to upload"
          onClick={openFilePicker}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openFilePicker();
            }
          }}
          className={cn(
            'relative flex flex-col items-center justify-center',
            'rounded-2xl border-2 border-dashed transition-all duration-200',
            'cursor-pointer p-8 sm:p-12',
            'hover:border-primary/50 hover:bg-accent/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isDragging 
              ? 'border-primary bg-primary/5 scale-[1.02]' 
              : 'border-muted-foreground/25 bg-background'
          )}
        >
          <div className={cn(
            'rounded-full p-4 mb-4 transition-colors',
            isDragging ? 'bg-primary/10' : 'bg-muted'
          )}>
            <Upload className={cn(
              'h-8 w-8 transition-colors',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">
              {isDragging ? 'Drop files here' : 'Drag & drop images here'}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              {multiple ? 'Multiple files' : 'Single file'} • 
              Max {(maxFileSize / (1024 * 1024)).toFixed(0)}MB • 
              {acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className={cn(
            'grid gap-4',
            multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'
          )}>
            {files.map((fileWithPreview) => {
              const isUploading = uploadingFileIds.has(fileWithPreview.id);
              
              return (
                <div
                  key={fileWithPreview.id}
                  className={cn(
                    'relative group rounded-2xl overflow-hidden',
                    'border-2 border-border transition-all duration-200',
                    'hover:border-primary/50 hover:shadow-lg',
                    multiple ? 'aspect-square' : 'aspect-video max-w-md'
                  )}
                >
                  {/* Image preview */}
                  <img
                    src={fileWithPreview.preview}
                    alt={fileWithPreview.file.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay with controls */}
                  <div className={cn(
                    'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100',
                    'transition-opacity duration-200 flex flex-col items-center justify-center gap-2',
                    'p-4'
                  )}>
                    {/* File info */}
                    <div className="text-center text-white space-y-1">
                      <p className="text-xs font-medium truncate max-w-full px-2">
                        {fileWithPreview.file.name}
                      </p>
                      <p className="text-xs text-white/80">
                        {formatFileSize(fileWithPreview.file.size)}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {!multiple && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={handleChangeFile}
                          disabled={isUploading}
                          aria-label="Change file"
                          className="rounded-full gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Change
                        </Button>
                      )}
                      
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFile(fileWithPreview.id)}
                        disabled={isUploading}
                        aria-label="Remove file"
                        className="rounded-full"
                      >
                        <X className="h-3 w-3" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Loading overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add more button for multiple mode */}
          {multiple && (
            <Button
              type="button"
              variant="outline"
              onClick={openFilePicker}
              disabled={isUploading}
              className="w-full rounded-full gap-2"
              aria-label="Add more files"
            >
              <ImageIcon className="h-4 w-4" />
              Add More Images
            </Button>
          )}

          {/* Upload button - only show if autoUpload is enabled */}
          {autoUpload && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="w-full rounded-full gap-2"
              size="lg"
              aria-label="Upload files"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload {files.length > 1 ? `${files.length} Files` : 'File'}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

R2FileUploader.displayName = 'R2FileUploader';
