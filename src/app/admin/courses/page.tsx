
import Link from 'next/link';
import { ArrowLeft, BookOpen, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Course, Module } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';
import { CourseActions } from '@/components/admin/CourseActions';

async function getCoursesFromFirestore(): Promise<Course[]> {
  if (!adminDb) {
    console.error("AdminCoursesPage: Firebase Admin SDK not initialized. Courses cannot be fetched.");
    throw new Error("Admin SDK not initialized, cannot fetch courses.");
  }
  try {
    const courseSnapshot = await adminDb.collection('courses').orderBy('title').get();
    const coursesList = courseSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Course',
        description: data.description || '',
        longDescription: data.longDescription || '',
        imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
        imageHint: data.imageHint || 'education technology',
        prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
        modules: Array.isArray(data.modules) 
          ? data.modules.map((m: any) => ({
              id: m.id || '',
              title: m.title || 'Untitled Module',
              order: typeof m.order === 'number' ? m.order : 0,
              contentBlocks: Array.isArray(m.contentBlocks) ? m.contentBlocks : [],
              quizId: m.quizId || undefined,
            } as Module))
          : [],
      } as Course;
    });
    return coursesList;
  } catch (error) {
    console.error("Error fetching courses from Firestore (Admin SDK used on server component):", error);
    throw error; // Re-throw to be caught by the page
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
    } else if (e.message.includes("firestore/permission-denied")) {
       error = "Permission denied fetching courses. Check Firestore rules or Admin SDK setup if fetching server-side.";
    }
    else {
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
            <CardDescription>View, add, edit, and delete application courses.</CardDescription>
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
                    <TableHead className="w-[150px] hidden sm:table-cell">ID</TableHead>{/*
                    */}<TableHead>Title</TableHead>{/*
                    */}<TableHead className="hidden md:table-cell text-center">Modules</TableHead>{/*
                    */}<TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium truncate max-w-xs hidden sm:table-cell">{course.id}</TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">{course.modules?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        <CourseActions courseId={course.id} courseTitle={course.title} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : !error && (
            <p className="text-muted-foreground">No courses found. Click "Add New Course" to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
