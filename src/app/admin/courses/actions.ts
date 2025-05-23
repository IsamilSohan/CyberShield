
'use server';

import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Course } from '@/lib/types';

// Schema for validating new course data from the form
export const NewCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  longDescription: z.string().optional(),
  // imageUrl can be a valid URL or an empty string. It's optional in the sense that if not provided, it's fine.
  // The form will provide an empty string by default if not filled.
  imageUrl: z.string().url({ message: "Image URL must be a valid URL if provided." }).or(z.literal('')).optional(),
  imageHint: z.string().optional(),
  prerequisites: z.string().optional(), // Will be comma-separated string
});

export type NewCourseInput = z.infer<typeof NewCourseSchema>;

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
      // Consider adding createdAt: serverTimestamp() here if needed
    };

    const docRef = await addDoc(collection(db, 'courses'), newCourseData);
    console.log('Course added with ID: ', docRef.id);

    revalidatePath('/admin/courses');
    revalidatePath(`/courses/${docRef.id}`);
    revalidatePath('/');

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

  redirect('/admin/courses');
}
