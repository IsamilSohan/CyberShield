import { CourseCard } from '@/components/courses/CourseCard';
import { placeholderCourses } from '@/lib/data';
import { APP_NAME } from '@/lib/constants';

export default function HomePage() {
  const courses = placeholderCourses;

  return (
    <div className="space-y-8">
      <section className="text-center py-10 bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-lg shadow-sm">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Welcome to <span className="text-primary">{APP_NAME}</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your premier destination for mastering cybersecurity. Explore our courses and start your journey to becoming a cyber defender.
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6 text-center">Our Courses</h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No courses available at the moment. Please check back soon!</p>
        )}
      </section>
    </div>
  );
}
