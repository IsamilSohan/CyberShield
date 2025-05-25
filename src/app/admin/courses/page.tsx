
import Link from 'next/link';
import { ArrowLeft, BookOpen, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Course } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';
import { CourseActions } from '@/components/admin/CourseActions'; // Import the new component

async function getCoursesFromFirestore(): Promise<Course[]> {
  if (!adminDb) {
    console.error("AdminCoursesPage: Firebase Admin SDK not initialized. Courses cannot be fetched.");
    throw new Error("Admin SDK not initialized, cannot fetch courses.");
  }
  try {
    const coursesCol = adminDb.collection('courses');
    const courseSnapshot = await coursesCol.orderBy('title').get(); // Optionally order by title
    const coursesList = courseSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Course',
        description: data.description || '',
        longDescription: data.longDescription || '',
        imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
        imageHint: data.imageHint || 'education technology',
        videoUrl: data.videoUrl || '',
        prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
        quizId: data.quizId || '',
      } as Course;
    });
    return coursesList;
  } catch (error) {
    console.error("Error fetching courses from Firestore (Admin SDK):", error);
    throw error;
  }
}

export default async function AdminCoursesPage() {
  let courses: Course[] = [];
  let error: string | null = null;

  try {
    courses = await getCoursesFromFirestore();
  } catch (e: any) {
    console.error("Failed to fetch courses for AdminCoursesPage:", e.message);
    if (e.message.includes("Admin SDK not initialized")) {
      error = "Server configuration error: Unable to connect to the database to fetch courses. (Admin SDK not initialized)";
    } else {
      error = `Failed to load courses. Details: ${e.message}`;
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin Dashboard
      </Link>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-2xl">
              <BookOpen className="mr-3 h-6 w-6 text-primary" />
              Course Management
            </CardTitle>
            <CardDescription>View and manage application courses from Firestore.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/courses/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Course
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
          )}
          {!error && courses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">ID</TableHead>{/*
                    */}<TableHead>Title</TableHead>{/*
                    */}<TableHead className="text-center">Has Video?</TableHead>{/*
                    */}<TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium truncate max-w-xs">{course.id}</TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell className="text-center">{course.videoUrl ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <CourseActions courseId={course.id} courseTitle={course.title} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : !error && (
            <p className="text-muted-foreground">No courses found in Firestore. Click "Add New Course" to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
