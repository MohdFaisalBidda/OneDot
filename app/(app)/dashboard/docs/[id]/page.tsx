import { notFound } from 'next/navigation';
import { DocumentEditor } from '@/components/documents/document-editor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismaClient';


export default async function DocumentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return notFound();
  }

  const document = await prisma.document.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!document) {
    return notFound();
  }

  return (
    <DocumentEditor
      initialData={{
        id: document.id,
        title: document.title,
        type: document.type as any,
        content: document.content,
        tags: document.tags,
      }}
    />
  );
}
