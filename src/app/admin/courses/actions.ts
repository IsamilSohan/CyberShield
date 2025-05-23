
'use server';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Course } from '@/lib/types';
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
      // quizId can be added later
    };

    const docRef = await addDoc(collection(db, 'courses'), newCourseData);
    console.log('Course added with ID: ', docRef.id);

    revalidatePath('/admin/courses');
    revalidatePath(`/courses/${docRef.id}`);
    revalidatePath('/');

    redirect('/admin/courses');

  } catch (error) {
    console.error('Error adding course: ', error);
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      const formErrors = error.flatten().formErrors;
      let customMessage = 'Validation failed. Please check your inputs.';
      if (formErrors.length > 0) {
        customMessage = formErrors.join(' ');
      }
      
      return {
        success: false,
        message: customMessage,
        errors: fieldErrors as Record<string, string[]>,
      };
    }
    return {
      success: false,
      message: 'Failed to add course. Please try again.',
    };
  }
}
