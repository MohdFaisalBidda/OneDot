'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Search, FileText, Clock, Tag, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentType,Document } from '@/lib/generated/prisma';

type DocumentWithUser = Document & {
  user: {
    name: string | null;
    email: string;
  };
};

export function DocumentsList({
  initialDocuments: documents
}:{
  initialDocuments: DocumentWithUser[];
}) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<DocumentType | 'ALL'>('ALL');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'ALL' || doc.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getTypeBadgeVariant = (type: DocumentType) => {
    switch (type) {
      case 'FOCUS_REVIEW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DECISION_REFLECTION':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'WEEKLY_REVIEW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const formatDocumentType = (type: DocumentType) => {
    return type
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DocumentType | 'ALL')}
          >
            <option value="ALL">All Types</option>
            {Object.values(DocumentType).map((type) => (
              <option key={type} value={type}>
                {formatDocumentType(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No documents found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedType !== 'ALL' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating a new document.'}
          </p>
          <Button asChild>
            <Link href="/dashboard/docs/new">
              Create Document
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Link key={doc.id} href={`/dashboard/docs/${doc.id}`} className="group">
              <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-md hover:border-primary">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-primary">
                      {doc.title || 'Untitled Document'}
                    </CardTitle>
                    <Badge className={getTypeBadgeVariant(doc.type)}>
                      {formatDocumentType(doc.type)}
                    </Badge>
                  </div>
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{doc.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {doc.content?.content?.[0]?.content?.[0]?.text || 'No content yet...'}
                  </p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground">
                      {doc.user.name || doc.user.email.split('@')[0]}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
