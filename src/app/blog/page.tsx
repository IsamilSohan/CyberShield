
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/lib/types';
import { db } from '@/lib/firebase'; // Using client SDK for public page
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const postsCol = collection(db, 'blogPosts');
    // Order by createdAt in descending order to get newest posts first
    const q = query(postsCol, orderBy('createdAt', 'desc'), limit(20)); // Limit to 20 posts for now
    const postsSnapshot = await getDocs(q);
    const postsList = postsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Post',
        subHeader: data.subHeader || '',
        content: data.content || '',
        imageUrl: data.imageUrl || 'https://placehold.co/800x400.png',
        imageHint: data.imageHint || 'news article',
        // Ensure createdAt is converted from Firestore Timestamp to string
        createdAt: data.createdAt?.toDate ? format(data.createdAt.toDate(), 'PPP') : 'Date not available',
        updatedAt: data.updatedAt?.toDate ? format(data.updatedAt.toDate(), 'PPP') : 'Date not available',
      } as BlogPost;
    });
    return postsList;
  } catch (error) {
    console.error("Error fetching blog posts for public page:", error);
    return []; 
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="space-y-12">
      <section className="text-center py-10 bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-lg shadow-sm">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Our Blog & News
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay updated with the latest articles, news, and insights from Cyber Shield.
        </p>
      </section>

      <section>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                  <Link href={`/blog/${post.id}`} className="block">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      width={800}
                      height={400}
                      className="w-full h-48 object-cover"
                      data-ai-hint={post.imageHint || "blog post image"}
                    />
                  </Link>
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <Link href={`/blog/${post.id}`}>
                    <CardTitle className="text-xl mb-2 hover:text-primary transition-colors line-clamp-2">{post.title}</CardTitle>
                  </Link>
                  {post.subHeader && <CardDescription className="text-sm text-muted-foreground mb-3 line-clamp-3">{post.subHeader}</CardDescription>}
                   <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <CalendarDays className="mr-1.5 h-4 w-4" />
                      <span>{post.createdAt}</span>
                    </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/blog/${post.id}`}>Read More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            No blog posts available at the moment. Please check back soon.
          </p>
        )}
      </section>
    </div>
  );
}
