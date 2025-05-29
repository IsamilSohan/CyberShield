
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { addReview } from '@/app/reviews/actions';
import { NewReviewSchema, type NewReviewInput } from '@/lib/types';
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import type { User as FirebaseUser } from 'firebase/auth';

interface AddReviewFormProps {
  courseId: string;
  currentUser: FirebaseUser | null; // Pass FirebaseUser to get UID
  onReviewSubmitted?: () => void; // Optional callback
}

export function AddReviewForm({ courseId, currentUser, onReviewSubmitted }: AddReviewFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<Omit<NewReviewInput, 'userId' | 'userName'>>({ // Exclude server-set fields
    resolver: zodResolver(NewReviewSchema.omit({ userId: true, courseId: true})), // Omit for client-side validation
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });
  
  const currentRating = form.watch("rating");

  async function onSubmit(values: Omit<NewReviewInput, 'userId' | 'userName'>) {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to submit a review.", variant: "destructive" });
      return;
    }
    if (values.rating === 0) {
        form.setError("rating", { type: "manual", message: "Please select a rating." });
        return;
    }

    setIsSubmitting(true);
    
    const reviewData: NewReviewInput = {
      ...values,
      courseId: courseId,
      userId: currentUser.uid,
    };

    const result = await addReview(reviewData);

    if (result?.success) {
      toast({
        title: "Review Submitted!",
        description: result.message,
      });
      form.reset(); // Reset form after successful submission
      if (onReviewSubmitted) {
        onReviewSubmitted(); // Call callback to refresh reviews list
      }
    } else {
      toast({
        title: "Error Submitting Review",
        description: result?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      if (result?.errors) {
         Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
                form.setError(field as keyof NewReviewInput, { type: "manual", message: messages.join(", ") });
            }
        });
      }
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <Star
                      key={starValue}
                      className={`h-6 w-6 cursor-pointer transition-colors
                        ${(hoverRating >= starValue || currentRating >= starValue) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-300'}
                      `}
                      onClick={() => form.setValue("rating", starValue, { shouldValidate: true })}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your thoughts on the course..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting || !currentUser}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
        {!currentUser && <p className="text-sm text-muted-foreground">Please login to submit a review.</p>}
      </form>
    </Form>
  );
}
