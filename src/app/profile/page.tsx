import { placeholderUser, getCourseById } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ListChecks, Award, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default async function ProfilePage() {
  // In a real app, fetch user data based on authenticated session
  const user = placeholderUser;

  if (!user) {
    return <p>User not found. Please log in.</p>; // Or redirect to login
  }

  const enrolledCoursesDetails = user.enrolledCourses
    .map(courseId => getCourseById(courseId))
    .filter(course => course !== undefined);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6 p-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={`https://placehold.co/100x100.png`} alt={user.name} data-ai-hint="profile person" />
            <AvatarFallback>
              <UserCircle2 className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl">{user.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">{user.email}</CardDescription>
            <Button variant="outline" size="sm" className="mt-4">Edit Profile</Button>
          </div>
        </CardHeader>
      </Card>

      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <ListChecks className="mr-2 h-6 w-6 text-primary" />
          Enrolled Courses
        </h2>
        {enrolledCoursesDetails.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCoursesDetails.map(course => course && (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                   <Image src={course.imageUrl} alt={course.title} width={300} height={150} className="rounded-md mb-2 w-full h-auto object-cover" data-ai-hint={course.imageHint || "technology"} />
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link href={`/courses/${course.id}`}>Go to Course</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">You are not enrolled in any courses yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Award className="mr-2 h-6 w-6 text-primary" />
          My Certificates
        </h2>
        {user.certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.certificates.map(cert => (
              <Card key={cert.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{cert.courseName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Issued on: {new Date(cert.issueDate).toLocaleDateString()}</p>
                  {cert.certificateUrl && (
                    <Link href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
                       <Image src={cert.certificateUrl} alt={`${cert.courseName} Certificate`} width={300} height={200} className="rounded-md w-full h-auto object-cover" data-ai-hint="certificate document" />
                    </Link>
                  )}
                   <Button asChild variant="default" className="mt-4 w-full sm:w-auto">
                    <Link href={`/courses/${cert.courseId}/certificate`}>View Certificate</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">You have not earned any certificates yet.</p>
        )}
      </section>
    </div>
  );
}
