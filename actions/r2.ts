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
import { getCurrentUser } from './auth';
import { prisma } from '@/lib/prismaClient';
import { FileSource } from '@/hooks/use-r2-upload';

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

    // Get current user for user-specific folder structure
    const user = await getCurrentUser();
    if (!user?.email) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Create user-specific prefix: userEmail/prefix (or just userEmail if no prefix)
    const userPrefix = prefix ? `${user.email}/${prefix}` : user.email;

    // Generate a unique key
    const key = generateFileKey(filename, userPrefix);

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

export async function deleteFileAction(key: string, source: FileSource = 'all'): Promise<DeleteFileResult> {
  try {
    console.log(`Deleting file from R2 - Key: ${key}, Source: ${source}`);
    
    // First delete the file from R2
    const result = await deleteFileFromR2({ key });
    
    if (!result.success) {
      return result; // Return early if R2 deletion failed
    }
    
    // Then try to clean up database references based on the source
    try {
      if (source === 'all' || source === 'focus') {
        await prisma.focus.updateMany({
          where: { image: key },
          data: { image: null },
        });
      }
      
      if (source === 'all' || source === 'decisions') {
        await prisma.decision.updateMany({
          where: { image: key },
          data: { image: null },
        });
      }
      
      console.log(`Successfully cleaned up database references for file: ${key} from source: ${source}`);
    } catch (dbError) {
      console.error('Error cleaning up database references:', dbError);
      // Don't fail the entire operation if DB cleanup fails, just log it
    }
    
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
    // Get current user for user-specific folder structure
    const user = await getCurrentUser();
    if (!user?.email) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Create user-specific prefix
    const userPrefix = prefix ? `${user.email}/${prefix}` : user.email;

    const result = await listFilesInR2({ prefix: userPrefix, maxKeys });
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
