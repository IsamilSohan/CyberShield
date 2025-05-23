
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAssessmentByModuleId, getModuleById, getCourseById } from '@/lib/data';
import { AssessmentForm } from '@/components/assessment/AssessmentForm';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Assessment, Module, Course } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

type AssessmentPageProps = {
  params: { courseId: string; moduleId: string };
};

export default function AssessmentPage({ params }: AssessmentPageProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [assessment, setAssessment] = useState<Assessment | undefined>(undefined);
  const [module, setModule] = useState<Module | undefined>(undefined);
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const fetchedAssessment = getAssessmentByModuleId(params.moduleId);
        const fetchedModule = getModuleById(params.courseId, params.moduleId);
        const fetchedCourse = getCourseById(params.courseId);
        setAssessment(fetchedAssessment);
        setModule(fetchedModule);
        setCourse(fetchedCourse);
        // TODO: Fetch from Firestore if not using mock data
        setIsLoadingPage(false);
      } else {
        router.push(`/auth/login?redirect=/courses/${params.courseId}/${params.moduleId}/assessment`);
      }
    });
    return () => unsubscribe();
  }, [router, params.courseId, params.moduleId]);

  if (isLoadingPage || assessment === undefined || module === undefined || course === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading assessment...</p>
      </div>
    );
  }

  if (!currentUser) return null; // Should be redirected

  if (!assessment || !module || !course) {
    return <p className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">Assessment, module, or course not found.</p>;
  }

  return (
    <div className="space-y-8">
       <Link href={`/courses/${params.courseId}/${params.moduleId}`} className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Module: {module.title}
      </Link>
      <AssessmentForm assessment={assessment} courseId={params.courseId} />
    </div>
  );
}

export async function generateStaticParams() {
  const { placeholderCourses } = await import('@/lib/data');
  const params: { courseId: string; moduleId: string }[] = [];
  placeholderCourses.forEach(course => {
    course.modules.forEach(module => {
      if (getAssessmentByModuleId(module.id)) {
        params.push({ courseId: course.id, moduleId: module.id });
      }
    });
  });
  return params;
}
