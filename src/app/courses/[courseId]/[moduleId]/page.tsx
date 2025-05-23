
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getModuleById, getCourseById } from '@/lib/data'; // Still used for initial structure
import { VideoPlayer } from '@/components/courses/VideoPlayer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FileText, Award, CheckSquare, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Module, Course } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

type ModuleDetailPageProps = {
  params: { courseId: string; moduleId: string };
};

export default function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [module, setModule] = useState<Module | undefined>(undefined);
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const fetchedModule = getModuleById(params.courseId, params.moduleId);
        const fetchedCourse = getCourseById(params.courseId);
        setModule(fetchedModule);
        setCourse(fetchedCourse);
        // TODO: Fetch module/course from Firestore if not using mock data
        setIsLoadingPage(false);
      } else {
        router.push(`/auth/login?redirect=/courses/${params.courseId}/${params.moduleId}`);
      }
    });
    return () => unsubscribe();
  }, [router, params.courseId, params.moduleId]);

  if (isLoadingPage || module === undefined || course === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading module...</p>
      </div>
    );
  }
  
  if (!currentUser) return null; // Should be redirected by effect

  if (!module || !course) {
    return <p className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">Module or course not found.</p>;
  }

  return (
    <div className="space-y-8">
      <Link href={`/courses/${params.courseId}`} className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {course.title}
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{module.title}</h1>
        <p className="text-lg text-muted-foreground">Part of: {course.title}</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer videoUrl={module.videoUrl} title={module.title} />
          
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
                {module.transcript}
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
              <Button asChild className="w-full" variant="default">
                <Link href={`/courses/${params.courseId}/${params.moduleId}/assessment`}>
                  Take Assessment
                </Link>
              </Button>
              <Button asChild className="w-full" variant="secondary">
                <Link href={`/courses/${params.courseId}/certificate`}>
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

export async function generateStaticParams() {
  const { placeholderCourses } = await import('@/lib/data');
  const params: { courseId: string; moduleId: string }[] = [];
  placeholderCourses.forEach(course => {
    course.modules.forEach(module => {
      params.push({ courseId: course.id, moduleId: module.id });
    });
  });
  return params;
}
