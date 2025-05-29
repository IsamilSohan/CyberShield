
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, BookOpen, FileText, Image as ImageIcon, Video as VideoIcon, ListChecks } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { VideoPlayer } from '@/components/courses/VideoPlayer'; // Assuming you have this
import type { Course, Module as ModuleType, ContentBlock } from '@/lib/types'; // Renamed Module to ModuleType
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function ModuleDetailPage() {
  const params = useParams<{ courseId: string; moduleId: string }>();
  const router = useRouter();
  const { courseId, moduleId } = params;

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<ModuleType | null>(null); // Use ModuleType
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
        const courseData = courseSnap.data() as Course;
        // Ensure modules and contentBlocks are initialized as arrays
        const fetchedCourse = { 
          id: courseSnap.id, 
          ...courseData,
          modules: (courseData.modules || []).map(m => ({
            ...m,
            contentBlocks: m.contentBlocks || []
          }))
        } as Course;
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

  const sortedContentBlocks = module.contentBlocks?.sort((a,b) => a.order - b.order) || [];

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
        <CardContent className="prose dark:prose-invert max-w-none space-y-6">
          {sortedContentBlocks.length > 0 ? (
            sortedContentBlocks.map(block => (
              <div key={block.id} className="p-4 rounded-md border bg-card/50 shadow-sm">
                {block.type === 'text' && (
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-3 mt-1 text-primary/70 flex-shrink-0" />
                    <p>{block.value}</p>
                  </div>
                )}
                {block.type === 'image' && (
                  <div className="flex items-start">
                    <ImageIcon className="h-5 w-5 mr-3 mt-1 text-primary/70 flex-shrink-0" />
                    <Image 
                      src={block.value} 
                      alt={block.imageHint || `Module image ${block.order}`} 
                      width={800} 
                      height={450} 
                      className="rounded-md object-contain"
                      data-ai-hint={block.imageHint || "content image"}
                    />
                  </div>
                )}
                {block.type === 'video' && (
                  <div className="flex items-start">
                     <VideoIcon className="h-5 w-5 mr-3 mt-1 text-primary/70 flex-shrink-0" />
                     <VideoPlayer videoUrl={block.value} title={`Module Video ${block.order}`} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground py-8 text-center">
              No content available for this module yet.
            </p>
          )}
          
          {module.quizId && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <ListChecks className="mr-2 h-5 w-5 text-primary"/>
                Test Your Knowledge
              </h3>
              <Button asChild>
                <Link href={`/courses/${courseId}/modules/${moduleId}/assessment`}>
                  Attempt Quiz
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
