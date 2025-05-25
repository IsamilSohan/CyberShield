
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation'; // useParams added
import { CertificateDisplay } from '@/components/certificate/CertificateDisplay';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Certificate, Course, User } from '@/lib/types'; // User type added
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Helper component to use useSearchParams
function CertificateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ courseId: string }>(); // Get courseId from route

  const courseIdFromRoute = params.courseId;
  const certificateIdFromQuery = searchParams.get('certId');


  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null); // Can be null if not found
  const [course, setCourse] = useState<Course | null>(null); // Can be null
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        if (!courseIdFromRoute) {
            toast({ title: "Error", description: "Course ID missing.", variant: "destructive" });
            setIsLoadingPage(false);
            return;
        }

        try {
          // 1. Fetch Course Details (mainly for title to display on "Back to Course" link)
          const courseRef = doc(db, "courses", courseIdFromRoute);
          const courseSnap = await getDoc(courseRef);
          if (courseSnap.exists()) {
            setCourse({ id: courseSnap.id, ...courseSnap.data() } as Course);
          } else {
            // Even if course details for link fail, try to load certificate
            console.warn("Course details not found for certificate page link.");
          }

          // 2. Fetch User Data to find the specific certificate
          if (certificateIdFromQuery) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data() as User;
              const foundCertificate = userData.certificates?.find(c => c.id === certificateIdFromQuery && c.courseId === courseIdFromRoute);
              if (foundCertificate) {
                setCertificate(foundCertificate);
              } else {
                setCertificate(null);
                 toast({ title: "Not Found", description: "Certificate not found or does not match this course.", variant: "default" });
              }
            } else {
              setCertificate(null);
              toast({ title: "Error", description: "User data not found.", variant: "destructive" });
            }
          } else {
            setCertificate(null);
            // Potentially show a list of user's certificates for this course if no certId, or a default one.
            // For now, if no certId, assume no specific certificate to show.
             toast({ title: "Information", description: "No specific certificate ID provided in URL.", variant: "default" });
          }

        } catch (error) {
          console.error("Error fetching certificate/course data:", error);
          toast({ title: "Error", description: "Could not load certificate details.", variant: "destructive" });
          setCertificate(null);
        } finally {
          setIsLoadingPage(false);
        }
      } else {
        // If user logs out or session expires while on this page
        router.push(`/auth/login?redirect=/courses/${courseIdFromRoute}/certificate${certificateIdFromQuery ? `?certId=${certificateIdFromQuery}` : ''}`);
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, courseIdFromRoute, certificateIdFromQuery]); // Added toast to dependencies

  // Temporary toast placeholder if useToast is not set up in this component yet.
  const toast = (options: {title: string, description: string, variant: string}) => {
    console.log(`Toast: ${options.title} - ${options.description} (${options.variant})`);
    // If you have a global toast context, use it here.
  };


  if (isLoadingPage) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading certificate...</p>
      </div>
    );
  }
  
  if (!currentUser) return null; 

  if (!certificate) {
    return (
      <div className="space-y-6 text-center">
        <Link href={`/courses/${courseIdFromRoute}`} className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {course?.title || 'Course'}
        </Link>
        <p className="text-muted-foreground bg-muted p-4 rounded-md">Certificate not found, not yet earned, or you navigated here without a specific certificate ID.</p>
         <Button onClick={() => router.push(`/courses/${courseIdFromRoute}/assessment`)}>Attempt Quiz</Button>
      </div>
    );
  }
  
  if (!course && certificate) {
     // Still show certificate if course details failed to load for the link
     console.warn("Displaying certificate, but course details for back link might be missing.");
  }


  return (
    <div className="space-y-8">
      <Link href={`/courses/${courseIdFromRoute}`} className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {certificate.courseTitle || 'Course'}
      </Link>
      <CertificateDisplay certificate={certificate} />
    </div>
  );
}


export default function CertificatePage() {
  // Suspense is required because CertificateContent uses useSearchParams
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Loading...</p></div>}>
      <CertificateContent />
    </Suspense>
  );
}
