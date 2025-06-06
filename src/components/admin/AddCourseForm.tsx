
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
import { addCourse } from '@/app/admin/courses/actions';
import { NewCourseSchema, type NewCourseInput } from '@/lib/types';
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function AddCourseForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewCourseInput>({
    resolver: zodResolver(NewCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      longDescription: "",
      imageUrl: "",
      imageHint: "education technology",
      prerequisites: "",
    },
  });

  async function onSubmit(values: NewCourseInput) {
    setIsSubmitting(true);
    
    // Call the server action.
    // If addCourse throws (e.g., for a redirect), Next.js should handle it.
    // If it returns an object, it's an error object we defined.
    const result = await addCourse(values);

    // Only process 'result' if it's an error object returned from the server action
    if (result && result.success === false) {
      toast({
        title: "Error Adding Course",
        description: result.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            form.setError(field as keyof NewCourseInput, { type: "manual", message: messages.join(", ") });
          }
        });
      }
    }
    // If addCourse was successful and initiated a redirect,
    // this part of the code might not even be reached, or 'result' would not be an error object.
    // No explicit success toast here as redirect is the success indicator.

    setIsSubmitting(false); // Set to false regardless of outcome, redirect will navigate away
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Introduction to Cybersecurity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief overview of the course." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Long Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="A more detailed description of the course content, learning objectives, etc." className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormDescription>
                Link to the course cover image. Leave blank to use a default placeholder.
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
                Keywords for AI image generation if a placeholder is used. Max two words.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="prerequisites"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prerequisites (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Basic HTML, Understanding of JavaScript" {...field} />
              </FormControl>
              <FormDescription>
                Enter prerequisites, separated by commas.
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
                {isSubmitting ? "Adding Course..." : "Add Course"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
