
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
import type { Assessment } from "@/lib/types"; // Assessment type now links to courseId
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AssessmentFormProps {
  assessment: Assessment;
  courseId: string; 
}

export function AssessmentForm({ assessment, courseId }: AssessmentFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const formSchemaObject = assessment.questions.reduce((acc, question) => {
    acc[`question_${question.id}`] = z.string().min(1, { message: "Please select an answer." });
    return acc;
  }, {} as Record<string, z.ZodString>);

  const formSchema = z.object(formSchemaObject);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: assessment.questions.reduce((acc, q) => ({ ...acc, [`question_${q.id}`]: "" }), {}),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Assessment Answers:", values);
    toast({
      title: "Assessment Submitted!",
      description: "You have successfully completed the assessment.",
    });
    router.push(`/courses/${courseId}/certificate`);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Assessment</CardTitle>
        <CardDescription className="text-center">
          {/* Assessment is now tied to courseId, not moduleId */}
          Test your knowledge for course: {assessment.courseId} 
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {assessment.questions.map((question, index) => (
              <FormField
                key={question.id}
                control={form.control}
                name={`question_${question.id}` as keyof z.infer<typeof formSchema>}
                render={({ field }) => (
                  <FormItem className="space-y-3 p-4 border rounded-md">
                    <FormLabel className="text-base font-semibold">
                      {index + 1}. {question.questionText}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        {question.options.map((option) => (
                          <FormItem key={option.id} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={option.id} />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              {option.text}
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
            <div className="flex justify-end gap-4">
              {/* Link back to the main course page */}
              <Button type="button" variant="outline" asChild>
                 <Link href={`/courses/${courseId}`}>Back to Course</Link>
              </Button>
              <Button type="submit">Submit Assessment</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
