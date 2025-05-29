
"use client";
// This page is DEPRECATED as assessments are now per-module under the new structure
// /courses/[courseId]/modules/[moduleId]/assessment
// This old route should be removed.

import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useParams } from 'next/navigation';

export default function DeprecatedOldModuleAssessmentPage() {
  const params = useParams<{ courseId: string, moduleId: string }>();
  const { courseId, moduleId: oldModuleId } = params;

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
            This assessment page (for old module ID: {oldModuleId}) is no longer in use.
            Quizzes are now part of the new module structure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please navigate to the main course page and find the relevant module to access its assessment.
          </p>
          <Link href={`/courses/${courseId}`} className="text-primary hover:underline mt-2 inline-block">
            Go to Course Page
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
