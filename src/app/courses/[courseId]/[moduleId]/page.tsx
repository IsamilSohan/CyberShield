
"use client";

// This page is now largely deprecated due to the simplification of courses
// to have one video and one quiz at the course level.
// It's kept for now to avoid breaking any existing direct links, but
// its functionality is minimal and users should primarily interact
// with /courses/[courseId].

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileWarning } from 'lucide-react';
import type { Course } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DeprecatedModuleDetailPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string; moduleId: string }>();
  const { courseId, moduleId } = params;

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
        router.push(`/auth/login?redirect=/courses/${courseId}/${moduleId}`);
      }
    });
    return () => unsubscribe();
  }, [router, courseId, moduleId]);

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
            Module Content Deprecated
          </CardTitle>
          <CardDescription>
            This course ({course?.title || 'Unknown Course'}) now has its main video and quiz directly on the course page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Individual module pages like this one (module: {moduleId}) are no longer in use for this course structure.
          </p>
          <p className="mt-4">
            Please navigate to the main course page to view the video content and access the quiz.
          </p>
          <Link href={`/courses/${courseId}`} className="text-primary hover:underline mt-2 inline-block">
            Go to Main Course Page
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
