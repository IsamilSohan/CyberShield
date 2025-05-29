
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { BlogPost } from '@/lib/types';
import { NewBlogPostSchema, type NewBlogPostInput } from '@/lib/types';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';

export async function addBlogPost(data: NewBlogPostInput) {
  let blogPostDocId: string | null = null;

  if (!adminDb) {
    console.error('Error adding blog post: Firebase Admin SDK is not initialized.');
    return {
      success: false,
      message: 'Server configuration error: Unable to connect to the database. (Admin SDK not initialized)',
    };
  }

  try {
    const validatedData = NewBlogPostSchema.parse(data);

    const finalImageUrl = (validatedData.imageUrl === "" || validatedData.imageUrl === undefined)
      ? `https://placehold.co/800x400.png` // Default blog post image
      : validatedData.imageUrl;

    const newPostData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> = {
      title: validatedData.title,
      subHeader: validatedData.subHeader || '',
      content: validatedData.content,
      imageUrl: finalImageUrl,
      imageHint: validatedData.imageHint || 'news article',
    };

    const dataToSave = {
      ...newPostData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    console.log('Attempting to add blog post with data (Admin SDK):', dataToSave);
    const postDocRef = await adminDb.collection('blogPosts').add(dataToSave);
    blogPostDocId = postDocRef.id;
    console.log('Blog post added with ID (Admin SDK): ', blogPostDocId);

  } catch (error: any) {
    console.error('Error during blog post data processing or Firestore write: ', error);
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
      message: `Failed to add blog post to database.${detail}`,
    };
  }

  if (blogPostDocId) {
    try {
      revalidatePath('/admin/blog');
      revalidatePath('/blog');
      revalidatePath(`/blog/${blogPostDocId}`);
      console.log('Paths revalidated successfully for blog post ID:', blogPostDocId);
    } catch (revalidationError: any) {
      console.warn(`Warning: Blog post ${blogPostDocId} added to DB, but path revalidation failed:`, revalidationError);
    }
    redirect('/admin/blog');
  } else {
    return {
      success: false,
      message: 'Failed to add blog post: No post ID was generated after database operation.',
    };
  }
}

export async function deleteBlogPost(postId: string) {
  console.log('Attempting to delete blog post with ID (Admin SDK):', postId);
  if (!adminDb) {
    console.error('Error deleting blog post: Firebase Admin SDK is not initialized.');
    return {
      success: false,
      message: 'Server configuration error: Unable to connect to the database. (Admin SDK not initialized)',
    };
  }

  if (!postId) {
    return { success: false, message: 'Post ID is required for deletion.' };
  }

  try {
    const postRef = adminDb.collection('blogPosts').doc(postId);
    await postRef.delete();
    console.log('Blog post deleted successfully (Admin SDK):', postId);

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    return { success: true, message: 'Blog post deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting blog post (Admin SDK):', error);
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
      message: `Failed to delete blog post.${detail}`,
    };
  }
}
