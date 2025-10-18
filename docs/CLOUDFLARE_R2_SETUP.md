# Cloudflare R2 Setup Guide

This guide explains how to set up and use Cloudflare R2 storage in your application.

## Prerequisites

1. A Cloudflare account
2. An R2 bucket created in your Cloudflare dashboard

## Installation

First, install the required AWS SDK packages:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name

# Optional: Public URL for your R2 bucket (if you have a custom domain or public access configured)
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.your-domain.com
```

### How to Get Your Credentials

1. **Account ID**: 
   - Log in to your Cloudflare dashboard
   - Go to R2 → Overview
   - Your Account ID is displayed on the right side

2. **Access Key & Secret Key**:
   - Go to R2 → Manage R2 API Tokens
   - Click "Create API Token"
   - Give it a name and appropriate permissions (Read & Write)
   - Save the Access Key ID and Secret Access Key

3. **Bucket Name**:
   - Go to R2 → Overview
   - Click "Create bucket" or use an existing bucket name

4. **Public URL** (REQUIRED for public access):
   - Go to R2 → Your Bucket → Settings
   - Scroll to "Public Access"
   - Click "Allow Access" to enable public access
   - Copy the provided Public Bucket URL (looks like: `https://pub-xxxxx.r2.dev`)
   - Use this URL as your `CLOUDFLARE_R2_PUBLIC_URL`
   - Alternatively, you can connect a custom domain:
     - Go to "Custom Domains" section
     - Click "Connect Domain"
     - Follow the instructions to connect your domain
     - Use your custom domain URL as `CLOUDFLARE_R2_PUBLIC_URL`

## Usage Examples

### 1. Using the Polished R2FileUploader Component (Recommended)

The easiest way to add file uploads to your app is using the pre-built `R2FileUploader` component:

#### Single File Upload

```tsx
'use client';

import { R2FileUploader } from '@/components/custom/r2-file-uploader';

export function ProfilePictureUpload() {
  const handleUploadComplete = (files: Array<{ key?: string; url?: string }>) => {
    console.log('File uploaded:', files[0]);
    // Update your state or database with the file URL
  };

  return (
    <R2FileUploader
      prefix="profile-pictures"
      multiple={false}
      onUploadComplete={handleUploadComplete}
    />
  );
}
```

#### Multiple Files Upload

```tsx
'use client';

import { R2FileUploader } from '@/components/custom/r2-file-uploader';

export function GalleryUpload() {
  const handleUploadComplete = (files: Array<{ key?: string; url?: string }>) => {
    console.log('Files uploaded:', files);
    // Process multiple uploaded files
  };

  return (
    <R2FileUploader
      prefix="gallery"
      multiple={true}
      maxFileSize={2 * 1024 * 1024} // 2MB
      onUploadComplete={handleUploadComplete}
    />
  );
}
```

**R2FileUploader Features:**
- ✅ Drag & drop support with visual feedback
- ✅ Client-side validation (file size, type)
- ✅ Real-time image previews
- ✅ Overlay controls (change/remove)
- ✅ Duplicate file prevention
- ✅ Loading states
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Responsive design
- ✅ Theme-aligned styling

### 2. Using the Hook Directly (Advanced)

```tsx
'use client';

import { useR2Upload } from '@/hooks/use-r2-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CustomFileUpload() {
  const { uploadFile, isUploading, uploadProgress } = useR2Upload({
    prefix: 'user-uploads',
    showToast: true,
    onUploadSuccess: (result) => {
      console.log('File uploaded:', result);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      {isUploading && <p>Uploading...</p>}
      
      {uploadProgress.map((progress, index) => (
        <div key={index}>
          {progress.fileName}: {progress.status}
          {progress.url && <a href={progress.url}>View File</a>}
        </div>
      ))}
    </div>
  );
}
```

### 2. Multiple File Upload

```tsx
'use client';

import { useR2Upload } from '@/hooks/use-r2-upload';

export function MultiFileUploadComponent() {
  const { uploadMultipleFiles, isUploading, uploadProgress } = useR2Upload({
    prefix: 'documents',
  });

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const result = await uploadMultipleFiles(files);
    console.log('Upload results:', result);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFilesChange}
        disabled={isUploading}
      />
      
      {uploadProgress.map((progress, index) => (
        <div key={index}>
          <strong>{progress.fileName}</strong>: {progress.status}
          {progress.error && <span className="text-red-500"> - {progress.error}</span>}
        </div>
      ))}
    </div>
  );
}
```

### 3. Using Server Actions Directly

```tsx
'use server';

import { uploadFileAction, getFileUrlAction } from '@/actions/r2';

export async function handleUpload(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    return { error: 'No file provided' };
  }

  const fileBuffer = await file.arrayBuffer();
  
  const result = await uploadFileAction({
    fileBuffer,
    filename: file.name,
    contentType: file.type,
    prefix: 'server-uploads',
  });

  return result;
}
```

