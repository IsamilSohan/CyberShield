
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
// VideoPlayer removed as videos are now per module
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Info, Loader2, BookOpen, ListChecks } from 'lucide-react'; // PlayCircle removed, BookOpen/ListChecks added
import { Badge } from '@/components/ui/badge';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import type { Course, Module } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [course, setCourse] = useState<Course | null | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        async function fetchCourseFromDb() {
          if (!courseId) {
            setIsLoadingPage(false);
            setCourse(null);
            return;
          }
          try {
            const courseRef = doc(db, "courses", courseId as string);
            const courseSnap = await getDoc(courseRef);
            if (courseSnap.exists()) {
              const data = courseSnap.data();
              setCourse({
                id: courseSnap.id,
                title: data.title || 'Untitled Course',
                description: data.description || '',
                longDescription: data.longDescription || '',
                imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
                imageHint: data.imageHint || 'education technology',
                prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
                modules: Array.isArray(data.modules) ? data.modules.sort((a: Module, b: Module) => a.order - b.order) : [], // Sort modules by order
                // videoUrl: data.videoUrl || '', // Removed
                // quizId: data.quizId || '', // Removed
              } as Course);
            } else {
              setCourse(null);
            }
          } catch (error) {
            console.error("Error fetching course:", error);
            setCourse(null);
          } finally {
            setIsLoadingPage(false);
          }
        }
        fetchCourseFromDb();
      } else {
        router.push('/auth/login?redirect=/courses/' + courseId);
      }
    });
    return () => unsubscribe();
  }, [router, courseId]);

  if (isLoadingPage || course === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading course details...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  if (!course) {
    return (
       <div className="space-y-6">
        <Link href="/" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>
        <p className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">Course not found.</p>
      </div>
    );
  }
  
  const sortedModules = course.modules?.sort((a, b) => a.order - b.order) || [];

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{course.title}</h1>
        {course.description && <p className="text-lg text-muted-foreground">{course.description}</p>}
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl mb-8">
             <CardHeader>
                <div className="grid md:grid-cols-3 gap-6 items-start">
                    <div className="md:col-span-1">
                        <Image
                        src={course.imageUrl}
                        alt={course.title}
                        width={600}
                        height={400}
                        className="rounded-lg object-cover w-full shadow-md"
                        data-ai-hint={course.imageHint || "education learning"}
                        />
                    </div>
                    <div className="md:col-span-2">
                        {course.longDescription && <p className="text-foreground/80 mb-4">{course.longDescription}</p>}
                        {course.prerequisites && course.prerequisites.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-md font-semibold mb-2 flex items-center"><Info className="w-5 h-5 mr-2 text-primary"/>Prerequisites:</h3>
                            <div className="flex flex-wrap gap-2">
                            {course.prerequisites.map((prereq, index) => (
                                <Badge key={index} variant="secondary">{prereq}</Badge>
                            ))}
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </CardHeader>
          </Card>

          {/* Module List Section */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ListChecks className="mr-2 h-5 w-5 text-primary" />
                Course Modules
              </CardTitle>
              <CardDescription>Select a module to begin learning.</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedModules.length > 0 ? (
                <ul className="space-y-3">
                  {sortedModules.map((module) => (
                    <li key={module.id}>
                      <Button variant="outline" asChild className="w-full justify-start text-left h-auto py-3">
                        <Link href={`/courses/${course.id}/modules/${module.id}`}>
                          <BookOpen className="mr-3 h-5 w-5 text-primary/80" />
                          <div>
                            <span className="font-medium">Module {module.order}: {module.title}</span>
                            {/* Future: Add module description or status here */}
                          </div>
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No modules available for this course yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          {/* "Next Steps" or other relevant info can go here.
              For now, this section might be less relevant without a course-level quiz.
              It could show overall course progress once module completion is tracked.
          */}
           <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5 text-primary" />
                Course Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This course consists of {sortedModules.length} module(s).
                Complete all modules to master the content.
              </p>
              {/* Placeholder for future progress bar or certificate info if applicable */}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
