
import Link from 'next/link';
import Image from 'next/image';
import type { Course } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react'; // Changed from PlayCircle

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const moduleCount = course.modules?.length || 0;

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <Link href={`/courses/${course.id}`} className="block">
          <Image
            src={course.imageUrl}
            alt={course.title}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint={course.imageHint || "education technology"}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <Link href={`/courses/${course.id}`}>
          <CardTitle className="text-xl mb-2 hover:text-primary transition-colors">{course.title}</CardTitle>
        </Link>
        <CardDescription className="text-sm text-muted-foreground mb-4">{course.description}</CardDescription>
        <div className="flex items-center text-xs text-muted-foreground space-x-4">
          {moduleCount > 0 && (
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              <span>{moduleCount} Module{moduleCount === 1 ? '' : 's'}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full" variant="default">
          <Link href={`/courses/${course.id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
