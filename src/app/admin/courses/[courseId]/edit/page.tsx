
"use client"; 

import Link from 'next/link';
import { ArrowLeft, Edit3, Save, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, writeBatch, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase'; 
import type { Course, Quiz, QuizQuestion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

const generateId = () => Math.random().toString(36).substring(2, 15);

export default function EditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const courseIdFromParams = params.courseId; // Renamed to avoid conflict with quiz.courseId
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null); // Local state for quiz being edited
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseLongDescription, setCourseLongDescription] = useState('');
  const [courseImageUrl, setCourseImageUrl] = useState('');
  const [courseImageHint, setCourseImageHint] = useState('');
  const [courseVideoUrl, setCourseVideoUrl] = useState('');
  const [coursePrerequisites, setCoursePrerequisites] = useState('');


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push(`/auth/login?redirect=/admin/courses/${courseIdFromParams}/edit`);
      }
    });
    return () => unsubscribe();
  }, [router, courseIdFromParams]);
  
  useEffect(() => {
    if (!courseIdFromParams || !currentUser) { 
      setIsLoading(currentUser ? true : false);
      return;
    }
    setIsLoading(true);
    setError(null);

    const fetchCourseAndQuiz = async () => {
      try {
        const courseRef = doc(db, 'courses', courseIdFromParams as string);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) {
          setError('Course not found.');
          setCourse(null);
          setQuiz(null);
          setIsLoading(false);
          return;
        }
        
        const fetchedCourseData = courseSnap.data();
        const fetchedCourse = { id: courseSnap.id, ...fetchedCourseData } as Course;
        setCourse(fetchedCourse);
        
        setCourseTitle(fetchedCourse.title);
        setCourseDescription(fetchedCourse.description);
        setCourseLongDescription(fetchedCourse.longDescription || '');
        setCourseImageUrl(fetchedCourse.imageUrl);
        setCourseImageHint(fetchedCourse.imageHint || '');
        setCourseVideoUrl(fetchedCourse.videoUrl || '');
        setCoursePrerequisites(
          Array.isArray(fetchedCourse.prerequisites) 
            ? fetchedCourse.prerequisites.join(', ') 
            : ''
        );


        if (fetchedCourse.quizId) {
          const quizRefDoc = doc(db, 'quizzes', fetchedCourse.quizId);
          const quizSnap = await getDoc(quizRefDoc);
          if (quizSnap.exists()) {
            setQuiz({ id: quizSnap.id, ...quizSnap.data() } as Quiz);
          } else {
            console.warn(`Quiz with ID ${fetchedCourse.quizId} not found. A new one will be created if questions are added and saved.`);
            setQuiz(null); 
          }
        } else {
          console.warn("Course has no quizId. A new one will be created if questions are added and saved.");
          setQuiz(null); 
        }

      } catch (e) {
        console.error("Error fetching course/quiz for edit:", e);
        setError('Failed to load course or quiz data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
        fetchCourseAndQuiz();
    }

  }, [courseIdFromParams, currentUser]);

  const handleQuizQuestionChange = (qIndex: number, field: keyof QuizQuestion, value: string | string[] | number) => {
    if (!quiz) return; 
    const updatedQuestions = [...quiz.questions];
    if (field === 'options' && Array.isArray(value)) {
       updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
    } else if (field === 'correctOptionIndex' && typeof value === 'string') {
       updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: parseInt(value,10) };
    } else if (typeof value === 'string' && (field === 'questionText' || field === 'id')) {
       updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
    }
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    if (!quiz) return;
    const updatedQuestions = [...quiz.questions];
    const updatedOptions = [...updatedQuestions[qIndex].options];
    updatedOptions[optIndex] = value;
    updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options: updatedOptions };
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const addQuizQuestion = () => {
    setQuiz(prevQuiz => {
        const currentQuiz = prevQuiz || {
             id: course?.quizId || `newquiz_${courseIdFromParams}`, 
             title: `Quiz for ${courseTitle || 'New Course'}`,
             courseId: courseIdFromParams,
             questions: [],
        };
        const newQuestion: QuizQuestion = {
          id: generateId(), 
          questionText: 'New Question',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctOptionIndex: 0,
        };
        return { ...currentQuiz, questions: [...currentQuiz.questions, newQuestion] };
    });
  };

  const removeQuizQuestion = (qIndex: number) => {
    if (!quiz) return;
    const updatedQuestions = quiz.questions.filter((_, index) => index !== qIndex);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };
  
  const handleSaveChanges = async () => {
    if (!course || !currentUser) {
      toast({ title: "Error", description: "Course data or user session missing.", variant: "destructive"});
      return;
    }
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      const courseRef = doc(db, 'courses', course.id);

      const courseUpdates: Partial<Course> = {
        title: courseTitle,
        description: courseDescription,
        longDescription: courseLongDescription,
        imageUrl: courseImageUrl,
        imageHint: courseImageHint,
        videoUrl: courseVideoUrl,
        prerequisites: coursePrerequisites.split(',').map(p => p.trim()).filter(p => p.length > 0),
      };

      if (quiz) { 
        let finalQuizId = course.quizId; 

        if (!finalQuizId) { 
          const newQuizDocRef = doc(collection(db, 'quizzes')); 
          finalQuizId = newQuizDocRef.id;
          courseUpdates.quizId = finalQuizId; 
        }
        
        const quizRef = doc(db, 'quizzes', finalQuizId);
        const quizDataToSave: Quiz = {
          ...quiz, 
          id: finalQuizId, 
          title: `Quiz for ${courseTitle}`, 
          courseId: course.id, 
        };
        batch.set(quizRef, quizDataToSave, { merge: true }); 
      }
      
      batch.update(courseRef, courseUpdates); 
      
      await batch.commit();
      toast({ title: "Success", description: "Course and quiz updated successfully!" });
      router.push('/admin/courses'); 
    } catch (e: any) {
      console.error("Error saving course/quiz:", e);
      toast({ title: "Error Saving", description: `Failed to save changes. ${e.message || 'Unknown error'}`, variant: "destructive"});
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading course data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <Link href="/admin/courses" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course Management
        </Link>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Course</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-10">
             <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
     return (
      <div className="space-y-6 p-4 md:p-8">
         <Link href="/admin/courses" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course Management
        </Link>
        <p className="text-center text-destructive">Course could not be loaded.</p>
      </div>
    );
  }


  return (
    <div className="space-y-8 mb-12 p-4 md:p-0">
      <Link href="/admin/courses" className="inline-flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course Management
      </Link>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Edit3 className="mr-3 h-6 w-6 text-primary" />
            Edit Course: {course.title}
          </CardTitle>
          <CardDescription>Modify the course details and its associated quiz questions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold">Course Information</h3>
            <div>
              <Label htmlFor="courseTitle">Title</Label>
              <Input id="courseTitle" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="courseDescription">Short Description</Label>
              <Textarea id="courseDescription" value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="courseLongDescription">Long Description</Label>
              <Textarea id="courseLongDescription" value={courseLongDescription} onChange={(e) => setCourseLongDescription(e.target.value)} className="min-h-[100px]" />
            </div>
            <div>
              <Label htmlFor="courseImageUrl">Image URL</Label>
              <Input id="courseImageUrl" value={courseImageUrl} onChange={(e) => setCourseImageUrl(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="courseImageHint">Image Hint</Label>
              <Input id="courseImageHint" value={courseImageHint} onChange={(e) => setCourseImageHint(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="courseVideoUrl">Video URL</Label>
              <Input id="courseVideoUrl" value={courseVideoUrl} onChange={(e) => setCourseVideoUrl(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="coursePrerequisites">Prerequisites (comma-separated)</Label>
              <Input id="coursePrerequisites" value={coursePrerequisites} onChange={(e) => setCoursePrerequisites(e.target.value)} />
            </div>
          </div>

          <Separator />

          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold">Quiz Questions ({quiz?.title || (course.quizId ? 'Quiz Linked (loading/no questions)' : 'No Quiz Linked')})</h3>
            {quiz && quiz.questions && quiz.questions.length > 0 ? (
              quiz.questions.map((q, qIndex) => (
                <Card key={q.id || qIndex} className="p-4 space-y-3 bg-muted/50">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`qtext-${q.id}`}>Question {qIndex + 1}</Label>
                    <Button variant="destructive" size="sm" onClick={() => removeQuizQuestion(qIndex)}>Remove</Button>
                  </div>
                  <Textarea 
                    id={`qtext-${q.id}`} 
                    value={q.questionText} 
                    onChange={(e) => handleQuizQuestionChange(qIndex, 'questionText', e.target.value)}
                    placeholder="Question text"
                  />
                  <Label>Options (Mark the correct one):</Label>
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <Input 
                        value={opt} 
                        onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        className="flex-grow"
                      />
                      <Input 
                        type="radio" 
                        name={`correctOpt-${q.id}`} 
                        value={optIndex.toString()}
                        checked={q.correctOptionIndex === optIndex}
                        onChange={(e) => handleQuizQuestionChange(qIndex, 'correctOptionIndex', e.target.value)}
                        className="form-radio h-4 w-4 text-primary shrink-0"
                        style={{ width: 'auto', height: 'auto', accentColor: 'hsl(var(--primary))' }}
                      />
                    </div>
                  ))}
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">
                {course.quizId && !quiz ? 'Loading quiz or no questions yet...' : 'No quiz linked or no questions added yet.'}
              </p>
            )}
            <Button onClick={addQuizQuestion}>Add Question</Button>
             {course.quizId && !quiz && <p className="text-sm text-destructive mt-2">Info: This course has a quiz ID ({course.quizId}) linked, but the quiz document might be missing or empty. Adding questions will create/update it.</p>}
             {!course.quizId && <p className="text-sm text-muted-foreground mt-2">Info: This course does not have a quiz linked yet. Adding questions will create a new quiz and link it.</p>}
          </div>
          
          <div className="flex justify-end pt-6">
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    