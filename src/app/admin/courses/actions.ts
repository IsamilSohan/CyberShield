
'use server';

import { adminDb } from '@/lib/firebase-admin'; // Using Firebase Admin SDK
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Course } from '@/lib/types';
import { NewCourseSchema, type NewCourseInput } from '@/lib/types';
import { z } from 'zod';

export async function addCourse(data: NewCourseInput) {
  try {
    // Validate input data
    const validatedData = NewCourseSchema.parse(data);

    const finalImageUrl = (validatedData.imageUrl === "" || validatedData.imageUrl === undefined)
      ? `https://placehold.co/600x400.png`
      : validatedData.imageUrl;

    const prerequisitesArray = validatedData.prerequisites
      ? validatedData.prerequisites.split(',').map(p => p.trim()).filter(p => p.length > 0)
      : [];

    // Simplified structure: no initial module directly from this form
    const newCourseData: Omit<Course, 'id'> = {
      title: validatedData.title,
      description: validatedData.description,
      longDescription: validatedData.longDescription || '',
      imageUrl: finalImageUrl,
      imageHint: validatedData.imageHint || 'education technology',
      videoUrl: validatedData.videoUrl || '', // Course-level video URL
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
    console.log('Course added with ID (Admin SDK): ', docRef.id);

    revalidatePath('/admin/courses');
    revalidatePath(`/courses/${docRef.id}`);
    revalidatePath('/');
    
    // Redirect is a special Next.js error, must be thrown, not returned.
    // It should be the last operation in the try block if successful.
    redirect('/admin/courses');

  } catch (error: any) { 
    console.error('Error adding course: ', error); 
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
      message: `Failed to add course. Please try again or check server logs.${detail}`,
    };
  }
  // No code should be reachable here if the try block succeeds and redirects,
  // or if the catch block returns.
}
