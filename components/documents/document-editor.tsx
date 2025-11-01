'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createDocument, updateDocument } from '@/actions/documents';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentType } from '@/types/document';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  { value: 'GENERAL_NOTES', label: 'General Notes' },
  { value: 'FOCUS_REVIEW', label: 'Focus Review' },
  { value: 'DECISION_REFLECTION', label: 'Decision Reflection' },
  { value: 'WEEKLY_REVIEW', label: 'Weekly Review' },
  { value: 'OTHER', label: 'Other' },
] as const;

type DocumentEditorProps = {
  initialData?: {
    id?: string;
    title: string;
    type: DocumentType;
    content: any;
    tags: string[];
  };
};

export function DocumentEditor({ initialData }: DocumentEditorProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState<DocumentType>(initialData?.type || 'GENERAL_NOTES');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your thoughts here...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: initialData?.content || {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Untitled Document' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Start writing your content here...',
            },
          ],
        },
      ],
    },
  });

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const [isPending, startTransition] = useTransition();

  const handleSave = useCallback(() => {
    if (!title.trim() || !editor || !session?.user?.email) return;

    setIsSaving(true);

    startTransition(async () => {
      try {
        // Get the editor content and ensure it's serializable
        const content = editor.getJSON();
        
        // Create a plain object that's safe to send to the server
        const documentData = {
          title: title.trim(),
          type,
          content: JSON.parse(JSON.stringify(content)), // Ensure deep serialization
          tags: [...tags], // Create a new array to ensure serialization
        };

        let result;
        
        if (initialData?.id) {
          result = await updateDocument({
            id: initialData.id,
            ...documentData,
          });
        } else {
          result = await createDocument(documentData);
        }

        toast.success('Your document has been saved successfully.');

        // If this is a new document, redirect to the edit page
        if (!initialData?.id && result.id) {
          router.push(`/dashboard/docs/${result.id}`);
        }
      } catch (error) {
        console.error('Error saving document:', error);
        toast.error('Failed to save document. Please try again.');
      } finally {
        setIsSaving(false);
      }
    });
  }, [title, type, tags, editor, session, initialData, router, toast]);

  // Auto-save and keyboard shortcuts effect
  useEffect(() => {
    if (!editor) return;

    // Auto-save interval
    const interval = setInterval(() => {
      handleSave();
    }, 30000);

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, handleSave]);

  if (!editor) {
    return <div className="h-64 flex items-center justify-center">Loading editor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold border-none shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Select
                value={type}
                onValueChange={(value) => setType(value as DocumentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((docType) => (
                    <SelectItem key={docType.value} value={docType.value}>
                      {docType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Input
                  placeholder="Add tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  className="w-32 border-dashed"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border">
          <EditorContent editor={editor} className="min-h-[500px] p-6" />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className={cn(
              'transition-opacity',
              !title.trim() ? 'opacity-50' : 'opacity-100'
            )}
          >
            {isSaving ? 'Saving...' : 'Save Document'}
          </Button>
        </div>
      </div>
    </div>
  );
}
