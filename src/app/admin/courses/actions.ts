
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

    console.log('Attempting to add course with data:', newCourseData);

    const docRef = await addDoc(collection(db, 'courses'), newCourseData);
    console.log('Course added with ID: ', docRef.id);

    revalidatePath('/admin/courses');
    revalidatePath(`/courses/${docRef.id}`);
    revalidatePath('/');

    // If addDoc is successful, redirect. This should be the last operation in the try block.
    redirect('/admin/courses');

  } catch (error: any) { // Changed error type to any to access .message or .code
    console.error('Error adding course: ', error); 
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      const formErrors = error.flatten().formErrors;
      let customMessage = 'Validation failed. Please check your inputs.';
      
      if (formErrors.length > 0) {
        customMessage = formErrors.join(' ');
      }
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
    let detail = '';
    if (error.message) {
      detail = ` Details: ${error.message}`;
    } else if (error.code) { // Firestore errors often have a .code
      detail = ` Code: ${error.code}`;
    } else {
      detail = ` Details: ${String(error)}`;
    }
    return {
      success: false,
      message: `Failed to add course. Please try again or check server logs.${detail}`,
    };
  }
}
