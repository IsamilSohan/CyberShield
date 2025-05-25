
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { VideoPlayer } from '@/components/courses/VideoPlayer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Info, Loader2, PlayCircle, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { auth, db } from '@/lib/firebase'; 
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import type { Course } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
                videoUrl: data.videoUrl || '',
                prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [], 
                quizId: data.quizId || '', // Ensure quizId is fetched
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

  if (!currentUser) {
    // This should ideally not be reached due to the auth check effect
    return <p>Please log in to view this course.</p>;
  }

  if (!course) {
    return <p className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">Course not found.</p>;
  }

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
            <section className="bg-card p-6 sm:p-8 rounded-lg shadow-xl mb-8">
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
                        {course.longDescription && <p className="text-foreground/80 mb-6">{course.longDescription}</p>}
                        
                        {course.prerequisites && course.prerequisites.length > 0 && (
                        <div className="mb-6">
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
            </section>

            {course.videoUrl ? (
                <VideoPlayer videoUrl={course.videoUrl} title={course.title} />
            ) : (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        <PlayCircle className="w-12 h-12 mx-auto mb-2 text-primary/50" />
                        No video available for this course yet.
                    </CardContent>
                </Card>
            )}
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
                After watching the video, test your knowledge.
              </p>
              <Button asChild className="w-full" variant="default" disabled={!course.quizId}>
                <Link href={`/courses/${course.id}/assessment`}> 
                  Attempt Quiz
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
