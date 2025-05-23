
import Link from 'next/link';
import { ArrowLeft, BookOpen, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Course } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

async function getCoursesFromFirestore(): Promise<Course[]> {
  const coursesCol = collection(db, 'courses');
  const q = query(coursesCol);
  const courseSnapshot = await getDocs(q);
  const coursesList = courseSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || 'Untitled Course',
      description: data.description || '',
      longDescription: data.longDescription || '',
      imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
      imageHint: data.imageHint || 'education technology',
      videoUrl: data.videoUrl || '', // Added videoUrl
      prerequisites: data.prerequisites || [],
      quizId: data.quizId || '', // Added quizId
    } as Course;
  });
  return coursesList;
}

export default async function AdminCoursesPage() {
  let courses: Course[] = [];
  let error: string | null = null;

  try {
    courses = await getCoursesFromFirestore();
  } catch (e) {
    console.error("Failed to fetch courses from Firestore:", e);
    error = "Failed to load courses. Please ensure Firebase is configured correctly and you have a 'courses' collection.";
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
                    <TableHead className="w-[150px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-center">Has Video?</TableHead> {/* Changed from Modules */}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium truncate max-w-xs">{course.id}</TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell className="text-center">{course.videoUrl ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" aria-label={`Edit course ${course.title}`}>
                           <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" aria-label={`Delete course ${course.title}`}>
                           <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : !error && (
            <p className="text-muted-foreground">No courses found in Firestore, or Firebase is not configured. Click "Add New Course" to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
