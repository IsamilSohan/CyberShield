
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addBlogPost } from '@/app/admin/blog/actions';
import { NewBlogPostSchema, type NewBlogPostInput } from '@/lib/types';
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function AddBlogPostForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewBlogPostInput>({
    resolver: zodResolver(NewBlogPostSchema),
    defaultValues: {
      title: "",
      subHeader: "",
      content: "",
      imageUrl: "",
      imageHint: "news article",
    },
  });

  async function onSubmit(values: NewBlogPostInput) {
    setIsSubmitting(true);
    
    const result = await addBlogPost(values);

    if (result && result.success === false) {
      toast({
        title: "Error Adding Blog Post",
        description: result.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            form.setError(field as keyof NewBlogPostInput, { type: "manual", message: messages.join(", ") });
          }
        });
      }
    }
    // Successful redirect is handled by the server action.
    // No explicit success toast here as redirect is the success indicator.
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Title (Header)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., New Breakthrough in Cybersecurity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subHeader"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub-Header (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="A brief tagline or summary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Write your blog post content here. You can use Markdown for formatting." className="min-h-[200px]" {...field} />
              </FormControl>
              <FormDescription>
                You can use Markdown for simple formatting like **bold**, *italic*, links, and lists.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/blog-image.png" {...field} />
              </FormControl>
              <FormDescription>
                Link to the main image for the blog post. Leave blank for a default placeholder.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image AI Hint (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., technology abstract" {...field} />
              </FormControl>
              <FormDescription>
                Keywords for AI image generation if a placeholder is used for the main image. Max two words.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Adding Post..." : "Add Blog Post"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
