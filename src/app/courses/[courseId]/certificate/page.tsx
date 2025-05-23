import { getCertificateForCourse, getCourseById, placeholderUser } from '@/lib/data';
import { CertificateDisplay } from '@/components/certificate/CertificateDisplay';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type CertificatePageProps = {
  params: { courseId: string };
};

export default async function CertificatePage({ params }: CertificatePageProps) {
  // In a real app, get userId from session
  const userId = placeholderUser.id; 
  const certificate = getCertificateForCourse(params.courseId, userId);
  const course = getCourseById(params.courseId);

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
