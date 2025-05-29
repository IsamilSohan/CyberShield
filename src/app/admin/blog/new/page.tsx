
import Link from 'next/link';
import { ArrowLeft, FilePlus } from 'lucide-react';
import { AddBlogPostForm } from '@/components/admin/AddBlogPostForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/blog" className="inline-flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blog Management
      </Link>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <FilePlus className="mr-3 h-6 w-6 text-primary" />
            Add New Blog Post
          </CardTitle>
          <CardDescription>Fill in the details for the new blog post.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddBlogPostForm />
        </CardContent>
      </Card>
    </div>
  );
}
