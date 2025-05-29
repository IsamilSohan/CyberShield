
"use client";

import Link from 'next/link';
import { Edit, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteBlogPost } from '@/app/admin/blog/actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BlogPostActionsProps {
  postId: string;
  postTitle: string;
}

export function BlogPostActions({ postId, postTitle }: BlogPostActionsProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteBlogPost(postId);
    if (result.success) {
      toast({
        title: 'Blog Post Deleted',
        description: `"${postTitle}" has been successfully deleted.`,
      });
      // Revalidation is handled by the server action
    } else {
      toast({
        title: 'Error Deleting Blog Post',
        description: result.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
    setIsDeleting(false);
  };

  return (
    <div className="space-x-2">
      <Button variant="outline" size="sm" asChild>
        {/* Link to a future edit page: /admin/blog/[postId]/edit */}
        <Link href={`/admin/blog/${postId}/edit`} aria-label={`Edit blog post ${postTitle}`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isDeleting} aria-label={`Delete blog post ${postTitle}`}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post
              "{postTitle}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
