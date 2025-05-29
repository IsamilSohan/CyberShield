
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle, Award, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssessmentForm } from '@/components/assessment/AssessmentForm';
import type { Course, Module as ModuleType, Quiz, QuizQuestion, Certificate, User as AppUser } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const generateId = () => Math.random().toString(36).substring(2, 15);

export default function ModuleAssessmentPage() {
  const params = useParams<{ courseId: string; moduleId: string }>();
  const router = useRouter();
  const { courseId, moduleId } = params;
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<ModuleType | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch app user data
        const userRef = doc(db, "users", user.uid);
        getDoc(userRef).then(userSnap => {
          if (userSnap.exists()) {
            setAppUser({ id: userSnap.id, ...userSnap.data() } as AppUser);
          }
        });
      } else {
        router.push(`/auth/login?redirect=/courses/${courseId}/modules/${moduleId}/assessment`);
      }
    });
    return () => unsubscribe();
  }, [router, courseId, moduleId]);

  useEffect(() => {
    if (!currentUser || !courseId || !moduleId) {
      setIsLoading(!!currentUser);
      return;
    }
    setIsLoading(true);
    setError(null);
    setQuizResult(null);

    const fetchAssessmentData = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        if (!courseSnap.exists()) throw new Error('Course not found.');
        
        const fetchedCourse = { id: courseSnap.id, ...courseSnap.data() } as Course;
        setCourse(fetchedCourse);

        const foundModule = fetchedCourse.modules?.find(m => m.id === moduleId);
        if (!foundModule) throw new Error('Module not found in this course.');
        setModule(foundModule);

        if (!foundModule.quizId) {
            setError('No quiz associated with this module.');
            setQuiz(null);
            return;
        }

        const quizRef = doc(db, 'quizzes', foundModule.quizId);
        const quizSnap = await getDoc(quizRef);
        if (!quizSnap.exists()) throw new Error('Quiz data not found.');
        
        setQuiz({ id: quizSnap.id, ...quizSnap.data() } as Quiz);

      } catch (e: any) {
        console.error("Error fetching assessment data:", e);
        setError(`Failed to load assessment. ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentData();
  }, [currentUser, courseId, moduleId]);

  const handleQuizSubmit = async (answers: Record<string, string>) => {
    if (!quiz || !currentUser || !appUser || !course || !module) {
      toast({ title: "Error", description: "Missing data to submit quiz.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    let score = 0;
    quiz.questions.forEach(q => {
      const selectedOptionIndex = parseInt(answers[`question_${q.id}`], 10);
      if (selectedOptionIndex === q.correctAnswerIndex) {
        score++;
      }
    });

    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    const passed = percentage >= 80;

    setQuizResult({ score, total: totalQuestions, passed });

    if (passed) {
      toast({ title: "Congratulations!", description: `You passed with ${percentage.toFixed(0)}%! Certificate earned.`, variant: "default" });
      try {
        const certificateId = `cert-${course.id}-${module.id}-${currentUser.uid}-${generateId()}`;
        const newCertificate: Certificate = {
          id: certificateId,
          courseId: course.id,
          courseTitle: course.title,
          // moduleId: module.id, // Consider adding if certs are per module
          // moduleTitle: module.title,
          userId: currentUser.uid,
          userName: appUser.name || currentUser.displayName || "User",
          issueDate: new Date().toISOString(),
          // certificateUrl: // Optional: URL to a pre-generated certificate image if you have one
        };

        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          certificates: arrayUnion(newCertificate)
        });
        
        // Redirect to certificate page
        router.push(`/courses/${courseId}/certificate?certId=${certificateId}`);

      } catch (e: any) {
        console.error("Error issuing certificate:", e);
        toast({ title: "Certificate Error", description: `Failed to issue certificate. ${e.message}`, variant: "destructive" });
      }
    } else {
      toast({ title: "Try Again!", description: `You scored ${percentage.toFixed(0)}%. A score of 80% is needed to pass.`, variant: "default" });
    }
    setIsSubmitting(false);
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link href={`/courses/${courseId}/modules/${moduleId}`} className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Module
        </Link>
        <Card className="shadow-lg border-l-4 border-destructive">
          <CardHeader><CardTitle className="flex items-center text-xl text-destructive"><AlertTriangle className="mr-3 h-6 w-6"/>Error</CardTitle></CardHeader>
          <CardContent><p className="text-destructive">{error}</p></CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="space-y-6">
        <Link href={`/courses/${courseId}/modules/${moduleId}`} className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Module
        </Link>
        <p className="text-center text-muted-foreground">No quiz available for this module.</p>
      </div>
    );
  }
  
  if (quizResult) {
    return (
      <div className="space-y-6 text-center max-w-md mx-auto">
         <Card className={`shadow-xl ${quizResult.passed ? 'border-green-500' : 'border-destructive'}`}>
            <CardHeader>
                <CardTitle className="flex items-center justify-center text-2xl">
                    {quizResult.passed ? <Award className="mr-3 h-8 w-8 text-yellow-500"/> : <AlertTriangle className="mr-3 h-8 w-8 text-destructive"/>}
                    Quiz Result
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-lg">You scored: <strong>{quizResult.score} out of {quizResult.total}</strong> ({quizResult.total > 0 ? (quizResult.score/quizResult.total*100).toFixed(0) : 0}%)</p>
                {quizResult.passed ? (
                    <>
                        <p className="text-green-600 font-semibold">Congratulations, you passed!</p>
                        <Button asChild>
                            <Link href={`/courses/${courseId}`}>Go to Course Overview</Link>
                        </Button>
                    </>
                ) : (
                    <>
                        <p className="text-destructive">Unfortunately, you did not pass. You need 80% to pass.</p>
                        <Button onClick={() => setQuizResult(null)} variant="outline">Retry Quiz</Button>
                         <Button asChild variant="ghost" className="ml-2">
                            <Link href={`/courses/${courseId}/modules/${moduleId}`}>Review Module</Link>
                        </Button>
                    </>
                )}
            </CardContent>
         </Card>
      </div>
    )
  }


  return (
    <div className="space-y-8">
      <Link href={`/courses/${courseId}/modules/${moduleId}`} className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Module: {module?.title || '...'}
      </Link>
      <AssessmentForm 
        quiz={quiz} 
        courseId={courseId} // Pass courseId directly if needed by form
        onSubmit={handleQuizSubmit} 
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
