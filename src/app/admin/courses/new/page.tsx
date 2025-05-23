
import Link from 'next/link';
import { ArrowLeft, BookPlus } from 'lucide-react';
import { AddCourseForm } from '@/components/admin/AddCourseForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/courses" className="inline-flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course Management
      </Link>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <BookPlus className="mr-3 h-6 w-6 text-primary" />
            Add New Course
          </CardTitle>
          <CardDescription>Fill in the details for the new course.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddCourseForm />
        </CardContent>
      </Card>
    </div>
  );
}
