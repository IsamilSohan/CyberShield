
import Link from 'next/link';
import { ArrowLeft, BookOpen, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { placeholderCourses } from '@/lib/data';

export default function AdminCoursesPage() {
  const courses = placeholderCourses;

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center text-primary hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin Dashboard
      </Link>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <BookOpen className="mr-3 h-6 w-6 text-primary" />
            Course Management
          </CardTitle>
          <CardDescription>View and manage application courses.</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-center">Modules</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium truncate max-w-xs">{course.id}</TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell className="text-center">{course.modules.length}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" aria-label={`Edit course ${course.title}`}>
                           <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" aria-label={`Delete course ${course.title}`}>
                           <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No courses found.</p>
          )}
           <div className="mt-6 text-right">
            <Button>Add New Course</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
