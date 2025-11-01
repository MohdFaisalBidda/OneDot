import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getDocuments } from '@/actions/documents';
import { DocumentsList } from '@/components/documents/documents-list';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Focus Docs | Clarity Log',
  description: 'Manage your focus documents and reflections',
};

export default async function DocsPage() {
  const documents = await getDocuments();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Focus Docs</h1>
          <p className="text-muted-foreground">Your personal documentation and reflections</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/docs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Link>
        </Button>
      </div>
      <div className="bg-background rounded-lg border">
        <Suspense fallback={
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        }>
          <DocumentsList initialDocuments={documents} />
        </Suspense>
      </div>
    </div>
  );
}
