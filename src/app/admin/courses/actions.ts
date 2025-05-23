
'use server';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Course, Module } from '@/lib/types'; // Updated import
import { NewCourseSchema, type NewCourseInput } from '@/lib/types';
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

    const modules: Module[] = [];
    if (validatedData.initialModuleTitle && validatedData.initialModuleVideoUrl) {
      modules.push({
        id: `module-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, // Simple unique ID
        title: validatedData.initialModuleTitle,
        videoUrl: validatedData.initialModuleVideoUrl,
        transcript: '', // Default empty, can be edited later
        duration: 'N/A',   // Default, can be edited later
      });
    }

    const newCourseData: Omit<Course, 'id'> = {
      title: validatedData.title,
      description: validatedData.description,
      longDescription: validatedData.longDescription || '',
      imageUrl: finalImageUrl,
      imageHint: validatedData.imageHint || 'education technology',
      modules: modules, 
      prerequisites: prerequisitesArray,
      // Consider adding createdAt: serverTimestamp() here if needed for sorting or tracking
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
      // Flatten Zod errors to include path information for refined schemas
      const fieldErrors = error.flatten(issue => ({
        message: issue.message,
        path: issue.path,
      })).fieldErrors;

      // Specifically check for the refine error message for module title/URL
      const formErrors = error.flatten().formErrors;
      let customMessage = 'Validation failed. Please check your inputs.';
      if (formErrors.length > 0 && formErrors.some(fe => fe.includes("initial module title and video URL must be provided"))) {
         customMessage = "If providing an initial module title, you must also provide a video URL, and vice-versa.";
      }
      
      return {
        success: false,
        message: customMessage,
        errors: fieldErrors as Record<string, string[]>, // Ensure type compatibility
      };
    }
    return {
      success: false,
      message: 'Failed to add course. Please try again.',
    };
  }
}
