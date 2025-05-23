
'use server';

import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Course } from '@/lib/types'; // Ensure this path is correct

// Schema for validating new course data from the form
export const NewCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  longDescription: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid URL.").or(z.literal("")).transform(val => val === "" ? `https://placehold.co/600x400.png` : val),
  imageHint: z.string().optional(),
  prerequisites: z.string().optional(), // Will be comma-separated string
});

export type NewCourseInput = z.infer<typeof NewCourseSchema>;

export async function addCourse(data: NewCourseInput) {
  try {
    const validatedData = NewCourseSchema.parse(data);

    const prerequisitesArray = validatedData.prerequisites
      ? validatedData.prerequisites.split(',').map(p => p.trim()).filter(p => p.length > 0)
      : [];

    const newCourseData: Omit<Course, 'id'> = {
      title: validatedData.title,
      description: validatedData.description,
      longDescription: validatedData.longDescription || '',
      imageUrl: validatedData.imageUrl,
      imageHint: validatedData.imageHint || 'education technology',
      modules: [], // Initialize with empty modules
      prerequisites: prerequisitesArray,
      // You might want to add createdAt/updatedAt timestamps
      // createdAt: serverTimestamp(), 
    };

    const docRef = await addDoc(collection(db, 'courses'), newCourseData);
    console.log('Course added with ID: ', docRef.id);

    revalidatePath('/admin/courses'); // Revalidate the courses list page
    revalidatePath(`/courses/${docRef.id}`); // Revalidate specific course page if it exists
    revalidatePath('/'); // Revalidate home page if courses are listed there

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

  // Redirect after successful submission (if no errors occurred before this point)
  // This needs to be outside the try block for redirect to work correctly with Next.js server actions
  redirect('/admin/courses');
}
