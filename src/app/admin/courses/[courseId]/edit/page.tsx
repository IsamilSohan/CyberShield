
import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminDb } from '@/lib/firebase-admin';
import type { Course } from '@/lib/types';

type EditCoursePageProps = {
  params: { courseId: string };
};

async function getCourseData(courseId: string): Promise<Course | null> {
  if (!adminDb) {
    console.error("EditCoursePage: Firebase Admin SDK not initialized.");
    return null;
  }
  try {
    const courseRef = adminDb.collection('courses').doc(courseId);
    const courseSnap = await courseRef.get();

    if (!courseSnap.exists) {
      return null;
    }
    const data = courseSnap.data() as Omit<Course, 'id'>;
    return { id: courseSnap.id, ...data };
  } catch (error) {
    console.error("Error fetching course for edit page:", error);
    return null;
  }
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const course = await getCourseData(params.courseId);

  if (!course) {
    return (
      <div className="space-y-6">
        <Link href="/admin/courses" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course Management
        </Link>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Course</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">Course not found or an error occurred.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/courses" className="inline-flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course Management
      </Link>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            Edit Course: {course.title}
          </CardTitle>
          <CardDescription>Modify the details for this course. (Edit form not yet implemented)</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <Construction className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            The form to edit this course is under construction.
          </p>
          {/* Placeholder for EditCourseForm component */}
          {/* <EditCourseForm course={course} /> */}
        </CardContent>
      </Card>
    </div>
  );
}
