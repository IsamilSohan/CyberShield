
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCertificateForCourse, getCourseById, placeholderUser } from '@/lib/data';
import { CertificateDisplay } from '@/components/certificate/CertificateDisplay';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Certificate, Course } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

type CertificatePageProps = {
  params: { courseId: string };
};

export default function CertificatePage({ params }: CertificatePageProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [certificate, setCertificate] = useState<Certificate | undefined>(undefined);
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // In a real app, get userId from current Firebase user (user.uid)
        // const userId = user.uid; 
        const userId = placeholderUser.id; // Still using placeholder user for cert logic for now
        const fetchedCertificate = getCertificateForCourse(params.courseId, userId);
        const fetchedCourse = getCourseById(params.courseId);
        setCertificate(fetchedCertificate);
        setCourse(fetchedCourse);
        // TODO: Fetch from Firestore if not using mock data
        setIsLoadingPage(false);
      } else {
        router.push(`/auth/login?redirect=/courses/${params.courseId}/certificate`);
      }
    });
    return () => unsubscribe();
  }, [router, params.courseId]);


  if (isLoadingPage || certificate === undefined || course === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading certificate...</p>
      </div>
    );
  }
  
  if (!currentUser) return null; // Should be redirected

  if (!certificate || !course) {
    return <p className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">Certificate or course not found, or not yet earned.</p>;
  }

  return (
    <div className="space-y-8">
      <Link href={`/courses/${params.courseId}`} className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {course.title}
      </Link>
      <CertificateDisplay certificate={certificate} />
    </div>
  );
}

export async function generateStaticParams() {
  const { placeholderCourses, placeholderUser } = await import('@/lib/data');
  const params: { courseId: string }[] = [];
  placeholderCourses.forEach(course => {
    if (getCertificateForCourse(course.id, placeholderUser.id)) {
      params.push({ courseId: course.id });
    }
  });
  return params;
}
