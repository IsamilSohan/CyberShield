
"use client";
// This page is DEPRECATED as assessments are now per-module.
// It will be removed. If accessed directly, it should show a message.

import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useParams } from 'next/navigation';

export default function DeprecatedCourseAssessmentPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  return (
    <div className="space-y-8">
      <Link href={`/courses/${courseId}`} className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course
      </Link>

      <Card className="shadow-lg border-l-4 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-destructive">
            <AlertTriangle className="mr-3 h-6 w-6" />
            Assessment Page Deprecated
          </CardTitle>
          <CardDescription>
            Quizzes and assessments are now part of individual course modules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This course-level assessment page is no longer in use.
            Please navigate to the relevant module within the course to find its assessment.
          </p>
          <Link href={`/courses/${courseId}`} className="text-primary hover:underline mt-2 inline-block">
            Go to Course Modules
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
