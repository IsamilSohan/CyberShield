
"use client";

// This page might become obsolete if courses have only one video and one quiz.
// For now, I'll leave it but note that its purpose is diminished.
// If a course has only ONE video, that video would be on /courses/[courseId]

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
// getModuleById is no longer relevant. Course data comes from Firestore on the parent page.
// import { getModuleById, getCourseById } from '@/lib/data'; 
import { VideoPlayer } from '@/components/courses/VideoPlayer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FileText, Award, CheckSquare, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Module type is removed, this page would need a different data source or be removed.
// import type { Module, Course } from '@/lib/types'; 
import type { Course } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// This page's concept of a "module detail" changes significantly.
// If a course has one video, it's on /courses/[courseId].
// This [moduleId] segment might represent a specific section or content item IF courses
// were to have more than one distinct piece of content beyond the main video.
// For now, let's assume this page is for a context where modules *did* exist,
// and it will likely show "not found" or need removal.

export default function ModuleDetailPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string; moduleId: string }>();
  const { courseId, moduleId } = params;

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  // const [module, setModule] = useState<Module | undefined>(undefined); // Module type removed
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [legacyModuleData, setLegacyModuleData] = useState<{title: string, videoUrl: string, transcript: string} | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        async function fetchData() {
          try {
            const courseRef = doc(db, "courses", courseId);
            const courseSnap = await getDoc(courseRef);
            if (courseSnap.exists()) {
              const fetchedCourse = { id: courseSnap.id, ...courseSnap.data() } as Course;
              setCourse(fetchedCourse);
              // Attempt to find legacy module data if it was stored in Firestore
              // This is a transitional step. Ideally, this page is removed or re-purposed.
              // @ts-ignore
              const modulesArray = courseSnap.data().modules || [];
              // @ts-ignore
              const foundModule = modulesArray.find(m => m.id === moduleId);
              if (foundModule) {
                setLegacyModuleData(foundModule);
              }

            }
          } catch (error) {
            console.error("Error fetching data:", error);
          } finally {
            setIsLoadingPage(false);
          }
        }
        fetchData();
      } else {
        router.push(`/auth/login?redirect=/courses/${courseId}/${moduleId}`);
      }
    });
    return () => unsubscribe();
  }, [router, courseId, moduleId]);

  if (isLoadingPage) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }
  
  if (!currentUser) return null;

  if (!course) {
    return <p className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">Course not found.</p>;
  }

  if (!legacyModuleData) {
     return (
        <div className="space-y-8">
            <Link href={`/courses/${courseId}`} className="inline-flex items-center text-primary hover:underline mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {course.title}
            </Link>
            <p className="text-center text-muted-foreground p-4 rounded-md">Module content not found or this structure is deprecated. Course video is on the main course page.</p>
        </div>
     );
  }


  return (
    <div className="space-y-8">
      <Link href={`/courses/${courseId}`} className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {course.title}
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{legacyModuleData.title}</h1>
        <p className="text-lg text-muted-foreground">Part of: {course.title}</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer videoUrl={legacyModuleData.videoUrl} title={legacyModuleData.title} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Video Transcript
              </CardTitle>
              <CardDescription>
                Review the content of the video lesson.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48 w-full rounded-md border p-4 text-sm leading-relaxed">
                {legacyModuleData.transcript || "No transcript available."}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="mr-2 h-5 w-5 text-primary" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                After watching the video and reviewing the transcript, test your knowledge.
              </p>
              {/* This assessment link would now point to the course-level assessment */}
              <Button asChild className="w-full" variant="default">
                <Link href={`/courses/${courseId}/assessment`}>
                  Take Assessment
                </Link>
              </Button>
              <Button asChild className="w-full" variant="secondary">
                <Link href={`/courses/${courseId}/certificate`}>
                  <Award className="mr-2 h-4 w-4" />
                  View Certificate (Mock)
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

// generateStaticParams is removed as this page is now fully client-side and its role is changing.
// If this page were to be kept for specific sub-content, params generation would need to be re-evaluated.
