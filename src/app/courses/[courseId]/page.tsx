import { getCourseById } from '@/lib/data';
import { ModuleListItem } from '@/components/courses/ModuleListItem';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Info, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type CourseDetailPageProps = {
  params: { courseId: string };
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const course = getCourseById(params.courseId);

  if (!course) {
    return <p className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">Course not found.</p>;
  }

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </Link>

      <section className="bg-card p-6 sm:p-8 rounded-lg shadow-xl">
        <div className="grid md:grid-cols-3 gap-8 items-start">
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{course.title}</h1>
            <p className="text-muted-foreground text-lg mb-4">{course.description}</p>
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

            <Button size="lg" className="w-full sm:w-auto">
              {/* This button could be "Enroll Now" or "Start Learning" based on user status */}
              Start Learning
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 flex items-center">
          <ListChecks className="mr-3 h-7 w-7 text-primary" />
          Course Modules
        </h2>
        {course.modules.length > 0 ? (
          <div className="space-y-4">
            {course.modules.map((module, index) => (
              <ModuleListItem key={module.id} module={module} courseId={course.id} moduleNumber={index + 1} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No modules available for this course yet.</p>
        )}
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  const { placeholderCourses } = await import('@/lib/data');
  return placeholderCourses.map(course => ({
    courseId: course.id,
  }));
}
