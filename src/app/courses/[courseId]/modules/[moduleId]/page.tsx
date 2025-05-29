
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Course, Module } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
// Placeholder for future content display components (VideoPlayer, ImageDisplay, TextBlock)

export default function ModuleDetailPage() {
  const params = useParams<{ courseId: string; moduleId: string }>();
  const router = useRouter();
  const { courseId, moduleId } = params;

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push(`/auth/login?redirect=/courses/${courseId}/modules/${moduleId}`);
      }
    });
    return () => unsubscribe();
  }, [router, courseId, moduleId]);

  useEffect(() => {
    if (!currentUser || !courseId || !moduleId) {
      setIsLoading(currentUser ? true : false);
      return;
    }
    setIsLoading(true);
    setError(null);

    const fetchModuleData = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) {
          setError('Course not found.');
          setCourse(null);
          setModule(null);
          return;
        }
        const fetchedCourse = { id: courseSnap.id, ...courseSnap.data() } as Course;
        setCourse(fetchedCourse);

        const foundModule = fetchedCourse.modules?.find(m => m.id === moduleId);
        if (!foundModule) {
          setError('Module not found in this course.');
          setModule(null);
          return;
        }
        setModule(foundModule);

      } catch (e: any) {
        console.error("Error fetching module data:", e);
        setError(`Failed to load module data. ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModuleData();
  }, [currentUser, courseId, moduleId]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading module content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link href={`/courses/${courseId}`} className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {course?.title || 'Course'}
        </Link>
        <p className="text-center text-destructive bg-destructive/10 p-4 rounded-md">{error}</p>
      </div>
    );
  }

  if (!module || !course) {
    return (
      <div className="space-y-6">
         <Link href={`/courses/${courseId}`} className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Link>
        <p className="text-center text-muted-foreground">Module or course data could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href={`/courses/${courseId}`} className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {course.title}
      </Link>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl md:text-3xl">
            <BookOpen className="mr-3 h-7 w-7 text-primary" />
            Module {module.order}: {module.title}
          </CardTitle>
          <CardDescription>Course: {course.title}</CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground py-8 text-center">
            Module content (text, images, video) will be displayed here.
          </p>
          {/* 
            Future implementation:
            Iterate through module.contentBlocks and render based on type.
            E.g.,
            module.contentBlocks.map(block => {
              if (block.type === 'text') return <p key={block.id}>{block.value}</p>;
              if (block.type === 'image') return <Image key={block.id} src={block.value} alt={block.title || 'Module image'} width={800} height={450} />;
              if (block.type === 'video') return <VideoPlayer key={block.id} videoUrl={block.value} title={module.title} />;
            })
          */}
          
          {/* Placeholder for Quiz Button */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
            {/* <Button asChild disabled={!module.quizId}>
              <Link href={`/courses/${courseId}/modules/${moduleId}/assessment`}>
                Attempt Quiz
              </Link>
            </Button>
            {!module.quizId && <p className="text-sm text-muted-foreground">No quiz associated with this module yet.</p>} */}
            <p className="text-sm text-muted-foreground">Quiz functionality for modules will be added later.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
