import { Document as PrismaDocument } from '@/lib/generated/prisma';

export type DocumentType = 
  | 'GENERAL_NOTES'
  | 'FOCUS_REVIEW'
  | 'DECISION_REFLECTION'
  | 'WEEKLY_REVIEW'
  | 'OTHER';

export type Document = PrismaDocument & {
  content: any; // Tiptap JSON content
  type: DocumentType;
  tags: string[];
  focusIds: string[];
  decisionIds: string[];
  user: {
    name: string | null;
    email: string;
  };
};

export type CreateDocumentInput = {
  title: string;
  content: any; // Tiptap JSON content
  type: DocumentType;
  tags?: string[];
  focusIds?: string[];
  decisionIds?: string[];
};

export type UpdateDocumentInput = Partial<Omit<CreateDocumentInput, 'type'>> & {
  id: string;
};
