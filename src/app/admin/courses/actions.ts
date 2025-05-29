
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Course } from '@/lib/types'; // Quiz type removed for now
import { NewCourseSchema, type NewCourseInput } from '@/lib/types';
import { z } from 'zod';
import { collection, addDoc as adminAddDoc } from 'firebase-admin/firestore';

export async function addCourse(data: NewCourseInput) {
  let courseDocId: string | null = null;

  if (!adminDb) {
    console.error('Error adding course: Firebase Admin SDK is not initialized. Ensure FIREBASE_SERVICE_ACCOUNT_KEY_JSON is set and valid, and the server was restarted.');
    return {
      success: false,
      message: 'Server configuration error: Unable to connect to the database. Please contact support. (Admin SDK not initialized)',
    };
  }

  try {
    const validatedData = NewCourseSchema.parse(data);

    const finalImageUrl = (validatedData.imageUrl === "" || validatedData.imageUrl === undefined)
      ? `https://placehold.co/600x400.png`
      : validatedData.imageUrl;

    const prerequisitesArray = validatedData.prerequisites
      ? validatedData.prerequisites.split(',').map(p => p.trim()).filter(p => p.length > 0)
      : [];

    // Create the Course document
    const newCourseData: Omit<Course, 'id'> = {
      title: validatedData.title,
      description: validatedData.description,
      longDescription: validatedData.longDescription || '',
      imageUrl: finalImageUrl,
      imageHint: validatedData.imageHint || 'education technology',
      prerequisites: prerequisitesArray,
      modules: [], // Initialize with an empty modules array
      // videoUrl: validatedData.videoUrl || '', // Removed
      // quizId: '', // Removed course-level quizId
    };

    console.log('Attempting to add course with data (Admin SDK):', newCourseData);
    const coursesCollectionRef = collection(adminDb, 'courses');
    const courseDocRef = await adminAddDoc(coursesCollectionRef, newCourseData as any); // Type assertion for Omit<Course,'id'>
    courseDocId = courseDocRef.id;
    console.log('Course added with ID (Admin SDK): ', courseDocId);

  } catch (error: any) {
    console.error('Error during course data processing or Firestore write: ', error);
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      const formErrors = error.flatten().formErrors;
      let customMessage = 'Validation failed. Please check your inputs.';

      if (formErrors.length > 0) {
        customMessage = formErrors.join(' ');
      } else if (Object.keys(fieldErrors).length > 0 && customMessage === 'Validation failed. Please check your inputs.') {
          customMessage = 'Some fields have validation errors. Please review them.';
      }

      return {
        success: false,
        message: customMessage,
        errors: fieldErrors as Record<string, string[]>,
      };
    }

    let detail = '';
    if (error.message) {
      detail = ` Details: ${error.message}`;
    } else if (error.code) {
      detail = ` Code: ${error.code}`;
    } else {
      detail = ` Details: ${String(error)}`;
    }
    return {
      success: false,
      message: `Failed to add course to database.${detail}`,
    };
  }

  if (courseDocId) {
    try {
      revalidatePath('/admin/courses');
      revalidatePath(`/courses/${courseDocId}`);
      revalidatePath('/');
      console.log('Paths revalidated successfully for course ID:', courseDocId);
    } catch (revalidationError: any) {
      console.warn(`Warning: Course ${courseDocId} added to DB, but path revalidation failed:`, revalidationError);
    }
  }

  redirect('/admin/courses');
}

export async function deleteCourse(courseId: string) {
  console.log('Attempting to delete course with ID (Admin SDK):', courseId);
  if (!adminDb) {
    console.error('Error deleting course: Firebase Admin SDK is not initialized.');
    return {
      success: false,
      message: 'Server configuration error: Unable to connect to the database. (Admin SDK not initialized)',
    };
  }

  if (!courseId) {
    return { success: false, message: 'Course ID is required for deletion.' };
  }

  try {
    const courseRef = adminDb.collection('courses').doc(courseId);
    const courseSnap = await courseRef.get();

    if (courseSnap.exists) {
      const courseData = courseSnap.data() as Partial<Course & { quizId?: string }>; // Allow old quizId for cleanup
      // If old structure course.quizId exists, try to delete it.
      // New module-specific quizzes will need a different cleanup logic later.
      if (courseData && courseData.quizId) {
        console.log('Attempting to delete associated course-level quiz with ID (Admin SDK):', courseData.quizId);
        try {
            await adminDb.collection('quizzes').doc(courseData.quizId).delete();
            console.log('Associated course-level quiz deleted successfully (Admin SDK):', courseData.quizId);
        } catch (quizDeleteError: any) {
            console.warn(`Warning: Failed to delete associated course-level quiz ${courseData.quizId}:`, quizDeleteError.message);
        }
      }
      // Future: Iterate through courseData.modules and delete their quizId from 'quizzes' if implemented.
    }

    await courseRef.delete();
    console.log('Course deleted successfully (Admin SDK):', courseId);

    revalidatePath('/admin/courses');
    revalidatePath('/');
    return { success: true, message: 'Course and any associated old course-level quiz deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting course or associated data (Admin SDK):', error);
    let detail = '';
    if (error.message) {
      detail = ` Details: ${error.message}`;
    } else if (error.code) {
      detail = ` Code: ${error.code}`;
    } else {
      detail = ` Details: ${String(error)}`;
    }
    return {
      success: false,
      message: `Failed to delete course.${detail}`,
    };
  }
}
