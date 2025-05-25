
"use client";

import Link from 'next/link';
import { Edit, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteCourse } from '@/app/admin/courses/actions';
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

interface CourseActionsProps {
  courseId: string;
  courseTitle: string;
}

export function CourseActions({ courseId, courseTitle }: CourseActionsProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteCourse(courseId);
    if (result.success) {
      toast({
        title: 'Course Deleted',
        description: `"${courseTitle}" has been successfully deleted.`,
      });
      // Revalidation is handled by the server action
    } else {
      toast({
        title: 'Error Deleting Course',
        description: result.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
    setIsDeleting(false);
  };

  return (
    <div className="space-x-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/courses/${courseId}/edit`} aria-label={`Edit course ${courseTitle}`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isDeleting} aria-label={`Delete course ${courseTitle}`}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              "{courseTitle}".
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
