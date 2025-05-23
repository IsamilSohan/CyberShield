
'use server';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Course } from '@/lib/types'; // Ensure Course type is imported
import { NewCourseSchema, type NewCourseInput } from '@/lib/types';
import { z } from 'zod';


export async function addCourse(data: NewCourseInput) {
  try {
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
      quizId: '', // Explicitly initialize quizId
    };

    console.log('Attempting to add course with data:', newCourseData); // Added for debugging

    const docRef = await addDoc(collection(db, 'courses'), newCourseData);
    console.log('Course added with ID: ', docRef.id);

    revalidatePath('/admin/courses');
    revalidatePath(`/courses/${docRef.id}`);
    revalidatePath('/');

    // If addDoc is successful, redirect. This should be the last operation in the try block.
    redirect('/admin/courses');

  } catch (error) {
    console.error('Error adding course: ', error); // Crucial: Check server logs for this output
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      const formErrors = error.flatten().formErrors;
      let customMessage = 'Validation failed. Please check your inputs.';
      
      // Check if there are form-level errors (e.g. from .refine)
      if (formErrors.length > 0) {
        customMessage = formErrors.join(' ');
      }
      // If no form-level errors, but field errors exist, provide a general message
      // but still return field errors for the form to highlight specific inputs.
      else if (Object.keys(fieldErrors).length > 0 && customMessage === 'Validation failed. Please check your inputs.') {
        customMessage = 'Some fields have validation errors. Please review them.';
      }
      
      return {
        success: false,
        message: customMessage,
        errors: fieldErrors as Record<string, string[]>,
      };
    }
    // For non-Zod errors (e.g., Firestore write errors)
    return {
      success: false,
      message: 'Failed to add course. Please try again. Check server logs for details.',
    };
  }
  // No code should be reachable here if the try block succeeds and redirects,
  // or if the catch block returns.
}

