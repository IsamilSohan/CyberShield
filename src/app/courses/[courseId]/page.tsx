
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Info, Loader2, BookOpen, MessageSquare, StarIcon, PlayCircle, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import type { Course, Review } from '@/lib/types';
import { doc, getDoc, collection, query, where, getDocs, orderBy as firestoreOrderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AddReviewForm } from '@/components/reviews/AddReviewForm';
import { format } from 'date-fns';
import { VideoPlayer } from '@/components/courses/VideoPlayer';

export default function CourseDetailPage() {
  const router = useRouter();
  const paramsHook = useParams();
  const courseId = paramsHook.courseId as string; // Ensure courseId is a string

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [course, setCourse] = useState<Course | null | undefined>(undefined); // undefined for initial loading state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const fetchCourseAndReviews = useCallback(async () => {
    if (!courseId) {
      setIsLoadingPage(false);
      setCourse(null); // Explicitly set to null if no courseId
      return;
    }
    setIsLoadingPage(true);
    setIsLoadingReviews(true);
    try {
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        const data = courseSnap.data();
        setCourse({
          id: courseSnap.id,
          title: data.title || 'Untitled Course',
          description: data.description || '',
          longDescription: data.longDescription || '',
          imageUrl: data.imageUrl || 'https://placehold.co/800x400.png', // Default size
          imageHint: data.imageHint || 'education technology',
          prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
          modules: Array.isArray(data.modules) ? data.modules.sort((a, b) => a.order - b.order) : [],
          // videoUrl: data.videoUrl || '', // This was for the old single video model
          // quizId: data.quizId || '', // This was for the old single quiz model
        } as Course);
      } else {
        setCourse(null); // Course not found
      }

      // Fetch reviews
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("courseId", "==", courseId),
        firestoreOrderBy("createdAt", "desc")
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const fetchedReviews = reviewsSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate ? format(docSnap.data().createdAt.toDate(), 'PPP p') : 'Date unknown',
      } as Review));
      setReviews(fetchedReviews);

    } catch (error) {
      console.error("Error fetching course or reviews:", error);
      setCourse(null);
      setReviews([]);
    } finally {
      setIsLoadingPage(false);
      setIsLoadingReviews(false);
    }
  }, [courseId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        router.push(`/auth/login?redirect=/courses/${courseId}`);
      } else {
         fetchCourseAndReviews(); // Fetch data only if user is logged in
      }
    });
     // Initial fetch if user might already be logged in (or if page is public for some parts)
    if (auth.currentUser) {
        fetchCourseAndReviews();
    } else if (!courseId) { // Handle case where courseId might not be available initially
        setIsLoadingPage(false);
        setCourse(null);
    }
    return () => unsubscribe();
  }, [courseId, router, fetchCourseAndReviews]);


  if (isLoadingPage || course === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading course details...</p>
      </div>
    );
  }

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

      {/* Course Title - Prominent and Separate */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{course.title}</h1>

      {/* Image and Subheader Card */}
      <Card className="shadow-xl overflow-hidden">
        <div className="relative">
          <Image
            src={course.imageUrl}
            alt={course.title}
            width={800} 
            height={400} 
            className="w-full h-auto object-cover"
            data-ai-hint={course.imageHint || "education learning"}
            priority 
          />
        </div>
        {course.description && (
            <CardContent className="pt-4"> {/* Using CardContent for subheader */}
                <p className="text-lg text-muted-foreground">{course.description}</p>
            </CardContent>
        )}
      </Card>

      {/* Long Description Section */}
      {course.longDescription && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>About this course</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{course.longDescription}</p>
          </CardContent>
        </Card>
      )}

      {/* Prerequisites Section */}
      {course.prerequisites && course.prerequisites.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
             <CardTitle className="flex items-center">
                <Info className="w-5 h-5 mr-2 text-primary"/>Prerequisites
             </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {course.prerequisites.map((prereq, index) => (
                <Badge key={index} variant="secondary">{prereq}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Modules Section */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
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
                          <PlayCircle className="mr-3 h-5 w-5 text-primary/80" />
                          <div>
                            <span className="font-medium">Module {module.order}: {module.title}</span>
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

          {/* Reviews Section */}
          <Separator className="my-8"/>
          <section id="reviews" className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <MessageSquare className="mr-2 h-6 w-6 text-primary"/>
              Student Reviews ({reviews.length})
            </h2>
            {currentUser && (
              <Card className="shadow-md">
                <CardHeader><CardTitle>Write a Review</CardTitle></CardHeader>
                <CardContent>
                  <AddReviewForm courseId={course.id} currentUser={currentUser} onReviewSubmitted={fetchCourseAndReviews} />
                </CardContent>
              </Card>
            )}
            {!currentUser && (
                <p className="text-muted-foreground p-4 border rounded-md bg-muted/50">
                    <Link href={`/auth/login?redirect=/courses/${courseId}#reviews`} className="text-primary hover:underline">Login</Link> to write a review.
                </p>
            )}

            {isLoadingReviews ? (
                <div className="flex justify-center items-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /> <span className="ml-2">Loading reviews...</span></div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <Card key={review.id} className="bg-card/60">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                           <CardTitle className="text-md">{review.userName}</CardTitle>
                           <CardDescription className="text-xs">{review.createdAt}</CardDescription>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/80">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-6 text-center">No reviews yet for this course. Be the first to write one!</p>
            )}
          </section>

        </div>

        <aside className="lg:col-span-1 space-y-6">
           {/* This card can be repurposed or removed if not needed */}
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
              </p>
              {/* You can add more course metadata here if needed */}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
