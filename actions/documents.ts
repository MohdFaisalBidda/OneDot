'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { DocumentType } from '@/lib/generated/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismaClient';

// Type for document creation input
type CreateDocumentInput = {
  title: string;
  content: any;
  type: DocumentType;
  tags?: string[];
};

// Type for document update input
type UpdateDocumentInput = {
  id: string;
  title?: string;
  content?: any;
  type?: DocumentType;
  tags?: string[];
};

// Create a new document
export async function createDocument(data: CreateDocumentInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  try {
    const document = await prisma.document.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        tags: data.tags || [],
        user: {
          connect: { email: session.user.email },
        },
      },
    });

    revalidatePath('/dashboard/docs');
    return { id: document.id };
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Failed to create document');
  }
}

// Update an existing document
export async function updateDocument({ id, ...data }: UpdateDocumentInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  try {
    // Verify the document exists and belongs to the user
    const existingDoc = await prisma.document.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existingDoc) {
      throw new Error('Document not found');
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/dashboard/docs');
    revalidatePath(`/dashboard/docs/${id}`);
    return document;
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error('Failed to update document');
  }
}

// Delete a document
export async function deleteDocument(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  try {
    // Verify the document exists and belongs to the user
    const document = await prisma.document.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    await prisma.document.delete({
      where: { id },
    });

    revalidatePath('/dashboard/docs');
    revalidatePath(`/dashboard/docs/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
}

// Get a single document
export async function getDocument(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw new Error('Failed to fetch document');
  }
}

// Get all documents for the current user
export async function getDocuments() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  try {
    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      include:{
        user:true
      },
      orderBy: { updatedAt: 'desc' },
    });

    return documents;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw new Error('Failed to fetch documents');
  }
}
