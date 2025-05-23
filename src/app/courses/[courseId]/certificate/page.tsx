
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCertificateForCourse, getCourseById, placeholderUser } from '@/lib/data';
import { CertificateDisplay } from '@/components/certificate/CertificateDisplay';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Certificate, Course } from '@/lib/types';


type CertificatePageProps = {
  params: { courseId: string };
};

export default function CertificatePage({ params }: CertificatePageProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [certificate, setCertificate] = useState<Certificate | undefined>(undefined);
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    const authenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!authenticated) {
      router.push('/auth/login');
    } else {
      setIsAuthorized(true);
      // In a real app, get userId from session
      const userId = placeholderUser.id; 
      const fetchedCertificate = getCertificateForCourse(params.courseId, userId);
      const fetchedCourse = getCourseById(params.courseId);
      setCertificate(fetchedCertificate);
      setCourse(fetchedCourse);
      setIsLoadingPage(false);
    }
  }, [router, params.courseId]);


  if (isLoadingPage || isAuthorized === null) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading certificate...</p>
      </div>
    );
  }
  
  if (!isAuthorized) return null;

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
    // Assume user has certificate for all enrolled courses for static generation
    if (getCertificateForCourse(course.id, placeholderUser.id)) {
      params.push({ courseId: course.id });
    }
  });
  return params;
}
