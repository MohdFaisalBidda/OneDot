import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuration
const R2_CONFIG = {
  accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID!,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
};

// Initialize S3 Client for R2
const getR2Client = () => {
  if (!R2_CONFIG.accountId || !R2_CONFIG.accessKeyId || !R2_CONFIG.secretAccessKey) {
    throw new Error('Missing required Cloudflare R2 environment variables');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_CONFIG.accessKeyId,
      secretAccessKey: R2_CONFIG.secretAccessKey,
    },
  });
};

export interface UploadOptions {
  file: File | Buffer;
  key: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export interface GetFileOptions {
  key: string;
  expiresIn?: number; // seconds, default 3600 (1 hour)
}

export interface GetFileResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface DeleteFileOptions {
  key: string;
}

export interface DeleteFileResult {
  success: boolean;
  error?: string;
}

export interface ListFilesOptions {
  prefix?: string;
  maxKeys?: number;
}

export interface ListFilesResult {
  success: boolean;
  files?: Array<{
    key: string;
    size: number;
    lastModified: Date;
  }>;
  error?: string;
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadToR2(options: UploadOptions): Promise<UploadResult> {
  try {
    const client = getR2Client();
    const { file, key, contentType, metadata } = options;

    let buffer: Buffer;
    let detectedContentType = contentType;

    if (file instanceof File) {
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      detectedContentType = detectedContentType || file.type;
    } else {
      buffer = file;
    }

    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: key,
      Body: buffer,
      ContentType: detectedContentType,
      Metadata: metadata,
    });

    await client.send(command);

    // Generate public URL (requires R2 bucket with public access enabled)
    if (!process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      console.warn(
        '⚠️  CLOUDFLARE_R2_PUBLIC_URL is not configured. Files uploaded but will not be publicly accessible.\n' +
        'To fix this:\n' +
        '1. Go to Cloudflare Dashboard → R2 → Your Bucket → Settings\n' +
        '2. Enable "Public Access" and copy the Public Bucket URL\n' +
        '3. Add CLOUDFLARE_R2_PUBLIC_URL=<your-public-url> to your .env file\n' +
        '4. Restart your server'
      );
    }

    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
      ? `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
      : undefined;

    return {
      success: true,
      key,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get a signed URL for a file in R2
 */
export async function getFileFromR2(options: GetFileOptions): Promise<GetFileResult> {
  try {
    const client = getR2Client();
    const { key, expiresIn = 3600 } = options;

    const command = new GetObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(client, command, { expiresIn });

    return {
      success: true,
      url: signedUrl,
    };
  } catch (error) {
    console.error('Error getting file from R2:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFileFromR2(options: DeleteFileOptions): Promise<DeleteFileResult> {
  try {
    const client = getR2Client();
    let { key } = options;

    key = decodeURIComponent(key);

   const publicBase = process.env.CLOUDFLARE_R2_PUBLIC_URL;
    if (publicBase && key.startsWith(publicBase)) {
      key = key.slice(publicBase.length + 1); // +1 to remove the slash
    }

    console.log('🗑️ Key to delete (decoded):', key);

    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: key,
    });

    const result = await client.send(command);
    console.log(key, result, "result present");

    if (result.$metadata.httpStatusCode === 204) {
      console.log('✅ Successfully deleted from R2:', key);
      return { success: true };
    } else {
      console.warn('⚠️ Delete call did not return 204:', result.$metadata);
      return { success: false, error: 'Unexpected delete response' };
    }
  } catch (error) {
    console.error('❌ Error deleting file from R2:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * List files in R2 bucket
 */
export async function listFilesInR2(options: ListFilesOptions = {}): Promise<ListFilesResult> {
  try {
    const client = getR2Client();
    const { prefix, maxKeys = 1000 } = options;

    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.bucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await client.send(command);

    const files = response.Contents?.map((item) => ({
      key: item.Key!,
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    })) || [];

    return {
      success: true,
      files,
    };
  } catch (error) {
    console.error('Error listing files in R2:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate a unique key for file uploads
 */
export function generateFileKey(filename: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  return prefix
    ? `${prefix}/${timestamp}-${randomString}-${sanitizedFilename}`
    : `${timestamp}-${randomString}-${sanitizedFilename}`;
}
