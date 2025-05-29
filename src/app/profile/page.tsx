
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ListChecks, Award, UserCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { User as AppUser, Course, Certificate } from '@/lib/types';
import { getCourseById } from '@/lib/data'; // Keep for placeholder courses/certs for now

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setAppUser({ id: userSnap.id, ...userSnap.data() } as AppUser);
          } else {
            // User authenticated but no Firestore doc found, could redirect or show error
            console.warn("User document not found in Firestore for UID:", user.uid);
            setAppUser(null); // Or handle as an error state
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setAppUser(null); // Or handle as an error state
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push('/auth/login?redirect=/profile');
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  if (!currentUser || !appUser) {
    // This case could be if Firebase auth is okay but Firestore doc is missing or error
    return (
      <div className="space-y-6 text-center">
          <p className="text-muted-foreground bg-muted p-4 rounded-md">User data not found. Please try logging in again or contact support.</p>
          <Button onClick={() => router.push('/auth/login')}>Login</Button>
      </div>
    );
  }

  // For now, enrolled courses and certificates will continue to use placeholder logic
  // but using the dynamically fetched appUser's IDs if available.
  // This needs further refactoring to fetch course/cert details based on the appUser's actual data.
  const enrolledCoursesDetails = (appUser.enrolledCourses || [])
    .map(courseId => getCourseById(courseId)) // getCourseById still uses placeholderCourses
    .filter(course => course !== undefined);

  const userCertificates = appUser.certificates || [];

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6 p-6">
          <Avatar className="h-24 w-24">
            {/* In a real app, you'd store avatarUrl in the user document */}
            <AvatarImage src={`https://placehold.co/100x100.png`} alt={appUser.name} data-ai-hint="profile person" />
            <AvatarFallback>
              <UserCircle2 className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-3xl">{appUser.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">{appUser.email}</CardDescription>
            {/* TODO: Implement Edit Profile functionality */}
            <Button variant="outline" size="sm" className="mt-4" disabled>Edit Profile</Button>
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
        {userCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userCertificates.map(cert => ( // Uses appUser.certificates
              <Card key={cert.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{cert.courseTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Issued on: {new Date(cert.issueDate).toLocaleDateString()}</p>
                  {cert.certificateUrl && (
                    <Link href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
                       <Image src={cert.certificateUrl} alt={`${cert.courseTitle} Certificate`} width={300} height={200} className="rounded-md w-full h-auto object-cover" data-ai-hint="certificate document" />
                    </Link>
                  )}
                   <Button asChild variant="default" className="mt-4 w-full sm:w-auto">
                    {/* Link to certificate display page, assuming certId is part of the user's cert object */}
                    <Link href={`/courses/${cert.courseId}/certificate?certId=${cert.id}`}>View Certificate</Link>
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
