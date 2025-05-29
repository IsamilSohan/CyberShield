
"use client";

import Link from 'next/link';
import { ArrowLeft, Edit3, Save, Loader2, AlertTriangle, PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Course, Module } from '@/lib/types';
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
        const fetchedCourse = { id: courseSnap.id, ...fetchedCourseData } as Course;
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
        setCourseModules(fetchedCourse.modules || []);

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
      order: courseModules.length + 1, // Simple ordering
    };
    setCourseModules(prevModules => [...prevModules, newModule]);
    setNewModuleTitle(''); // Clear input
    toast({ title: "Module Added Locally", description: `"${newModule.title}" added. Save changes to persist.`});
  };

  const handleRemoveModule = (moduleIdToRemove: string) => {
    setCourseModules(prevModules =>
      prevModules.filter(module => module.id !== moduleIdToRemove)
                   .map((module, index) => ({ ...module, order: index + 1 })) // Re-order
    );
    toast({ title: "Module Removed Locally", description: "Save changes to persist this removal."});
  };

  const handleModuleTitleChange = (moduleId: string, newTitle: string) => {
    setCourseModules(prevModules =>
      prevModules.map(module =>
        module.id === moduleId ? { ...module, title: newTitle } : module
      )
    );
  };


  const handleSaveChanges = async () => {
    if (!course || !currentUser) {
      toast({ title: "Error", description: "Course data or user session missing.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const courseRef = doc(db, 'courses', course.id);

      const courseUpdates: Partial<Course> = {
        title: courseTitle,
        description: courseDescription,
        longDescription: courseLongDescription,
        imageUrl: courseImageUrl,
        imageHint: courseImageHint,
        prerequisites: coursePrerequisites.split(',').map(p => p.trim()).filter(p => p.length > 0),
        modules: courseModules.map((mod, index) => ({...mod, order: index + 1})), // Ensure order is sequential
      };

      await updateDoc(courseRef, courseUpdates as Record<string, any>); // Use Record for broader compatibility
      toast({ title: "Success", description: "Course updated successfully!" });
      router.push('/admin/courses');
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
            {courseModules.length > 0 && (
              <ul className="space-y-3">
                {courseModules.map((mod, index) => (
                  <li key={mod.id} className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
                    <span className="font-medium text-sm mr-2">#{mod.order}</span>
                    <Input 
                        value={mod.title} 
                        onChange={(e) => handleModuleTitleChange(mod.id, e.target.value)} 
                        className="flex-grow"
                        placeholder="Module Title"
                    />
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveModule(mod.id)} aria-label={`Remove module ${mod.title}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-2 pt-2">
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
