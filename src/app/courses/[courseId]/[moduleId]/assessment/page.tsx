
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Added useParams
// getModuleById and getAssessmentByModuleId are no longer suitable
// We need getAssessmentByCourseId and getCourseById
import { getAssessmentByCourseId, getCourseById } from '@/lib/data'; 
import { AssessmentForm } from '@/components/assessment/AssessmentForm';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Assessment, Course } from '@/lib/types'; // Module type might not be needed here
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

// type AssessmentPageProps = { // Not needed if using useParams
//   params: { courseId: string; moduleId: string }; // moduleId might become quizId or just be implicit
// };

// This page might need to be re-evaluated if quizzes are per-course, not per-module.
// For now, let's assume moduleId in the route could represent a quiz attempt linked to a course.
// Or, we could change the route to /courses/[courseId]/assessment/
// For now, I will adapt it to use courseId for fetching assessment and course.

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string, moduleId: string }>(); // moduleId could be treated as a quiz identifier
  const courseId = params.courseId;
  // const quizOrModuleId = params.moduleId; // This might represent a specific quiz or attempt

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [assessment, setAssessment] = useState<Assessment | undefined>(undefined);
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch assessment based on courseId (assuming one main quiz per course for now)
        const fetchedAssessment = getAssessmentByCourseId(courseId); 
        const fetchedCourse = getCourseById(courseId); // Fetch course details
        
        setAssessment(fetchedAssessment);
        setCourse(fetchedCourse);
        setIsLoadingPage(false);
      } else {
        router.push(`/auth/login?redirect=/courses/${courseId}/assessment`); // Or specific quiz route
      }
    });
    return () => unsubscribe();
  }, [router, courseId]);

  if (isLoadingPage || assessment === undefined || course === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading assessment...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  if (!assessment || !course) {
    return <p className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">Assessment or course not found.</p>;
  }

  return (
    <div className="space-y-8">
       {/* Link back to the main course page */}
       <Link href={`/courses/${courseId}`} className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course: {course.title}
      </Link>
      {/* Pass courseId to AssessmentForm. Assessment object now has courseId. */}
      <AssessmentForm assessment={assessment} courseId={courseId} />
    </div>
  );
}

// generateStaticParams might need to be removed or updated if assessments are dynamic
// or tied to courses directly. For now, removing it as this page is client-rendered
// and assessments are likely dynamic.
// export async function generateStaticParams() {
//   const { placeholderCourses } = await import('@/lib/data');
//   const params: { courseId: string; moduleId: string }[] = [];
//   placeholderCourses.forEach(course => {
//     // Logic to determine if a course has an assessment
//     if (getAssessmentByCourseId(course.id)) { // Adjust to new assessment fetching
//       params.push({ courseId: course.id, moduleId: 'main_quiz' }); // moduleId might be a fixed value or dynamic
//     }
//   });
//   return params;
// }

