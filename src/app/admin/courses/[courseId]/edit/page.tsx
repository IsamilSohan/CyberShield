
"use client";

import Link from 'next/link';
import { ArrowLeft, Edit3, Save, Loader2, AlertTriangle, PlusCircle, Trash2, BookOpen, FileText, Image as ImageIcon, Video, GripVertical, ListChecks } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Course, Module, ContentBlock, Quiz, QuizQuestion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

const generateId = () => Math.random().toString(36).substring(2, 15);

export default function EditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Course basic info
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseLongDescription, setCourseLongDescription] = useState('');
  const [courseImageUrl, setCourseImageUrl] = useState('');
  const [courseImageHint, setCourseImageHint] = useState('');
  const [coursePrerequisites, setCoursePrerequisites] = useState('');

  // Modules state
  const [courseModules, setCourseModules] = useState<Module[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // New content block state (per module, managed when a module accordion is open)
  const [newContentBlockType, setNewContentBlockType] = useState<'text' | 'image' | 'video'>('text');
  const [newContentBlockValue, setNewContentBlockValue] = useState('');
  const [newContentBlockImageHint, setNewContentBlockImageHint] = useState('');


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

    const fetchCourseData = async () => {
      try {
        const courseRef = doc(db, 'courses', courseId as string);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) {
          setError('Course not found.');
          setCourse(null);
          setIsLoading(false);
          return;
        }

        const fetchedCourseData = courseSnap.data();
        const fetchedCourse = {
          id: courseSnap.id,
          ...fetchedCourseData,
          modules: (fetchedCourseData.modules || []).map((m: any) => ({
            ...m,
            contentBlocks: m.contentBlocks || [] // Ensure contentBlocks is an array
          }))
        } as Course;
        setCourse(fetchedCourse);

        setCourseTitle(fetchedCourse.title);
        setCourseDescription(fetchedCourse.description);
        setCourseLongDescription(fetchedCourse.longDescription || '');
        setCourseImageUrl(fetchedCourse.imageUrl);
        setCourseImageHint(fetchedCourse.imageHint || '');
        setCoursePrerequisites(
          Array.isArray(fetchedCourse.prerequisites)
            ? fetchedCourse.prerequisites.join(', ')
            : ''
        );
        setCourseModules(fetchedCourse.modules ? fetchedCourse.modules.sort((a, b) => a.order - b.order) : []);

      } catch (e) {
        console.error("Error fetching course for edit:", e);
        setError('Failed to load course data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchCourseData();
    }
  }, [courseId, currentUser]);

  const handleAddModule = () => {
    if (newModuleTitle.trim() === '') {
      toast({ title: "Module Title Required", description: "Please enter a title for the new module.", variant: "destructive" });
      return;
    }
    const newModule: Module = {
      id: generateId(),
      title: newModuleTitle.trim(),
      order: courseModules.length > 0 ? Math.max(...courseModules.map(m => m.order)) + 1 : 1,
      contentBlocks: [],
      quizId: undefined,
    };
    setCourseModules(prevModules => [...prevModules, newModule].sort((a, b) => a.order - b.order));
    setNewModuleTitle('');
    toast({ title: "Module Added Locally", description: `"${newModule.title}" added. Save changes to persist.` });
  };

  const handleRemoveModule = (moduleIdToRemove: string) => {
    setCourseModules(prevModules =>
      prevModules.filter(module => module.id !== moduleIdToRemove)
        .map((module, index) => ({ ...module, order: index + 1 }))
    );
    toast({ title: "Module Removed Locally", description: "Save changes to persist this removal." });
  };

  const handleModuleTitleChange = (moduleId: string, newTitle: string) => {
    setCourseModules(prevModules =>
      prevModules.map(module =>
        module.id === moduleId ? { ...module, title: newTitle } : module
      )
    );
  };

  const handleAddContentBlock = (moduleId: string) => {
    if (newContentBlockValue.trim() === '') {
      toast({ title: "Content Value Required", description: "Please enter content/URL for the block.", variant: "destructive" });
      return;
    }
    const newBlock: ContentBlock = {
      id: generateId(),
      type: newContentBlockType,
      value: newContentBlockValue.trim(),
      order: (courseModules.find(m => m.id === moduleId)?.contentBlocks.length || 0) + 1,
      imageHint: newContentBlockType === 'image' ? newContentBlockImageHint.trim() : undefined,
    };
    setCourseModules(prevModules =>
      prevModules.map(module =>
        module.id === moduleId
          ? { ...module, contentBlocks: [...module.contentBlocks, newBlock].sort((a,b) => a.order - b.order) }
          : module
      )
    );
    setNewContentBlockValue('');
    setNewContentBlockImageHint('');
    toast({ title: "Content Block Added Locally", description: "Save changes to persist." });
  };

  const handleRemoveContentBlock = (moduleId: string, blockIdToRemove: string) => {
    setCourseModules(prevModules =>
      prevModules.map(module =>
        module.id === moduleId
          ? {
            ...module, contentBlocks: module.contentBlocks
              .filter(block => block.id !== blockIdToRemove)
              .map((block, index) => ({ ...block, order: index + 1 }))
          }
          : module
      )
    );
    toast({ title: "Content Block Removed Locally", description: "Save changes to persist." });
  };
  
  const handleLinkOrCreateQuiz = async (moduleId: string) => {
    if (!course) return;
    const module = courseModules.find(m => m.id === moduleId);
    if (!module) return;

    setIsSaving(true);
    try {
        let quizIdToLink = module.quizId;
        if (!quizIdToLink) {
            // Create a new quiz document
            quizIdToLink = generateId();
            const newQuizData: Quiz = {
                id: quizIdToLink,
                title: `Quiz for ${module.title}`,
                courseId: course.id,
                moduleId: module.id,
                questions: [
                    { id: generateId(), questionText: "Sample Question 1: What is 2+2?", options: ["3", "4", "5"], correctAnswerIndex: 1 }
                ],
            };
            await setDoc(doc(db, 'quizzes', quizIdToLink), newQuizData);
            toast({ title: "New Quiz Created", description: `Quiz for "${module.title}" created with ID: ${quizIdToLink}.` });
        }

        setCourseModules(prevModules =>
            prevModules.map(m =>
                m.id === moduleId ? { ...m, quizId: quizIdToLink } : m
            )
        );
        // Automatically save this change
        await handleSaveChanges(false); // Pass false to prevent router push for this specific save
        
        if(quizIdToLink) {
          // router.push(`/admin/quizzes/${quizIdToLink}/edit`); // TODO: Create this page
           toast({ title: "Quiz Management", description: `Quiz ID ${quizIdToLink} linked. Quiz editing page not yet implemented.`});
        }
    } catch (e: any) {
        console.error("Error linking/creating quiz:", e);
        toast({ title: "Quiz Error", description: `Failed to link/create quiz. ${e.message}`, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  const handleUnlinkQuiz = (moduleId: string) => {
     setCourseModules(prevModules =>
            prevModules.map(m =>
                m.id === moduleId ? { ...m, quizId: undefined } : m
            )
        );
     toast({ title: "Quiz Unlinked Locally", description: "Save changes to persist this." });
  };


  const handleSaveChanges = async (pushRoute: boolean = true) => {
    if (!course || !currentUser) {
      toast({ title: "Error", description: "Course data or user session missing.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const courseRef = doc(db, 'courses', course.id);
      const batch = writeBatch(db);

      const courseUpdates: Partial<Course> = {
        title: courseTitle,
        description: courseDescription,
        longDescription: courseLongDescription,
        imageUrl: courseImageUrl,
        imageHint: courseImageHint,
        prerequisites: coursePrerequisites.split(',').map(p => p.trim()).filter(p => p.length > 0),
        modules: courseModules.map((mod, index) => ({ ...mod, order: index + 1 })),
      };
      batch.update(courseRef, courseUpdates as Record<string, any>);
      
      // Note: Individual quiz documents (if newly created via handleLinkOrCreateQuiz) are already saved.
      // This save is primarily for the course document and its modules array.

      await batch.commit();
      toast({ title: "Success", description: "Course updated successfully!" });
      if (pushRoute) {
        router.push('/admin/courses');
      }
    } catch (e: any) {
      console.error("Error saving course:", e);
      toast({ title: "Error Saving", description: `Failed to save changes. ${e.message || 'Unknown error'}`, variant: "destructive" });
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
          <CardHeader><CardTitle className="text-2xl">Edit Course</CardTitle></CardHeader>
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
          <CardDescription>Modify the course details and its modules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold">Course Information</h3>
            <div><Label htmlFor="courseTitle">Title</Label><Input id="courseTitle" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} /></div>
            <div><Label htmlFor="courseDescription">Short Description</Label><Textarea id="courseDescription" value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} /></div>
            <div><Label htmlFor="courseLongDescription">Long Description</Label><Textarea id="courseLongDescription" value={courseLongDescription} onChange={(e) => setCourseLongDescription(e.target.value)} className="min-h-[100px]" /></div>
            <div><Label htmlFor="courseImageUrl">Image URL</Label><Input id="courseImageUrl" value={courseImageUrl} onChange={(e) => setCourseImageUrl(e.target.value)} /></div>
            <div><Label htmlFor="courseImageHint">Image Hint</Label><Input id="courseImageHint" value={courseImageHint} onChange={(e) => setCourseImageHint(e.target.value)} /></div>
            <div><Label htmlFor="coursePrerequisites">Prerequisites (comma-separated)</Label><Input id="coursePrerequisites" value={coursePrerequisites} onChange={(e) => setCoursePrerequisites(e.target.value)} /></div>
          </div>

          <Separator />

          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold">Modules ({courseModules.length})</h3>
            <Accordion type="multiple" className="w-full">
              {courseModules.map((mod) => (
                <AccordionItem value={`module-${mod.id}`} key={mod.id}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full pr-4">
                       <div className="flex items-center">
                        <GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />
                        Module {mod.order}: <Input value={mod.title} onChange={(e) => handleModuleTitleChange(mod.id, e.target.value)} className="ml-2 flex-grow min-w-[200px]" onClick={(e) => e.stopPropagation()} />
                       </div>
                       <Button variant="destructive" size="icon" onClick={(e) => {e.stopPropagation(); handleRemoveModule(mod.id);}} aria-label={`Remove module ${mod.title}`} className="ml-2 p-1 h-7 w-7">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-6 pr-2 py-4 bg-muted/20 rounded-b-md">
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold">Content Blocks ({mod.contentBlocks.length})</h4>
                      {mod.contentBlocks.length > 0 && (
                        <ul className="space-y-2">
                          {mod.contentBlocks.map(block => (
                            <li key={block.id} className="flex items-center gap-2 p-2 border rounded-md bg-background">
                              <span className="text-xs text-muted-foreground p-1 bg-muted rounded-sm">#{block.order} {block.type}</span>
                              <Input value={block.value} readOnly className="flex-grow text-xs" title={block.value}/>
                              {block.type === 'image' && block.imageHint && <span className="text-xs text-muted-foreground italic">Hint: {block.imageHint}</span>}
                              <Button variant="outline" size="icon" onClick={() => handleRemoveContentBlock(mod.id, block.id)} className="p-1 h-6 w-6"><Trash2 className="h-3 w-3" /></Button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="p-3 border rounded-md space-y-3 mt-2">
                        <h5 className="text-sm font-semibold">Add New Content Block</h5>
                        <Select value={newContentBlockType} onValueChange={(value) => setNewContentBlockType(value as 'text' | 'image' | 'video')}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="image">Image URL</SelectItem>
                            <SelectItem value="video">Video URL</SelectItem>
                          </SelectContent>
                        </Select>
                        {newContentBlockType === 'text' ? (
                           <Textarea placeholder="Enter text content..." value={newContentBlockValue} onChange={(e) => setNewContentBlockValue(e.target.value)} />
                        ) : (
                           <Input placeholder="Enter URL..." value={newContentBlockValue} onChange={(e) => setNewContentBlockValue(e.target.value)} />
                        )}
                        {newContentBlockType === 'image' && (
                          <Input placeholder="Image AI hint (optional)" value={newContentBlockImageHint} onChange={(e) => setNewContentBlockImageHint(e.target.value)} />
                        )}
                        <Button onClick={() => handleAddContentBlock(mod.id)} size="sm">Add Block</Button>
                      </div>
                    </div>
                    <Separator className="my-4"/>
                     <div className="space-y-2">
                        <h4 className="text-md font-semibold">Quiz</h4>
                        {mod.quizId ? (
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">Linked Quiz ID: {mod.quizId}</p>
                                <Button variant="outline" size="sm" onClick={() => toast({title: "Quiz Editing", description: "Quiz editing page not yet implemented. Please manage quiz questions directly in Firestore for now."})} >Edit Quiz</Button>
                                <Button variant="link" size="sm" onClick={() => handleUnlinkQuiz(mod.id)}>Unlink Quiz</Button>
                            </div>
                        ) : (
                            <Button onClick={() => handleLinkOrCreateQuiz(mod.id)} size="sm" disabled={isSaving}>
                                {isSaving && module.id === courseModules.find(m => m.quizId === undefined)?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                Create & Link Quiz
                            </Button>
                        )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="flex items-center gap-2 pt-2 mt-4 border-t">
              <Input
                placeholder="New module title"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleAddModule} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Module
              </Button>
            </div>
            {courseModules.length === 0 && <p className="text-sm text-muted-foreground">No modules added yet. Add one above.</p>}
          </div>

          <div className="flex justify-end pt-6">
            <Button onClick={() => handleSaveChanges()} disabled={isSaving}>
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
