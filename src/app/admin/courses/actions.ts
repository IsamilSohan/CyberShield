
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Course } from '@/lib/types';
import { NewCourseSchema, type NewCourseInput } from '@/lib/types';
import { z } from 'zod';

export async function addCourse(data: NewCourseInput) {
  let docId: string | null = null;
  try {
    // Validate input data
    const validatedData = NewCourseSchema.parse(data);

    const finalImageUrl = (validatedData.imageUrl === "" || validatedData.imageUrl === undefined)
      ? `https://placehold.co/600x400.png`
      : validatedData.imageUrl;

    const prerequisitesArray = validatedData.prerequisites
      ? validatedData.prerequisites.split(',').map(p => p.trim()).filter(p => p.length > 0)
      : [];

    const newCourseData: Omit<Course, 'id'> = {
      title: validatedData.title,
      description: validatedData.description,
      longDescription: validatedData.longDescription || '',
      imageUrl: finalImageUrl,
      imageHint: validatedData.imageHint || 'education technology',
      videoUrl: validatedData.videoUrl || '',
      prerequisites: prerequisitesArray,
      quizId: '', // Initialize quizId as empty
    };

    console.log('Attempting to add course with data (Admin SDK):', newCourseData);

    if (!adminDb) {
      console.error('Error adding course: Firebase Admin SDK is not initialized. Ensure FIREBASE_SERVICE_ACCOUNT_KEY_JSON is set and valid, and the server was restarted.');
      return {
        success: false,
        message: 'Server configuration error: Unable to connect to the database. Please contact support. (Admin SDK not initialized)',
      };
    }

    const coursesCollection = adminDb.collection('courses');
    const docRef = await coursesCollection.add(newCourseData);
    docId = docRef.id; // Capture for revalidation
    console.log('Course added with ID (Admin SDK): ', docId);

  } catch (error: any) { 
    // This catch block handles errors from Zod validation or Firestore 'add' operation
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
    
    // For other errors (e.g., Firestore write failure)
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

  // If we've reached here, the course was added to Firestore successfully.
  // Now, attempt revalidation.
  if (docId) {
    try {
      revalidatePath('/admin/courses');
      revalidatePath(`/courses/${docId}`);
      revalidatePath('/');
      console.log('Paths revalidated successfully for course ID:', docId);
    } catch (revalidationError: any) {
      // Log the revalidation error, but the main operation (adding course) was successful.
      // The client will still redirect. Stale data might persist briefly.
      console.warn(`Warning: Course ${docId} added to DB, but path revalidation failed:`, revalidationError);
    }
  }
  
  // Redirect after successful DB add and attempted revalidation.
  // This call throws a special error that Next.js handles for navigation.
  // The client form submission promise will not receive a typical return value.
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
    await adminDb.collection('courses').doc(courseId).delete();
    console.log('Course deleted successfully (Admin SDK):', courseId);
    revalidatePath('/admin/courses');
    revalidatePath('/'); 
    return { success: true, message: 'Course deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting course (Admin SDK):', error);
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
