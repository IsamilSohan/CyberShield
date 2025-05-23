
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
import { Separator } from "@/components/ui/separator";

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
      initialModuleTitle: "",
      initialModuleVideoUrl: "",
    },
  });

  async function onSubmit(values: NewCourseInput) {
    setIsSubmitting(true);
    try {
      const result = await addCourse(values);

      if (result?.success === false) {
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
      } else if (!result) {
        toast({
          title: "Course Added!",
          description: "The new course has been successfully created.",
        });
        // router.push('/admin/courses'); // Redirect is handled by the action
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
        
        <Separator className="my-8" />
        <h3 className="text-lg font-medium">Initial Module (Optional)</h3>
        <p className="text-sm text-muted-foreground">
          You can add one module to get started. More modules can be added by editing the course later.
        </p>

        <FormField
          control={form.control}
          name="initialModuleTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Module Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Welcome to the Course" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="initialModuleVideoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Module Video URL</FormLabel>
              <FormControl>
                <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
              </FormControl>
               <FormDescription>
                Paste the full YouTube (or other video platform) URL here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <p className="text-sm text-muted-foreground mt-4">
          Transcript and duration for this initial module can be added later by editing the course.
        </p>

        <div className="flex justify-end gap-4 pt-4">
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
