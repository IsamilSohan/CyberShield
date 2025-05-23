"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { GenerateStudyGuideInput } from '@/ai/flows/generate-study-guide';
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }).max(100, { message: "Topic must be 100 characters or less." }),
  videoTranscript: z.string().min(50, { message: "Transcript must be at least 50 characters." }).max(5000, { message: "Transcript must be 5000 characters or less." }),
});

interface StudyGuideFormProps {
  onSubmit: (data: GenerateStudyGuideInput) => Promise<void>;
  isLoading: boolean;
  initialTopic?: string;
  initialTranscript?: string;
}

export function StudyGuideForm({ onSubmit, isLoading, initialTopic = "", initialTranscript = "" }: StudyGuideFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: initialTopic,
      videoTranscript: initialTranscript,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesson Topic</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Introduction to Phishing Attacks" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="videoTranscript"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Transcript</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Paste the video transcript here..."
                  className="min-h-[200px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Generating..." : "Generate Study Guide"}
        </Button>
      </form>
    </Form>
  );
}
