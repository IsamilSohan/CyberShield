import { getAssessmentByModuleId, getModuleById, getCourseById } from '@/lib/data';
import { AssessmentForm } from '@/components/assessment/AssessmentForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type AssessmentPageProps = {
  params: { courseId: string; moduleId: string };
};

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const assessment = getAssessmentByModuleId(params.moduleId);
  const module = getModuleById(params.courseId, params.moduleId);
  const course = getCourseById(params.courseId);


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
      // Assuming all modules have an assessment for static generation
      if (getAssessmentByModuleId(module.id)) {
        params.push({ courseId: course.id, moduleId: module.id });
      }
    });
  });
  return params;
}
