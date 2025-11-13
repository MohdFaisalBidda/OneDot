'use client';

import { useState, useCallback } from 'react';
import {
  uploadFileAction,
  uploadMultipleFilesAction,
  getFileUrlAction,
  deleteFileAction,
  listFilesAction,
} from '@/actions/r2';
import { toast } from 'sonner';

export type FileSource = 'focus' | 'decisions' | 'all';

export interface UseR2UploadOptions {
  prefix?: FileSource;
  source?: FileSource;
  onUploadSuccess?: (result: { key?: string; url?: string }) => void;
  onUploadError?: (error: string) => void;
  showToast?: boolean;
}

export interface UploadProgress {
  fileName: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
  key?: string;
}

export function useR2Upload(options: UseR2UploadOptions = {}) {
  const {
    prefix,
    onUploadSuccess,
    onUploadError,
    showToast = true,
    source = 'all',
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  /**
   * Upload a single file
   */
  const uploadFile = useCallback(
    async (file: File, customPrefix?: string) => {
      setIsUploading(true);
      setUploadProgress([
        {
          fileName: file.name,
          status: 'uploading',
        },
      ]);

      try {
        const fileBuffer = await file.arrayBuffer();

        const result = await uploadFileAction({
          fileBuffer,
          filename: file.name,
          contentType: file.type,
          prefix: customPrefix || prefix,
        });

        if (result.success) {
          setUploadProgress([
            {
              fileName: file.name,
              status: 'success',
              url: result.url,
              key: result.key,
            },
          ]);

          if (showToast) {
            toast.success(`${file.name} uploaded successfully!`);
          }

          onUploadSuccess?.({ key: result.key, url: result.url });
          return result;
        } else {
          setUploadProgress([
            {
              fileName: file.name,
              status: 'error',
              error: result.error,
            },
          ]);

          if (showToast) {
            toast.error(`Failed to upload ${file.name}: ${result.error}`);
          }

          onUploadError?.(result.error || 'Upload failed');
          return result;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        setUploadProgress([
          {
            fileName: file.name,
            status: 'error',
            error: errorMessage,
          },
        ]);

        if (showToast) {
          toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
        }

        onUploadError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsUploading(false);
      }
    },
    [prefix, onUploadSuccess, onUploadError, showToast]
  );

  /**
   * Upload multiple files
   */
  const uploadMultipleFiles = useCallback(
    async (files: File[], customPrefix?: string) => {
      setIsUploading(true);
      setUploadProgress(
        files.map((file) => ({
          fileName: file.name,
          status: 'pending' as const,
        }))
      );

      try {
        const fileData = await Promise.all(
          files.map(async (file) => ({
            fileBuffer: await file.arrayBuffer(),
            filename: file.name,
            contentType: file.type,
          }))
        );

        const result = await uploadMultipleFilesAction(
          fileData,
          customPrefix || prefix
        );

        // Update progress for each file
        const updatedProgress = files.map((file, index) => {
          const fileResult = result.results[index];
          return {
            fileName: file.name,
            status: fileResult.success ? ('success' as const) : ('error' as const),
            error: fileResult.error,
            url: fileResult.url,
            key: fileResult.key,
          };
        });

        setUploadProgress(updatedProgress);

        if (result.success && showToast) {
          toast.success(`All ${files.length} files uploaded successfully!`);
        } else if (showToast) {
          const successCount = result.results.filter((r) => r.success).length;
          toast.warning(
            `${successCount} of ${files.length} files uploaded successfully`
          );
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        setUploadProgress(
          files.map((file) => ({
            fileName: file.name,
            status: 'error',
            error: errorMessage,
          }))
        );

        if (showToast) {
          toast.error(`Failed to upload files: ${errorMessage}`);
        }

        onUploadError?.(errorMessage);
        return { success: false, results: [], error: errorMessage };
      } finally {
        setIsUploading(false);
      }
    },
    [prefix, showToast, onUploadError]
  );

  /**
   * Get a signed URL for a file
   */
  const getFileUrl = useCallback(
    async (key: string, expiresIn?: number) => {
      try {
        const result = await getFileUrlAction(key, expiresIn);

        if (!result.success && showToast) {
          toast.error(`Failed to get file URL: ${result.error}`);
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        if (showToast) {
          toast.error(`Failed to get file URL: ${errorMessage}`);
        }

        return { success: false, error: errorMessage };
      }
    },
    [showToast]
  );

  /**
   * Delete a file
   */
  const deleteFile = useCallback(
    async (key: string) => {
      try {
        const result = await deleteFileAction(key,prefix);

        if (result.success && showToast) {
          toast.success('File deleted successfully!');
        } else if (showToast) {
          toast.error(`Failed to delete file: ${result.error}`);
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        if (showToast) {
          toast.error(`Failed to delete file: ${errorMessage}`);
        }

        return { success: false, error: errorMessage };
      }
    },
    [showToast]
  );

  /**
   * List files in R2
   */
  const listFiles = useCallback(
    async (customPrefix?: string, maxKeys?: number) => {
      try {
        const result = await listFilesAction(customPrefix || prefix, maxKeys);

        if (!result.success && showToast) {
          toast.error(`Failed to list files: ${result.error}`);
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        if (showToast) {
          toast.error(`Failed to list files: ${errorMessage}`);
        }

        return { success: false, error: errorMessage };
      }
    },
    [prefix, showToast]
  );

  /**
   * Reset upload progress
   */
  const resetProgress = useCallback(() => {
    setUploadProgress([]);
  }, []);

  return {
    uploadFile,
    uploadMultipleFiles,
    getFileUrl,
    deleteFile,
    listFiles,
    isUploading,
    uploadProgress,
    resetProgress,
  };
}
