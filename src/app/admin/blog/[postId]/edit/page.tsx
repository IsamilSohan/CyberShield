
"use client";

// Placeholder for Edit Blog Post Page
// This page will be very similar to the AddBlogPostForm, but will fetch existing post data.

import Link from 'next/link';
import { ArrowLeft, Construction, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { BlogPost } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Using client SDK for fetching initial data

// Mock AddBlogPostForm for now, ideally we'd have an EditBlogPostForm
import { AddBlogPostForm } from '@/components/admin/AddBlogPostForm'; 


export default function EditBlogPostPage() {
  const params = useParams<{ postId: string }>();
  const postId = params.postId;
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setError("Post ID is missing.");
      setIsLoading(false);
      return;
    }
    const fetchPost = async () => {
      try {
        const postRef = doc(db, 'blogPosts', postId as string);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          setPost({ id: postSnap.id, ...postSnap.data() } as BlogPost);
        } else {
          setError('Blog post not found.');
        }
      } catch (e) {
        console.error("Error fetching blog post for edit:", e);
        setError('Failed to load blog post data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading post data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 md:p-8 text-center">
        <Link href="/admin/blog" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog Management
        </Link>
        <p className="text-destructive text-xl">{error}</p>
      </div>
    );
  }
  
  if (!post) {
     return (
      <div className="space-y-6 p-4 md:p-8 text-center">
        <p className="text-muted-foreground text-xl">Post data could not be loaded.</p>
         <Link href="/admin/blog" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog Management
        </Link>
      </div>
    );
  }

  // For Phase 1, we'll reuse AddBlogPostForm. 
  // A proper EditBlogPostForm would pre-fill data and use an updateBlogPost action.
  // This is a placeholder to show where the edit form would go.
  return (
    <div className="space-y-6">
      <Link href="/admin/blog" className="inline-flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blog Management
      </Link>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Construction className="mr-3 h-6 w-6 text-primary" />
            Edit Blog Post (Placeholder)
          </CardTitle>
          <CardDescription>
            Currently, this shows the "Add New Post" form. 
            A dedicated edit form with data pre-fill and update logic is needed for "{post.title}".
            For now, you can re-create the post using the form below if you need to make changes,
            then delete the old one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 
            TODO: Create an EditBlogPostForm component.
            This form would take the 'post' data as props to pre-fill fields.
            It would also call an 'updateBlogPost' server action.
          */}
          <p className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md">
            <strong>Note:</strong> This is a placeholder edit page. Submitting this form will create a <em>new</em> post.
            To truly edit, a separate edit form and update action are required.
          </p>
          <AddBlogPostForm />
        </CardContent>
      </Card>
    </div>
  );
}
