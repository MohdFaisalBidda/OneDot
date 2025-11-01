import { Metadata } from 'next';
import { DocumentEditor } from '@/components/documents/document-editor';

export const metadata: Metadata = {
  title: 'New Document | Clarity Log',
  description: 'Create a new document',
};

export default function NewDocumentPage() {
  return (
    <div className="container mx-auto p-4">
      <DocumentEditor />
    </div>
  );
}
