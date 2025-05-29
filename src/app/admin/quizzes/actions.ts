
'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Quiz } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function updateQuizAction(quizId: string, updatedQuizData: Quiz) {
  if (!adminDb) {
    console.error('Error updating quiz: Firebase Admin SDK is not initialized.');
    return {
      success: false,
      message: 'Server configuration error: Unable to connect to the database. (Admin SDK not initialized)',
    };
  }

  if (!quizId || !updatedQuizData) {
    return { success: false, message: 'Quiz ID and data are required.' };
  }

  try {
    const quizRef = adminDb.collection('quizzes').doc(quizId);
    // Ensure IDs are consistent or remove from payload if doc ID is source of truth
    const dataToSave = { ...updatedQuizData };
    if (dataToSave.id && dataToSave.id !== quizId) {
        console.warn(`Quiz data ID "${dataToSave.id}" differs from document ID "${quizId}". Using document ID.`);
    }
    dataToSave.id = quizId; // Ensure ID in data matches document ID

    await quizRef.set(dataToSave, { merge: true }); // Use set with merge to update or create

    console.log('Quiz updated successfully (Admin SDK):', quizId);
    
    // Revalidate relevant paths if necessary, e.g., the quiz edit page itself or course module pages
    revalidatePath(`/admin/quizzes/${quizId}/edit`);
    if (updatedQuizData.courseId && updatedQuizData.moduleId) {
      revalidatePath(`/courses/${updatedQuizData.courseId}/modules/${updatedQuizData.moduleId}/assessment`);
    }
    
    return { success: true, message: 'Quiz updated successfully!' };

  } catch (error: any) {
    console.error('Error updating quiz (Admin SDK):', error);
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
      message: `Failed to update quiz.${detail}`,
    };
  }
}
