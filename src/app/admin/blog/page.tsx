
import Link from 'next/link';
import { ArrowLeft, Newspaper, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BlogPost } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';
import { BlogPostActions } from '@/components/admin/BlogPostActions';
import { format } from 'date-fns';

async function getBlogPostsFromFirestore(): Promise<BlogPost[]> {
  if (!adminDb) {
    console.error("AdminBlogPage: Firebase Admin SDK not initialized. Blog posts cannot be fetched.");
    throw new Error("Admin SDK not initialized, cannot fetch blog posts.");
  }
  try {
    const postsSnapshot = await adminDb.collection('blogPosts').orderBy('createdAt', 'desc').get();
    const postsList = postsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Post',
        subHeader: data.subHeader || '',
        content: data.content || '',
        imageUrl: data.imageUrl || 'https://placehold.co/800x400.png',
        imageHint: data.imageHint || 'news article',
        createdAt: data.createdAt?.toDate ? format(data.createdAt.toDate(), 'PPP') : 'N/A',
        updatedAt: data.updatedAt?.toDate ? format(data.updatedAt.toDate(), 'PPP') : 'N/A',
      } as BlogPost;
    });
    return postsList;
  } catch (error) {
    console.error("Error fetching blog posts from Firestore (Admin SDK):", error);
    throw error;
  }
}

export default async function AdminBlogPage() {
  let posts: BlogPost[] = [];
  let error: string | null = null;

  try {
    posts = await getBlogPostsFromFirestore();
  } catch (e: any) {
    console.error("Failed to fetch blog posts for AdminBlogPage:", e.message);
    if (e.message.includes("Admin SDK not initialized")) {
      error = "Server configuration error: Unable to connect to the database. (Admin SDK not initialized)";
    } else {
      error = `Failed to load blog posts. Details: ${e.message}`;
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin Dashboard
      </Link>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-2xl">
              <Newspaper className="mr-3 h-6 w-6 text-primary" />
              Blog Post Management
            </CardTitle>
            <CardDescription>View, add, edit, and delete blog posts.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/blog/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Post
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>
          )}
          {!error && posts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell className="hidden md:table-cell">{post.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <BlogPostActions postId={post.id} postTitle={post.title} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : !error && (
            <p className="text-muted-foreground">No blog posts found. Click "Add New Post" to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
