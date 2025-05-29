
"use client";

// This page is being repurposed or effectively replaced by the new
// /courses/[courseId]/modules/[moduleId]/page.tsx structure.
// For now, keeping it simple to show a deprecation message if anyone lands here.
// It should ideally be removed if all links are updated.

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileWarning } from 'lucide-react';
import type { Course } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OldModuleStructurePage() {
  const router = useRouter();
  const params = useParams<{ courseId: string; moduleId: string }>();
  const { courseId, moduleId: oldModuleId } = params;

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        async function fetchCourse() {
          try {
            const courseRef = doc(db, "courses", courseId);
            const courseSnap = await getDoc(courseRef);
            if (courseSnap.exists()) {
              setCourse({ id: courseSnap.id, ...courseSnap.data() } as Course);
            }
          } catch (error) {
            console.error("Error fetching course data for deprecated module page:", error);
          } finally {
            setIsLoadingPage(false);
          }
        }
        fetchCourse();
      } else {
        router.push(`/auth/login?redirect=/courses/${courseId}/${oldModuleId}`);
      }
    });
    return () => unsubscribe();
  }, [router, courseId, oldModuleId]);

  if (isLoadingPage) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <p className="ml-2">Loading...</p>
      </div>
    );
  }
  
  if (!currentUser) return null;

  return (
    <div className="space-y-8">
      <Link href={`/courses/${courseId}`} className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {course?.title || 'Course'}
      </Link>

      <Card className="shadow-lg border-l-4 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-destructive">
            <FileWarning className="mr-3 h-6 w-6" />
            Old Module Page
          </CardTitle>
          <CardDescription>
            The structure for course modules has changed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You've reached an old module link (ID: {oldModuleId}). Courses now use a new module system.
          </p>
          <p className="mt-4">
            Please navigate to the main course page to see the updated list of modules.
          </p>
          <Link href={`/courses/${courseId}`} className="text-primary hover:underline mt-2 inline-block">
            Go to Main Course Page
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
