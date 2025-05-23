"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { StudyGuideForm } from '@/components/study-guide/StudyGuideForm';
import { StudyGuideDisplay } from '@/components/study-guide/StudyGuideDisplay';
import { generateStudyGuide, type GenerateStudyGuideInput, type GenerateStudyGuideOutput } from '@/ai/flows/generate-study-guide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Helper component to access searchParams because useSearchParams can only be used in Client Components
function StudyGuideContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get('topic') || '';
  const initialTranscript = searchParams.get('transcript') || '';

  const [studyGuide, setStudyGuide] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateStudyGuide = async (data: GenerateStudyGuideInput) => {
    setIsLoading(true);
    setStudyGuide(null);
    try {
      const result: GenerateStudyGuideOutput = await generateStudyGuide(data);
      setStudyGuide(result.studyGuide);
      toast({
        title: "Study Guide Generated!",
        description: "Your personalized study guide is ready.",
      });
    } catch (error) {
      console.error("Error generating study guide:", error);
      toast({
        title: "Error",
        description: "Failed to generate study guide. Please try again.",
        variant: "destructive",
      });
      setStudyGuide("An error occurred while generating the study guide. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <header className="text-center">
        <Lightbulb className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold">AI Study Guide Generator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Get a concise summary of your video lessons to reinforce learning and improve retention.
        </p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Create Your Study Guide</CardTitle>
          <CardDescription>
            Enter the lesson topic and paste the video transcript below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudyGuideForm 
            onSubmit={handleGenerateStudyGuide} 
            isLoading={isLoading}
            initialTopic={initialTopic}
            initialTranscript={initialTranscript}
          />
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-4">
          <p className="text-primary animate-pulse">Generating your study guide, please wait...</p>
        </div>
      )}

      {studyGuide && <StudyGuideDisplay studyGuideText={studyGuide} />}
    </div>
  );
}


export default function StudyGuidePage() {
  return (
    // Suspense is required for useSearchParams in child components during SSR
    <Suspense fallback={<div>Loading study guide parameters...</div>}>
      <StudyGuideContent />
    </Suspense>
  );
}
