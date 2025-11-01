import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editor | Clarity Log',
  description: 'A rich text editor for your thoughts and notes',
};

export default function EditorPage() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full p-4 md:p-8">
      <TiptapEditor />
    </div>
  );
}
