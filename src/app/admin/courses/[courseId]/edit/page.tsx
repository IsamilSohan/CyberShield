
"use client"; // Needs to be client for potential form interactions later

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
import { doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase'; // Using client-side db
import type { Course, Quiz, QuizQuestion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

// Helper to generate unique IDs for new questions/options
const generateId = () => Math.random().toString(36).substring(2, 15);

export default function EditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for course details
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
        router.push(`/auth/login?redirect=/admin/courses/${courseId}/edit`);
      }
    });
    return () => unsubscribe();
  }, [router, courseId]);
  
  useEffect(() => {
    if (!courseId || !currentUser) { 
      setIsLoading(currentUser ? true : false);
      return;
    }
    setIsLoading(true);
    setError(null);

    const fetchCourseAndQuiz = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId as string);
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
        // Set form fields
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
          const quizRef = doc(db, 'quizzes', fetchedCourse.quizId);
          const quizSnap = await getDoc(quizRef);
          if (quizSnap.exists()) {
            setQuiz({ id: quizSnap.id, ...quizSnap.data() } as Quiz);
          } else {
            console.warn(`Quiz with ID ${fetchedCourse.quizId} not found.`);
            setQuiz(null);
          }
        } else {
          console.warn("Course has no quizId.");
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

  }, [courseId, currentUser]);

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
    if (!quiz) { // Initialize a new quiz structure if it's null
      const newInitialQuiz: Quiz = {
        id: course?.quizId || `newquiz_${courseId}`, // Use existing quizId or generate one
        title: `Quiz for ${courseTitle || 'New Course'}`,
        courseId: courseId,
        questions: [],
      };
      setQuiz(newInitialQuiz); // Set the new quiz, then add a question to it.
      // Fall through to add the question to the newly initialized quiz.
    }

    // Ensure quiz is not null before proceeding
    setQuiz(prevQuiz => {
        const currentQuiz = prevQuiz || { // Default to a new quiz structure if somehow still null
             id: course?.quizId || `newquiz_${courseId}`,
             title: `Quiz for ${courseTitle || 'New Course'}`,
             courseId: courseId,
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

      // 1. Update Course Document
      const courseRef = doc(db, 'courses', course.id);
      const updatedCourseData: Partial<Course> = {
        title: courseTitle,
        description: courseDescription,
        longDescription: courseLongDescription,
        imageUrl: courseImageUrl,
        imageHint: courseImageHint,
        videoUrl: courseVideoUrl,
        prerequisites: coursePrerequisites.split(',').map(p => p.trim()).filter(p => p.length > 0),
      };
      batch.update(courseRef, updatedCourseData);

      // 2. Update Quiz Document (if quiz exists and has a valid quizId)
      if (quiz && quiz.id && course.quizId) { // Ensure quiz.id is valid
        const quizRef = doc(db, 'quizzes', course.quizId);
        const updatedQuizData: Partial<Quiz> = {
            ...quiz, // Includes id, questions
            title: `Quiz for ${courseTitle}`, // Keep quiz title in sync
            courseId: course.id, // Ensure courseId is set
        };
        batch.update(quizRef, updatedQuizData);
      } else if (quiz && !course.quizId) {
        // This case should ideally not happen if addCourse always creates a quizId.
        // Handle creation of a new quiz if one was modified but not yet linked/saved.
        // This would require using addDoc for the quiz then updating the course with the new quizId.
        // For now, this path assumes quizId exists if quiz object is populated from DB.
        console.warn("Trying to save quiz changes but course has no quizId or quiz object has no id.");
      }
      
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
      <div className="space-y-6">
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
    return <p>Course could not be loaded.</p>;
  }


  return (
    <div className="space-y-8 mb-12">
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
          {/* Course Details Form Part */}
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

          {/* Quiz Questions Editor Part */}
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold">Quiz Questions ({quiz?.title || 'No Quiz Linked'})</h3>
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
                {course.quizId ? 'No questions in this quiz yet, or quiz data could not be loaded.' : 'This course does not have a quiz linked yet.'}
              </p>
            )}
            {/* Always show Add Question button if a course exists, to allow creating/adding to a quiz */}
            <Button onClick={addQuizQuestion}>Add Question</Button>
             {!quiz && course.quizId && <p className="text-destructive">Quiz (ID: {course.quizId}) linked but not found. It might have been deleted.</p>}
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
