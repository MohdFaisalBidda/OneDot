'use server';

import {
  uploadToR2,
  getFileFromR2,
  deleteFileFromR2,
  listFilesInR2,
  generateFileKey,
  type UploadResult,
  type GetFileResult,
  type DeleteFileResult,
  type ListFilesResult,
} from '@/lib/r2';

export interface UploadFileActionOptions {
  fileBuffer: ArrayBuffer;
  filename: string;
  contentType?: string;
  prefix?: string;
  metadata?: Record<string, string>;
}

/**
 * Server action to upload a file to R2
 */
export async function uploadFileAction(
  options: UploadFileActionOptions
): Promise<UploadResult> {
  try {
    const { fileBuffer, filename, contentType, prefix, metadata } = options;

    // Generate a unique key
    const key = generateFileKey(filename, prefix);

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(fileBuffer);

    // Upload to R2
    const result = await uploadToR2({
      file: buffer,
      key,
      contentType,
      metadata,
    });

    return result;
  } catch (error) {
    console.error('Error in uploadFileAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Server action to get a signed URL for a file
 */
export async function getFileUrlAction(
  key: string,
  expiresIn?: number
): Promise<GetFileResult> {
  try {
    const result = await getFileFromR2({ key, expiresIn });
    return result;
  } catch (error) {
    console.error('Error in getFileUrlAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Server action to delete a file from R2
 */
export async function deleteFileAction(key: string): Promise<DeleteFileResult> {
  try {
    const result = await deleteFileFromR2({ key });
    return result;
  } catch (error) {
    console.error('Error in deleteFileAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Server action to list files in R2
 */
export async function listFilesAction(
  prefix?: string,
  maxKeys?: number
): Promise<ListFilesResult> {
  try {
    const result = await listFilesInR2({ prefix, maxKeys });
    return result;
  } catch (error) {
    console.error('Error in listFilesAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Server action to upload multiple files
 */
export async function uploadMultipleFilesAction(
  files: Array<{
    fileBuffer: ArrayBuffer;
    filename: string;
    contentType?: string;
  }>,
  prefix?: string
): Promise<{ success: boolean; results: UploadResult[]; error?: string }> {
  try {
    const uploadPromises = files.map((file) =>
      uploadFileAction({
        fileBuffer: file.fileBuffer,
        filename: file.filename,
        contentType: file.contentType,
        prefix,
      })
    );

    const results = await Promise.all(uploadPromises);
    const hasErrors = results.some((r) => !r.success);

    return {
      success: !hasErrors,
      results,
      error: hasErrors ? 'Some files failed to upload' : undefined,
    };
  } catch (error) {
    console.error('Error in uploadMultipleFilesAction:', error);
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
