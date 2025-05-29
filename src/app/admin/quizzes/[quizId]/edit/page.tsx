
"use client";

import Link from 'next/link';
import { ArrowLeft, Save, Loader2, AlertTriangle, PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Quiz, QuizQuestion } from '@/lib/types';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { updateQuizAction } from '@/app/admin/quizzes/actions';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper component to use useSearchParams
function EditQuizPageContent() {
  const params = useParams<{ quizId: string }>();
  const searchParams = useSearchParams();
  const quizId = params.quizId;
  const courseIdFromQuery = searchParams.get('courseId');
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for form fields
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push(`/auth/login?redirect=/admin/quizzes/${quizId}/edit${courseIdFromQuery ? `?courseId=${courseIdFromQuery}` : ''}`);
      }
    });
    return () => unsubscribe();
  }, [router, quizId, courseIdFromQuery]);

  useEffect(() => {
    if (!quizId || !currentUser) {
      setIsLoading(!!currentUser);
      return;
    }
    setIsLoading(true);
    setError(null);

    const fetchQuizData = async () => {
      try {
        const quizRef = doc(db, 'quizzes', quizId);
        const quizSnap = await getDoc(quizRef);

        if (!quizSnap.exists()) {
          setError('Quiz not found.');
          setQuiz(null);
        } else {
          const fetchedQuiz = { id: quizSnap.id, ...quizSnap.data() } as Quiz;
          setQuiz(fetchedQuiz);
          setQuizTitle(fetchedQuiz.title);
          setQuestions(fetchedQuiz.questions || []);
        }
      } catch (e: any) {
        console.error("Error fetching quiz:", e);
        setError(`Failed to load quiz data. ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizData();
  }, [quizId, currentUser]);

  const handleQuestionTextChange = (questionId: string, text: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, questionText: text } : q));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, text: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = text;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleAddOption = (questionId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...q.options, `New Option ${q.options.length + 1}`] };
      }
      return q;
    }));
  };
  
  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    setQuestions(prev => prev.map(q => {
        if (q.id === questionId) {
            const newOptions = q.options.filter((_, idx) => idx !== optionIndex);
            // Adjust correctAnswerIndex if a preceding option was removed or if the removed option was correct
            let newCorrectAnswerIndex = q.correctAnswerIndex;
            if (optionIndex < q.correctAnswerIndex) {
                newCorrectAnswerIndex--;
            } else if (optionIndex === q.correctAnswerIndex) {
                newCorrectAnswerIndex = 0; // Default to first option if correct one is removed
            }
            newCorrectAnswerIndex = Math.max(0, Math.min(newOptions.length -1, newCorrectAnswerIndex));

            return { ...q, options: newOptions, correctAnswerIndex: newOptions.length > 0 ? newCorrectAnswerIndex : 0 };
        }
        return q;
    }));
};


  const handleCorrectAnswerChange = (questionId: string, optionIndex: number) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, correctAnswerIndex: optionIndex } : q));
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: generateId(),
        questionText: 'New Question',
        options: ['Option 1', 'Option 2'],
        correctAnswerIndex: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleSaveChanges = async () => {
    if (!quiz || !currentUser) {
      toast({ title: "Error", description: "Quiz data or user session missing.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const updatedQuizData: Quiz = {
      ...quiz,
      title: quizTitle,
      questions: questions,
    };

    const result = await updateQuizAction(quiz.id, updatedQuizData);

    if (result.success) {
      toast({ title: "Success", description: result.message });
      if (courseIdFromQuery) {
        router.push(`/admin/courses/${courseIdFromQuery}/edit`);
      } else {
        router.push('/admin/courses'); // Fallback if no courseId
      }
    } else {
      toast({ title: "Error Saving Quiz", description: result.message, variant: "destructive" });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="mr-2 h-8 w-8 animate-spin"/>Loading quiz editor...</div>;
  }
  if (error) {
    return <div className="text-destructive p-4">{error}</div>;
  }
  if (!quiz) {
    return <div className="p-4">Quiz data could not be loaded.</div>;
  }

  const backLink = courseIdFromQuery ? `/admin/courses/${courseIdFromQuery}/edit` : '/admin/courses';

  return (
    <div className="space-y-6 mb-12 p-4 md:p-0">
      <Link href={backLink} className="inline-flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back 
      </Link>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Edit Quiz: {quiz.title}</CardTitle>
          <CardDescription>Modify the quiz title and questions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="quizTitle">Quiz Title</Label>
            <Input id="quizTitle" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
          </div>
          <Separator />
          <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
          {questions.map((q, qIndex) => (
            <Card key={q.id} className="p-4 space-y-3 bg-muted/30">
              <div className="flex justify-between items-center">
                <Label htmlFor={`qtext-${q.id}`}>Question {qIndex + 1}</Label>
                <Button variant="destructive" size="sm" onClick={() => handleRemoveQuestion(q.id)}><Trash2 className="h-4 w-4 mr-1"/>Remove Question</Button>
              </div>
              <Input
                id={`qtext-${q.id}`}
                value={q.questionText}
                onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                placeholder="Enter question text"
              />
              <Label>Options & Correct Answer:</Label>
              <RadioGroup value={q.correctAnswerIndex.toString()} onValueChange={(val) => handleCorrectAnswerChange(q.id, parseInt(val))}>
                {q.options.map((opt, optIndex) => (
                  <div key={`${q.id}-opt-${optIndex}`} className="flex items-center gap-2">
                    <RadioGroupItem value={optIndex.toString()} id={`${q.id}-opt-${optIndex}`} />
                    <Input
                      value={opt}
                      onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                      className="flex-grow"
                    />
                    <Button variant="outline" size="sm" onClick={() => handleRemoveOption(q.id, optIndex)} disabled={q.options.length <= 1}>
                      <Trash2 className="h-3 w-3"/>
                    </Button>
                  </div>
                ))}
              </RadioGroup>
              <Button variant="outline" size="sm" onClick={() => handleAddOption(q.id)}><PlusCircle className="h-4 w-4 mr-1"/>Add Option</Button>
            </Card>
          ))}
          <Button onClick={handleAddQuestion}><PlusCircle className="h-4 w-4 mr-1"/>Add New Question</Button>
          <Separator />
          <div className="flex justify-end">
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Quiz Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditQuizPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="mr-2 h-8 w-8 animate-spin"/>Loading...</div>}>
      <EditQuizPageContent />
    </Suspense>
  );
}
