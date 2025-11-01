'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Toolbar component
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const items = (editor ? [
    {
      icon: 'bold',
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: 'italic',
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: 'strikethrough',
      title: 'Strike',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
    },
    {
      type: 'divider',
    },
    {
      icon: 'h-1',
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      icon: 'h-2',
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      icon: 'list',
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: 'list-ordered',
      title: 'Ordered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      icon: 'list-checks',
      title: 'Task List',
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editor.isActive('taskList'),
    },
    {
      type: 'divider',
    },
    {
      icon: 'align-left',
      title: 'Left Align',
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: () => editor.isActive({ textAlign: 'left' }),
    },
    {
      icon: 'align-center',
      title: 'Center Align',
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: () => editor.isActive({ textAlign: 'center' }),
    },
    {
      icon: 'align-right',
      title: 'Right Align',
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: () => editor.isActive({ textAlign: 'right' }),
    },
    {
      icon: 'align-justify',
      title: 'Justify',
      action: () => editor.chain().focus().setTextAlign('justify').run(),
      isActive: () => editor.isActive({ textAlign: 'justify' }),
    },
  ] : []) as Array<{
    icon: string;
    title: string;
    action: () => void;
    isActive: () => boolean;
    type?: never;
  } | {
    type: 'divider';
    icon?: never;
    title?: never;
    action?: never;
    isActive?: never;
  }>;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
      {items.map((item, index) => {
        if (item.type === 'divider') {
          return <div key={`divider-${index}`} className="w-px h-8 bg-border mx-1" />;
        }
        
        return (
          <button
            key={item.title}
            onClick={item.action}
            className={cn(
              'p-2 rounded-md hover:bg-accent',
              item.isActive?.() ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
            )}
            title={item.title}
          >
            <span className="font-mono text-sm">{item.icon}</span>
          </button>
        );
      })}
    </div>
  );
};

export function TiptapEditor() {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    immediatelyRender:false,
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
    content: '<h1>Welcome to Clarity Log</h1><p>Start writing your thoughts here...</p>',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none',
      },
    },
  });

  // Auto-save content to localStorage
  useEffect(() => {
    if (!editor) return;

    const saveContent = () => {
      const json = editor.getJSON();
      localStorage.setItem('clarity-log-editor-content', JSON.stringify(json));
    };

    // Save on change with debounce
    const timeout = setTimeout(() => {
      saveContent();
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [editor]);

  // Load saved content on mount
  useEffect(() => {
    if (!editor) return;
    
    const savedContent = localStorage.getItem('clarity-log-editor-content');
    if (savedContent) {
      editor.commands.setContent(JSON.parse(savedContent));
    }
  }, [editor]);

  // Set mounted state for client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border rounded-lg overflow-hidden bg-background">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-auto p-4">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
