
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Course, Module } from '@/lib/types';
import { NewCourseSchema, type NewCourseInput } from '@/lib/types';
import { z } from 'zod';
// Removed: import { collection, addDoc as adminAddDoc } from 'firebase-admin/firestore';

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
    
    const initialModules: Module[] = [];
    // if (validatedData.initialModuleTitle && validatedData.initialModuleVideoUrl) {
    //   initialModules.push({
    //     id: Math.random().toString(36).substring(2, 15), // Simple unique ID
    //     title: validatedData.initialModuleTitle,
    //     videoUrl: validatedData.initialModuleVideoUrl,
    //     transcript: '', // Initialize as empty
    //     duration: '',   // Initialize as empty
    //     order: 1
    //   });
    // }


    const newCourseData: Omit<Course, 'id'> = {
      title: validatedData.title,
      description: validatedData.description,
      longDescription: validatedData.longDescription || '',
      imageUrl: finalImageUrl,
      imageHint: validatedData.imageHint || 'education technology',
      prerequisites: prerequisitesArray,
      modules: [], // Initialize with an empty modules array, modules are added via edit page
      // videoUrl: validatedData.videoUrl || '', // Removed
      // quizId: '', // Removed
    };

    console.log('Attempting to add course with data (Admin SDK):', newCourseData);
    const courseDocRef = await adminDb.collection('courses').add(newCourseData as any); // Use direct adminDb method
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
      // Specific check for module title/URL pairing if it was a Zod refine error
      if (formErrors.some(fe => fe.includes("initial module title"))) {
        customMessage = "If providing an initial module title, you must also provide a video URL (and vice-versa), or leave both blank.";
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

  // If we reach here, the course was added to the DB
  // Now attempt revalidation and then redirect.
  if (courseDocId) {
    try {
      revalidatePath('/admin/courses');
      revalidatePath(`/courses/${courseDocId}`);
      revalidatePath('/');
      console.log('Paths revalidated successfully for course ID:', courseDocId);
    } catch (revalidationError: any) {
      // Log a warning, but don't let revalidation failure prevent the redirect
      // if the main DB operation was successful.
      console.warn(`Warning: Course ${courseDocId} added to DB, but path revalidation failed:`, revalidationError);
    }
    redirect('/admin/courses'); // Redirect after successful DB add and revalidation attempt
  } else {
    // This case should ideally not be reached if courseDocId is null and no error was thrown before.
    // But as a fallback, return an error.
    return {
      success: false,
      message: 'Failed to add course: No course ID was generated after database operation.',
    };
  }
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

    if (courseSnap.exists) { // Corrected: .exists is a property, not a function
      const courseData = courseSnap.data() as Partial<Course & { quizId?: string }>;
      
      // Delete associated quiz if it exists (from old structure)
      if (courseData && courseData.quizId) {
        console.log('Attempting to delete associated quiz with ID (Admin SDK):', courseData.quizId);
        try {
            await adminDb.collection('quizzes').doc(courseData.quizId).delete();
            console.log('Associated quiz deleted successfully (Admin SDK):', courseData.quizId);
        } catch (quizDeleteError: any) {
            console.warn(`Warning: Failed to delete associated quiz ${courseData.quizId}:`, quizDeleteError.message);
        }
      }
    }

    await courseRef.delete();
    console.log('Course deleted successfully (Admin SDK):', courseId);

    revalidatePath('/admin/courses');
    revalidatePath('/');
    return { success: true, message: 'Course and any associated quiz deleted successfully.' };
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
