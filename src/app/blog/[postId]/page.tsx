
import { db } from '@/lib/firebase'; // Using client SDK
import type { BlogPost } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// For Markdown rendering (optional, but good for blog content)
// import ReactMarkdown from 'react-markdown'; 
// import remarkGfm from 'remark-gfm';

async function getBlogPost(postId: string): Promise<BlogPost | null> {
  try {
    const postRef = doc(db, 'blogPosts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return null;
    }
    const data = postSnap.data();
    return {
      id: postSnap.id,
      title: data.title || 'Untitled Post',
      subHeader: data.subHeader || '',
      content: data.content || '',
      imageUrl: data.imageUrl || 'https://placehold.co/1200x600.png',
      imageHint: data.imageHint || 'blog post detail',
      createdAt: data.createdAt?.toDate ? format(data.createdAt.toDate(), 'PPP p') : 'Date not available',
      updatedAt: data.updatedAt?.toDate ? format(data.updatedAt.toDate(), 'PPP p') : 'Date not available',
    } as BlogPost;
  } catch (error) {
    console.error(`Error fetching blog post ${postId}:`, error);
    return null;
  }
}

interface BlogPostPageProps {
  params: { postId: string };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.postId);

  if (!post) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold text-destructive">Blog Post Not Found</h1>
        <p className="text-muted-foreground mt-2">The post you are looking for does not exist or could not be loaded.</p>
        <Link href="/blog" className="text-primary hover:underline mt-4 inline-block">
          Back to Blog
        </Link>
      </div>
    );
  }

  // Basic Markdown to HTML (replace with a proper library for richer formatting)
  const renderContent = (text: string) => {
    // A very simple paragraph and newline handler
    return text.split('\\n').map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0 leading-relaxed">
        {paragraph}
      </p>
    ));
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 py-8">
      <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-6 group">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Blog
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-3">
            {post.title}
          </h1>
          {post.subHeader && (
            <p className="text-lg sm:text-xl text-muted-foreground mb-4">
              {post.subHeader}
            </p>
          )}
          <div className="flex items-center text-sm text-muted-foreground space-x-4">
            <div className="flex items-center">
              <CalendarDays className="mr-1.5 h-4 w-4" />
              <span>Published: {post.createdAt}</span>
            </div>
            {post.updatedAt !== post.createdAt && (
               <div className="flex items-center">
                <Edit3 className="mr-1.5 h-4 w-4" />
                <span>Updated: {post.updatedAt}</span>
              </div>
            )}
          </div>
        </header>

        {post.imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={post.imageUrl}
              alt={post.title}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              data-ai-hint={post.imageHint || "article cover"}
              priority // Prioritize loading the main image
            />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* For more advanced Markdown/HTML rendering, use a library like react-markdown
              Example: <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown> 
              For now, using a simple text rendering:
          */}
           {renderContent(post.content)}
        </div>
      </article>
    </div>
  );
}