### 4. Getting a File URL

```tsx
'use client';

import { useR2Upload } from '@/hooks/use-r2-upload';

export function ViewFileComponent({ fileKey }: { fileKey: string }) {
  const { getFileUrl } = useR2Upload();
  
  const handleViewFile = async () => {
    const result = await getFileUrl(fileKey, 7200); // Expires in 2 hours
    
    if (result.success && result.url) {
      window.open(result.url, '_blank');
    }
  };

  return (
    <button onClick={handleViewFile}>
      View File
    </button>
  );
}
```

### 5. Deleting a File

```tsx
'use client';

import { useR2Upload } from '@/hooks/use-r2-upload';

export function DeleteFileComponent({ fileKey }: { fileKey: string }) {
  const { deleteFile } = useR2Upload();
  
  const handleDelete = async () => {
    const result = await deleteFile(fileKey);
    
    if (result.success) {
      console.log('File deleted successfully');
    }
  };

  return (
    <button onClick={handleDelete}>
      Delete File
    </button>
  );
}
```

### 6. Listing Files

```tsx
'use client';

import { useR2Upload } from '@/hooks/use-r2-upload';
import { useEffect, useState } from 'react';

export function FileListComponent() {
  const { listFiles } = useR2Upload();
  const [files, setFiles] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchFiles = async () => {
      const result = await listFiles('user-uploads', 100);
      
      if (result.success && result.files) {
        setFiles(result.files);
      }
    };
    
    fetchFiles();
  }, [listFiles]);

  return (
    <ul>
      {files.map((file) => (
        <li key={file.key}>
          {file.key} - {file.size} bytes - {file.lastModified.toISOString()}
        </li>
      ))}
    </ul>
  );
}
```

## API Reference

### Hook: `useR2Upload`

#### Options
- `prefix?: string` - Default prefix for file keys
- `onUploadSuccess?: (result) => void` - Callback on successful upload
- `onUploadError?: (error: string) => void` - Callback on upload error
- `showToast?: boolean` - Show toast notifications (default: true)

#### Returns
- `uploadFile(file: File, customPrefix?: string)` - Upload a single file
- `uploadMultipleFiles(files: File[], customPrefix?: string)` - Upload multiple files
- `getFileUrl(key: string, expiresIn?: number)` - Get signed URL for a file
- `deleteFile(key: string)` - Delete a file
- `listFiles(customPrefix?: string, maxKeys?: number)` - List files
- `isUploading: boolean` - Upload status
- `uploadProgress: UploadProgress[]` - Upload progress for each file
- `resetProgress()` - Reset upload progress

### Server Actions

#### `uploadFileAction(options)`
Upload a single file to R2.

#### `uploadMultipleFilesAction(files, prefix?)`
Upload multiple files to R2.

#### `getFileUrlAction(key, expiresIn?)`
Get a signed URL for a file.

#### `deleteFileAction(key)`
Delete a file from R2.

#### `listFilesAction(prefix?, maxKeys?)`
List files in R2 bucket.

## Best Practices

1. **File Naming**: Use the `generateFileKey` function to create unique file keys
2. **Prefixes**: Use prefixes to organize files by category (e.g., 'avatars/', 'documents/')
3. **Security**: Never expose your R2 credentials in client-side code
4. **Error Handling**: Always check the `success` property in results
5. **File Size**: Consider implementing file size limits for uploads
6. **CORS**: Configure CORS settings in your R2 bucket if accessing files from browser

## Troubleshooting

### "Missing required Cloudflare R2 environment variables"
- Ensure all required environment variables are set in `.env.local`
- Restart your development server after adding environment variables

### "Access Denied" errors
- Check that your API token has the correct permissions (Read & Write)
- Verify your bucket name is correct

### Files upload but can't be accessed (Authorization Error)
- **Enable public access on your R2 bucket:**
  1. Go to Cloudflare Dashboard → R2 → Your Bucket
  2. Click on "Settings" tab
  3. Scroll to "Public Access" section
  4. Click "Allow Access" button
  5. Copy the Public Bucket URL (e.g., `https://pub-xxxxxxxxxxxxx.r2.dev`)
  6. Add this URL to your `.env.local` as `CLOUDFLARE_R2_PUBLIC_URL`
  7. Restart your development server
- **Alternative: Use a custom domain:**
  1. Go to your bucket's "Custom Domains" section
  2. Click "Connect Domain" and follow the setup
  3. Use your custom domain as `CLOUDFLARE_R2_PUBLIC_URL`
- **Important:** Without public access enabled, files can only be accessed via presigned URLs
