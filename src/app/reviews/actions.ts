
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { NewReviewSchema, type NewReviewInput, type Review } from '@/lib/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

// This server action relies on the client sending the userId.
// For enhanced security in a production app, you might want to get the userId 
// from a server-side session or Firebase Auth context available in server actions.
export async function addReview(data: NewReviewInput) {
  if (!adminDb) {
    console.error('Error adding review: Firebase Admin SDK is not initialized.');
    return {
      success: false,
      message: 'Server configuration error. (Admin SDK not initialized)',
    };
  }

  try {
    const validatedData = NewReviewSchema.parse(data);

    // Fetch userName from the users collection using userId
    const userRef = adminDb.collection('users').doc(validatedData.userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return {
        success: false,
        message: 'User not found. Cannot submit review.',
      };
    }
    const userName = userSnap.data()?.name || 'Anonymous User';

    const newReviewData = {
      courseId: validatedData.courseId,
      userId: validatedData.userId,
      userName: userName,
      rating: validatedData.rating,
      comment: validatedData.comment,
      createdAt: FieldValue.serverTimestamp(), // Use Firestore server timestamp
    };

    const reviewDocRef = await adminDb.collection('reviews').add(newReviewData);
    console.log('Review added with ID: ', reviewDocRef.id);

    revalidatePath(`/courses/${validatedData.courseId}`);
    return {
      success: true,
      message: 'Review submitted successfully!',
      reviewId: reviewDocRef.id,
    };

  } catch (error: any) {
    console.error('Error adding review:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation failed. Please check your inputs.',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    let detail = error.message ? ` Details: ${error.message}` : '';
    if (error.code) detail += ` Code: ${error.code}`;
    return {
      success: false,
      message: `Failed to submit review.${detail}`,
    };
  }
}
