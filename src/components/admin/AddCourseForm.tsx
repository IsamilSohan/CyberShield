
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
import { addCourse, NewCourseSchema, type NewCourseInput } from '@/app/admin/courses/actions';
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
      imageUrl: "", // Will default to placeholder if submitted empty via schema transform
      imageHint: "education technology",
      prerequisites: "",
    },
  });

  async function onSubmit(values: NewCourseInput) {
    setIsSubmitting(true);
    try {
      const result = await addCourse(values);

      // The redirect in the server action will handle success.
      // Server actions that redirect cannot return a value.
      // If there's an error object, it means the redirect didn't happen.
      if (result?.success === false) {
        toast({
          title: "Error Adding Course",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
        // You could also set form errors here if `result.errors` is populated
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              form.setError(field as keyof NewCourseInput, { type: "manual", message: messages.join(", ") });
            }
          });
        }
      } else if (!result) {
         // If result is undefined, it means redirect is happening.
         // Toast for optimistic update (though redirect will take over)
        toast({
          title: "Course Added!",
          description: "The new course has been successfully created.",
        });
        // router.push('/admin/courses') is handled by redirect in server action
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred during submission.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <FormLabel>Image URL</FormLabel>
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
        
        <p className="text-sm text-muted-foreground">
          Modules can be added by editing the course after it has been created.
        </p>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
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
