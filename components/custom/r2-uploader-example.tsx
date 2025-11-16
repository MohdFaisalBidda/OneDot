'use client';

import { useState } from 'react';
import { R2FileUploader } from './r2-file-uploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Example component demonstrating both single and multiple file upload modes
 */
export function R2UploaderExample() {
  const [singleFileUrl, setSingleFileUrl] = useState<string>('');
  const [multipleFileUrls, setMultipleFileUrls] = useState<string[]>([]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">R2 File Uploader Examples</h1>
        <p className="text-muted-foreground">
          Demonstrating single and multiple file upload modes with Cloudflare R2
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Upload</TabsTrigger>
          <TabsTrigger value="multiple">Multiple Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Single File Upload</CardTitle>
              <CardDescription>
                Upload a single image (max 2MB). Perfect for profile pictures, avatars, or single image attachments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <R2FileUploader
                prefix="all"
                multiple={false}
                onUploadComplete={(files) => {
                  if (files[0]?.url) {
                    setSingleFileUrl(files[0].url);
                  }
                }}
              />
              
              {singleFileUrl && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Uploaded File URL:</p>
                  <code className="text-xs break-all">{singleFileUrl}</code>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multiple" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multiple File Upload</CardTitle>
              <CardDescription>
                Upload multiple images at once (each max 2MB). Great for galleries, photo albums, or batch uploads.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <R2FileUploader
                prefix="all"
                multiple={true}
                onUploadComplete={(files) => {
                  const urls = files.map(f => f.url).filter(Boolean) as string[];
                  setMultipleFileUrls(urls);
                }}
              />
              
              {multipleFileUrls.length > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">Uploaded Files ({multipleFileUrls.length}):</p>
                  {multipleFileUrls.map((url, index) => (
                    <div key={index} className="text-xs">
                      <strong>File {index + 1}:</strong>
                      <code className="ml-2 break-all">{url}</code>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>What makes this uploader great</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span><strong>Drag & Drop:</strong> Simply drag files onto the upload zone</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span><strong>File Validation:</strong> Automatic validation for file size (2MB) and type (images only)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span><strong>Image Preview:</strong> See your images before uploading</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span><strong>Duplicate Prevention:</strong> Won't let you select the same file twice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span><strong>Accessibility:</strong> Full keyboard navigation and screen reader support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span><strong>Responsive Design:</strong> Works perfectly on mobile and desktop</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span><strong>Loading States:</strong> Clear visual feedback during upload</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
