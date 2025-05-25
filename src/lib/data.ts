
// This file is becoming less relevant as data moves to Firestore.
// We'll keep placeholderUser and placeholderCourses for now if any part of the app
// still uses them as fallbacks or for generating static paths for non-dynamic content.

import type { Course, User, Certificate, Quiz, QuizQuestion } from './types';

export const placeholderUser: User = {
  id: 'user123',
  name: 'Alex Shield',
  email: 'alex.shield@example.com',
  enrolledCourses: ['cybersec-101', 'net-defense-201'],
  certificates: [
    {
      id: 'cert-001-user123-cybersec-101',
      courseId: 'cybersec-101',
      courseTitle: 'Cybersecurity Fundamentals',
      userId: 'user123',
      userName: 'Alex Shield',
      issueDate: new Date('2023-05-15').toISOString(),
      certificateUrl: 'https://placehold.co/800x600.png?text=Certificate+Fundamentals'
    }
  ],
};

export const placeholderCourses: Course[] = [
  {
    id: 'cybersec-101',
    title: 'Cybersecurity Fundamentals',
    description: 'Learn the basics of cybersecurity and protect yourself online.',
    longDescription: 'This comprehensive course covers the foundational principles of cybersecurity...',
    imageUrl: 'https://placehold.co/600x400.png?text=CyberSec+Fundamentals',
    imageHint: 'cyber security',
    videoUrl: 'https://www.example.com/video_fundamentals.mp4', // Example video
    prerequisites: ['Basic computer literacy'],
    quizId: 'quiz-cybersec-101-placeholder', // Placeholder quizId
  },
  {
    id: 'net-defense-201',
    title: 'Network Defense Strategies',
    description: 'Advanced techniques for securing networks against intrusions.',
    longDescription: 'Dive deep into network defense mechanisms...',
    imageUrl: 'https://placehold.co/600x400.png?text=Network+Defense',
    imageHint: 'network server',
    videoUrl: 'https://www.example.com/video_network_defense.mp4', // Example video
    prerequisites: ['Cybersecurity Fundamentals', 'Basic Networking Knowledge'],
    quizId: 'quiz-net-defense-201-placeholder', // Placeholder quizId
  },
];

// This function might still be used by other mock data dependent components or pages.
// For actual course data, the app should fetch from Firestore.
export const getCourseById = (id: string): Course | undefined => {
  return placeholderCourses.find(course => course.id === id);
};


// The getAssessmentByCourseId function is no longer suitable as assessments (quizzes)
// are now directly in Firestore. The AssessmentPage will fetch the course,
// then its quizId, then the quiz data from the 'quizzes' collection.
// We can remove this function or leave it commented if no other part relies on it for mock data.
/*
const sampleAssessmentQuestions: AssessmentQuestion[] = [
  { id: 'q1', questionText: 'What is phishing?', options: [{id: 'opt1', text:'A type of malware'}, {id: 'opt2', text:'A social engineering attack'}, {id: 'opt3', text:'A network intrusion method'}], correctOptionId: 'opt2' },
  { id: 'q2', questionText: 'Which of these is a strong password?', options: [{id: 'opt1', text:'password123'}, {id: 'opt2', text:'MyP@$$wOrd!23'}, {id: 'opt3', text:'admin'}], correctOptionId: 'opt2' },
];

export const getAssessmentByCourseId = (courseId: string): Assessment | undefined => {
  const course = placeholderCourses.find(c => c.id === courseId);
  if (course) {
    return {
      id: `assess-${courseId}`, // This was for a generic Assessment type
      courseId: courseId,
      questions: sampleAssessmentQuestions 
    };
  }
  return undefined;
};
*/

// getCertificateForCourse is also less relevant if certificate data is primarily managed
// within the user's document in Firestore. The certificate page will fetch this directly.
/*
export const getCertificateForCourse = (courseId: string, userId: string): Certificate | undefined => {
  const user = placeholderUsers.find(u => u.id === userId); // placeholderUsers needs to be defined or imported
  const course = getCourseById(courseId); 
  
  if (user && course && user.enrolledCourses.includes(courseId)) {
    const existingCert = user.certificates.find(c => c.courseId === courseId);
    if (existingCert) return existingCert;

    return {
      id: `cert-${courseId}-${userId}`,
      courseId: courseId,
      courseName: course.title, 
      userName: user.name,
      issueDate: new Date().toISOString(),
      certificateUrl: `https://placehold.co/800x600.png`
    };
  }
  return undefined;
};
*/

// Removed sampleModules as Course type no longer uses them.
// Removed placeholderUsers as user data is now in Firestore.
