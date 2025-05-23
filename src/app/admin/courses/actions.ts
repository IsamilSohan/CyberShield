
'use server';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Course } from '@/lib/types';
import { NewCourseSchema, type NewCourseInput } from '@/lib/types'; // Updated import
import { z } from 'zod';


export async function addCourse(data: NewCourseInput) {
  try {
    const validatedData = NewCourseSchema.parse(data);

    // Handle default imageUrl if it's empty or not provided
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
      modules: [], // Initialize with empty modules
      prerequisites: prerequisitesArray,
      // Consider adding createdAt: serverTimestamp() here if needed for sorting or tracking
    };

    const docRef = await addDoc(collection(db, 'courses'), newCourseData);
    console.log('Course added with ID: ', docRef.id);

    revalidatePath('/admin/courses');
    revalidatePath(`/courses/${docRef.id}`); // If you have individual course pages
    revalidatePath('/'); // If courses are displayed on the homepage

    // Redirect after all successful operations within the try block
    redirect('/admin/courses');

  } catch (error) {
    console.error('Error adding course: ', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation failed. Please check your inputs.',
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      message: 'Failed to add course. Please try again.',
    };
  }
  // No code should be reachable here if the try block succeeds and redirects,
  // or if the catch block returns.
}
