
import { CourseCard } from '@/components/courses/CourseCard';
import { APP_NAME } from '@/lib/constants';
import type { Course, Module } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query as firestoreQuery } from 'firebase/firestore';

async function getCoursesFromFirestore(): Promise<Course[]> {
  try {
    const coursesCol = collection(db, 'courses');
    const q = firestoreQuery(coursesCol);
    const courseSnapshot = await getDocs(q);
    const coursesList = courseSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Course',
        description: data.description || '',
        longDescription: data.longDescription || '',
        imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
        imageHint: data.imageHint || 'education technology',
        prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
        modules: Array.isArray(data.modules) 
          ? data.modules.map((m: any) => ({ // Ensure modules are correctly typed
              id: m.id || '',
              title: m.title || 'Untitled Module',
              order: typeof m.order === 'number' ? m.order : 0,
              contentBlocks: Array.isArray(m.contentBlocks) ? m.contentBlocks : [],
              quizId: m.quizId || undefined,
            } as Module))
          : [],
      } as Course;
    });
    return coursesList;
  } catch (error) {
    console.error("Error fetching courses from Firestore for homepage:", error);
    return []; // Return an empty array in case of an error
  }
}

export default async function HomePage() {
  const courses = await getCoursesFromFirestore();

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
          <p className="text-center text-muted-foreground">No courses available at the moment. Please check back soon or ensure Firebase is configured correctly.</p>
        )}
      </section>
    </div>
  );
}
