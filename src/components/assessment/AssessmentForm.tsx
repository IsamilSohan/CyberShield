
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Quiz } from "@/lib/types"; // QuizQuestion is part of Quiz
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface AssessmentFormProps {
  quiz: Quiz;
  courseId: string; // Keep courseId for the "Back to Course/Module" link
  onSubmit: (values: Record<string, string>) => Promise<void>;
  isSubmitting: boolean;
}

export function AssessmentForm({ quiz, courseId, onSubmit, isSubmitting }: AssessmentFormProps) {
  
  const formSchemaObject = quiz.questions.reduce((acc, question) => {
    acc[`question_${question.id}`] = z.string().min(1, { message: "Please select an answer." });
    return acc;
  }, {} as Record<string, z.ZodString>);

  const formSchema = z.object(formSchemaObject);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: quiz.questions.reduce((acc, q) => ({ ...acc, [`question_${q.id}`]: "" }), {}),
  });

  function processSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{quiz.title}</CardTitle>
        <CardDescription className="text-center">
          Test your knowledge from module: {quiz.moduleId ? `Module (ID: ${quiz.moduleId.substring(0,6)}...)` : 'General'}. Select one answer for each question.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-8">
            {quiz.questions.map((question, questionIndex) => (
              <FormField
                key={question.id}
                control={form.control}
                name={`question_${question.id}` as keyof z.infer<typeof formSchema>}
                render={({ field }) => (
                  <FormItem className="space-y-3 p-4 border rounded-md bg-card shadow">
                    <FormLabel className="text-base font-semibold">
                      {questionIndex + 1}. {question.questionText}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        {question.options.map((optionText, optionIndex) => (
                          <FormItem key={`${question.id}-opt-${optionIndex}`} className="flex items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <FormControl>
                              <RadioGroupItem value={optionIndex.toString()} id={`${field.name}-opt-${optionIndex}`} />
                            </FormControl>
                            <FormLabel htmlFor={`${field.name}-opt-${optionIndex}`} className="font-normal text-sm cursor-pointer">
                              {optionText}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" asChild disabled={isSubmitting}>
                 {/* Link back to the specific module, or course if moduleId is not available */}
                 <Link href={quiz.moduleId ? `/courses/${courseId}/modules/${quiz.moduleId}` : `/courses/${courseId}`}>Back to Content</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Submitting..." : "Submit Assessment"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

