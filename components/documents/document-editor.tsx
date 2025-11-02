'use client';

'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createDocument, updateDocument } from '@/actions/documents';
import { useEditor, EditorContent } from '@tiptap/react';
import tippy, { Instance, Props } from 'tippy.js';
import { Command } from 'cmdk';
import { useDebouncedCallback } from 'use-debounce';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { Underline } from '@tiptap/extension-underline';
import { Strike } from '@tiptap/extension-strike';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { X, Plus, Save, ArrowLeft, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Code, Quote, Image, Link as LinkIcon, Type, Minus, Table as TableIcon, CheckSquare, Strikethrough } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentType } from '@/types/document';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '../ui/label';

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

type SlashCommand = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>; // Update this line
  command: (editor: any) => void | (() => void);
}


export function DocumentEditor({ initialData }: DocumentEditorProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState<DocumentType>(initialData?.type || 'GENERAL_NOTES');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [slashCommandQuery, setSlashCommandQuery] = useState('');
  const slashCommandRef = useRef<Instance<Props> | null>(null);
  const slashCommandElement = useRef<HTMLDivElement>(null);
  const [isTippyMounted, setIsTippyMounted] = useState(false);

  // Initialize editor with extensions
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your thoughts here or type / for commands...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'w-full border-collapse',
        },
      }),
      TableRow,
      TableHeader,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border px-4 py-2',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start',
        },
      }),
      TiptapImage.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Underline,
      Strike,
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-muted p-4 rounded-md font-mono text-sm',
        },
      }),
      TextStyle,
      Color,
    ],
    content: initialData?.content || {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
        },
      ],
    },
    onUpdate: ({ editor }) => {
      // Handle editor updates
    },
  });

  // Add a tag
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() && !tags.includes(tagInput.trim())) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle link insertion
  const handleAddLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  // Handle image insertion
  const handleAddImage = useCallback(() => {
    if (!editor) return;

    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setIsImageModalOpen(false);
    setImageUrl('');
  }, [editor, imageUrl]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!title.trim() || !editor) return;

    setIsSaving(true);
    try {
      const content = editor.getJSON();
      const documentData = {
        title: title.trim(),
        type,
        content,
        tags,
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

      setLastSaveTime(new Date());
      toast.success('Document saved successfully');

      if (result?.id && !initialData?.id) {
        router.push(`/documents/${result.id}`);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  }, [title, type, tags, editor, initialData, router]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save on Cmd/Ctrl + S
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Set up slash commands
  useEffect(() => {
    if (!editor || !showSlashCommands) {
      if (slashCommandRef.current) {
        slashCommandRef.current.destroy();
        slashCommandRef.current = null;
      }
      return;
    }

    const { view, state } = editor;
    const { from } = state.selection;
    const start = view.coordsAtPos(from);
    const editorRect = view.dom.getBoundingClientRect();

    // Create or update Tippy instance
    if (!slashCommandRef.current) {
      const container = document.createElement('div');
      document.body.appendChild(container);

      //Fix type error
      //@ts-ignore
      slashCommandRef.current = tippy(container, {
        content: slashCommandElement.current,
        interactive: true,
        appendTo: () => document.body,
        trigger: 'manual',
        placement: 'bottom-start',
        getReferenceClientRect: () => ({
          width: 1,
          height: 1,
          top: start.top + editorRect.top + 20,
          bottom: start.top + editorRect.top + 21,
          left: start.left + editorRect.left,
          right: start.left + editorRect.left + 1,
          x: start.left + editorRect.left,
          y: start.top + editorRect.top + 20,
          toJSON: () => ({}),
        }),
        onMount: () => {
          setIsTippyMounted(true);
        },
        onHide: () => {
          setIsTippyMounted(false);
        },
        onDestroy: () => {
          if (container?.parentNode) {
            try {
              container.parentNode.removeChild(container);
            } catch (e) {
              // Ignore if already removed
            }
          }
        }
      });
    }

    // Show the Tippy instance
    if (slashCommandRef.current) {
      slashCommandRef.current.setProps({
        getReferenceClientRect: () => ({
          width: 1,
          height: 1,
          top: start.top + editorRect.top + 20,
          bottom: start.top + editorRect.top + 21,
          left: start.left + editorRect.left,
          right: start.left + editorRect.left + 1,
          x: start.left + editorRect.left,
          y: start.top + editorRect.top + 20,
          toJSON: () => ({}),
        })
      });
      slashCommandRef.current.show();
    }

    return () => {
      if (slashCommandRef.current && !isTippyMounted) {
        slashCommandRef.current.destroy();
        slashCommandRef.current = null;
      }
    };
  }, [showSlashCommands, editor, isTippyMounted]);
  // Slash command items
  const slashCommands = useMemo<SlashCommand[]>(() => [
    {
      title: 'Heading 1',
      description: 'Large section heading',
      icon: Type,
      command: (editor: any) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: Type,
      command: (editor: any) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list',
      icon: List,
      command: (editor: any) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: ListOrdered,
      command: (editor: any) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: 'Task List',
      description: 'Track tasks with a todo list',
      icon: CheckSquare,
      command: (editor: any) => editor.chain().focus().toggleTaskList().run(),
    },
    {
      title: 'Table',
      description: 'Insert a table',
      icon: TableIcon,
      command: (editor: any) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      title: 'Image',
      description: 'Upload or embed an image',
      icon: Image,
      command: () => {
        setIsImageModalOpen(true);
        return undefined;
      },
    },
    {
      title: 'Link',
      description: 'Add a link',
      icon: LinkIcon,
      command: () => {
        const previousUrl = editor?.getAttributes('link').href;
        setLinkUrl(previousUrl || '');
        setIsLinkModalOpen(true);
        return undefined;
      },
    },
  ], [editor]);

  // Filter slash commands based on query
  const filteredCommands = useMemo(() => {
    if (!slashCommandQuery) return slashCommands;
    return slashCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(slashCommandQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(slashCommandQuery.toLowerCase())
    );
  }, [slashCommandQuery, slashCommands]);

  // Handle slash command key press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === '/' && !showSlashCommands) {
        setShowSlashCommands(true);
        event.preventDefault();
      }
    },
    [showSlashCommands]
  );

  // Handle editor changes for slash commands
  const handleEditorUpdate = useCallback(
    ({ editor: editorInstance }: { editor: any }) => {
      const { state } = editorInstance;
      const { selection } = state;
      const { $from } = selection;
      const textBeforeCursor = $from.nodeBefore?.text || '';

      if (textBeforeCursor.endsWith('/') && !showSlashCommands) {
        setShowSlashCommands(true);
        setSlashCommandQuery('');
      } else if (showSlashCommands) {
        const textAfterSlash = textBeforeCursor.split('/').pop() || '';
        setSlashCommandQuery(textAfterSlash);
      }
    },
    [showSlashCommands]
  );

  // Handle slash command selection
  const handleCommandSelect = useCallback(
    (command: SlashCommand) => {
      if (command.command && editor) {
        command.command(editor);
      }
      setShowSlashCommands(false);
      editor?.commands.focus();
    },
    [editor]
  );

  // Auto-save with debounce
  const autoSave = useDebouncedCallback(async () => {
    if (!title.trim() || !editor) return;

    setIsSaving(true);
    try {
      const content = editor.getJSON();
      const documentData = {
        title: title.trim(),
        type,
        content,
        tags,
      };

      if (initialData?.id) {
        await updateDocument({
          id: initialData.id,
          ...documentData,
        });
      } else {
        await createDocument(documentData);
      }

      setLastSaveTime(new Date());
    } catch (error) {
      console.error('Error auto-saving document:', error);
      toast.error('Failed to auto-save document');
    } finally {
      setIsSaving(false);
    }
  }, 2000);

  const [isPending, startTransition] = useTransition();

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

  // Floating toolbar items
  const toolbarItems = [
    {
      name: 'heading',
      icon: Type,
      active: () => editor?.isActive('heading') || false,
      onClick: () => {
        const level = editor?.getAttributes('heading')?.level || 0;
        const newLevel = level < 3 ? level + 1 : 0;
        if (newLevel === 0) {
          editor?.chain().focus().toggleHeading({ level: 1 }).run();
        } else {
          editor?.chain().focus().toggleHeading({ level: newLevel as 1 | 2 | 3 }).run();
        }
      },
    },
    {
      name: 'bold',
      icon: Bold,
      active: () => editor?.isActive('bold') || false,
      onClick: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      name: 'italic',
      icon: Italic,
      active: () => editor?.isActive('italic') || false,
      onClick: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      name: 'underline',
      icon: UnderlineIcon,
      active: () => editor?.isActive('underline') || false,
      onClick: () => editor?.chain().focus().toggleUnderline().run(),
    },
    {
      name: 'strikethrough',
      icon: Strikethrough,
      active: () => editor?.isActive('strike') || false,
      onClick: () => editor?.chain().focus().toggleStrike().run(),
    },
    {
      type: 'divider',
    },
    {
      name: 'bulletList',
      icon: List,
      active: () => editor?.isActive('bulletList') || false,
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      name: 'orderedList',
      icon: ListOrdered,
      active: () => editor?.isActive('orderedList') || false,
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      name: 'taskList',
      icon: CheckSquare,
      active: () => editor?.isActive('taskList') || false,
      onClick: () => editor?.chain().focus().toggleTaskList().run(),
    },
    {
      type: 'divider',
    },
    {
      name: 'blockquote',
      icon: Quote,
      active: () => editor?.isActive('blockquote') || false,
      onClick: () => editor?.chain().focus().toggleBlockquote().run(),
    },
    {
      name: 'codeBlock',
      icon: Code,
      active: () => editor?.isActive('codeBlock') || false,
      onClick: () => editor?.chain().focus().toggleCodeBlock().run(),
    },
    {
      name: 'horizontalRule',
      icon: Minus,
      onClick: () => editor?.chain().focus().setHorizontalRule().run(),
    },
    {
      name: 'table',
      icon: TableIcon,
      active: () => editor?.isActive('table') || false,
      onClick: () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
  ];

  // Render the editor UI
  if (!editor) {
    return <div className="flex items-center justify-center p-8">Loading editor...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button and save status */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-4">
          {lastSaveTime && (
            <div className="text-sm text-muted-foreground">
              {isSaving ? 'Saving...' : `Last saved at ${lastSaveTime.toLocaleTimeString()}`}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Document title */}
      <div className="flex items-center gap-x-4 mb-4">
        <Label className="border-none shadow-none focus-visible:ring-0">
          Title:
        </Label>
        <Input
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 p-0"
        />
      </div>

      {/* Document metadata */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
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
              <Badge key={tag} variant="outline" className="flex items-center gap-1 bg-white">
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

      {/* Editor container */}
      <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-background">
        {/* Floating toolbar */}
        <div className="p-2 border-b">
          <div className="flex items-center gap-1">
            {toolbarItems.map((item, index) => {
              if (item.type === 'divider') {
                return <div key={`divider-${index}`} className="w-px h-6 bg-border mx-1" />;
              }

              const Icon = item.icon;
              const isActive = item.active?.() || false;

              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-8 w-8 rounded-md',
                        isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'
                      )}
                      onClick={item.onClick}
                    >
                      {React.createElement(Icon as React.ComponentType<{ className?: string }>, { className: "h-4 w-4" })}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {item.name?.replace(/([A-Z])/g, ' $1').trim()}
                  </TooltipContent>
                </Tooltip>
              );
            })}

            <div className="w-px h-6 bg-border mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md hover:bg-muted/50"
                  onClick={() => {
                    const previousUrl = editor.getAttributes('link').href;
                    setLinkUrl(previousUrl || '');
                    setIsLinkModalOpen(true);
                  }}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Add link</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md hover:bg-muted/50"
                  onClick={() => {
                    setImageUrl('');
                    setIsImageModalOpen(true);
                  }}
                >
                  <Image className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Add image</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Editor content */}
        <div className="flex-1 overflow-y-auto p-4 relative">
          {/* Bubble menu for selected text */}
          {/* <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100, placement: 'top' }}
            className="bg-background border rounded-md shadow-lg p-1 flex items-center gap-1"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-accent' : ''}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-accent' : ''}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                setLinkUrl(previousUrl || '');
                setIsLinkModalOpen(true);
              }}
              className={editor.isActive('link') ? 'bg-accent' : ''}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </BubbleMenu> */}

          {/* Editor content */}
          <EditorContent
            editor={editor}
            className="h-full focus:outline-none min-h-[300px] [&_.tiptap]:outline-none  [&_.tiptap]:prose dark:[&_.tiptap]:prose-invert [&_.tiptap]:prose-sm sm:[&_.tiptap]:prose lg:[&_.tiptap]:prose-lg [&_.tiptap]:max-w-none [&_.tiptap]:focus:outline-none [&_.tiptap.ProseMirror]:min-h-[300px]"
            onKeyDown={(e) => {
              if (e.key === 'Escape' && showSlashCommands) {
                setShowSlashCommands(false);
              } else if (e.key === '/') {
                setShowSlashCommands(true);
              }
            }}
          />

          {/* Slash command menu */}
          {showSlashCommands && (
            <div
              ref={slashCommandElement}
              className="z-50 w-64 bg-background border rounded-md shadow-lg overflow-hidden absolute top-8 left-8"
            >
              <Command className="w-full">
                <Command.Input
                  placeholder="Search commands..."
                  value={slashCommandQuery}
                  onValueChange={setSlashCommandQuery}
                  className="w-full p-2 border-b"
                  autoFocus
                />
                <Command.List className="max-h-[300px] overflow-y-auto">
                  {filteredCommands.length > 0 ? (
                    filteredCommands.map((cmd) => (
                      <Command.Item
                        key={cmd.title}
                        onSelect={() => handleCommandSelect(cmd)}
                        className="px-2 py-1.5 text-sm rounded-sm flex items-center gap-2 hover:bg-accent cursor-pointer"
                      >
                        <cmd.icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{cmd.title}</div>
                          <div className="text-xs text-muted-foreground">{cmd.description}</div>
                        </div>
                      </Command.Item>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      No commands found
                    </div>
                  )}
                </Command.List>
              </Command>
            </div>
          )}
        </div>
      </div>

      {/* Link dialog */}
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{linkUrl ? 'Edit Link' : 'Add Link'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddLink();
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLink}>
                {linkUrl ? 'Update' : 'Add'} Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image dialog */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddImage();
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddImage} disabled={!imageUrl.trim()}>
                Add Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}