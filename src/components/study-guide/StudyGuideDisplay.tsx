import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StudyGuideDisplayProps {
  studyGuideText: string;
}

export function StudyGuideDisplay({ studyGuideText }: StudyGuideDisplayProps) {
  if (!studyGuideText) return null;

  // Basic Markdown-like formatting for paragraphs and newlines
  const formattedText = studyGuideText
    .split('\n\n') // Split by double newlines for paragraphs
    .map((paragraph, pIndex) => (
      <p key={`p-${pIndex}`} className="mb-4 last:mb-0">
        {paragraph.split('\n').map((line, lIndex) => (
          <span key={`l-${lIndex}`}>
            {line}
            {lIndex < paragraph.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
    ));

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Your AI-Generated Study Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full rounded-md border p-4 bg-muted/20">
          <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert leading-relaxed">
            {formattedText}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
