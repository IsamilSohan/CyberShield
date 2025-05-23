
import type { Course, User, Certificate, Assessment, AssessmentQuestion } from './types'; // Removed Module

export const placeholderUser: User = {
  id: 'user123',
  name: 'Alex Shield',
  email: 'alex.shield@example.com',
  enrolledCourses: ['cybersec-101', 'net-defense-201'],
  certificates: [
    {
      id: 'cert-001',
      courseId: 'intro-infosec',
      courseName: 'Introduction to Information Security',
      userName: 'Alex Shield',
      issueDate: new Date('2023-05-15').toISOString(),
      certificateUrl: '/placeholders/certificate.png'
    }
  ],
};

export const placeholderUsers: User[] = [
  placeholderUser,
  {
    id: 'user456',
    name: 'Jamie Coder',
    email: 'jamie.coder@example.com',
    enrolledCourses: ['net-defense-201', 'ethical-hacking-301'],
    certificates: [
      {
        id: 'cert-002',
        courseId: 'net-defense-201',
        courseName: 'Network Defense Strategies',
        userName: 'Jamie Coder',
        issueDate: new Date('2023-10-20').toISOString(),
        certificateUrl: 'https://placehold.co/800x600.png'
      }
    ],
  },
  {
    id: 'user789',
    name: 'Casey Learner',
    email: 'casey.learner@example.com',
    enrolledCourses: ['cybersec-101'],
    certificates: [],
  }
];

// sampleModules removed as modules are no longer part of the Course type directly

export const placeholderCourses: Course[] = [
  {
    id: 'cybersec-101',
    title: 'Cybersecurity Fundamentals',
    description: 'Learn the basics of cybersecurity and protect yourself online.',
    longDescription: 'This comprehensive course covers the foundational principles of cybersecurity. You will learn about common threats, vulnerabilities, and risk management strategies. Perfect for beginners looking to start a career in cybersecurity or individuals wanting to enhance their digital safety.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'cyber security',
    videoUrl: 'https://www.example.com/video_fundamentals.mp4',
    prerequisites: ['Basic computer literacy'],
    quizId: 'quiz-cybersec-101',
  },
  {
    id: 'net-defense-201',
    title: 'Network Defense Strategies',
    description: 'Advanced techniques for securing networks against intrusions.',
    longDescription: 'Dive deep into network defense mechanisms. This course explores advanced firewall configurations, intrusion prevention systems (IPS), network segmentation, and security information and event management (SIEM) tools. Hands-on labs will provide practical experience in building resilient network architectures.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'network server',
    videoUrl: 'https://www.example.com/video_network_defense.mp4',
    prerequisites: ['Cybersecurity Fundamentals', 'Basic Networking Knowledge'],
    quizId: 'quiz-net-defense-201',
  },
  {
    id: 'ethical-hacking-301',
    title: 'Ethical Hacking & Penetration Testing',
    description: 'Discover vulnerabilities and secure systems like a pro.',
    longDescription: 'Learn the methodologies and tools used by ethical hackers to identify and exploit vulnerabilities in systems and networks. This course covers reconnaissance, scanning, exploitation, post-exploitation, and reporting. Emphasis is placed on ethical considerations and legal frameworks.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'code programming',
    videoUrl: 'https://www.example.com/video_ethical_hacking.mp4',
    prerequisites: ['Network Defense Strategies', 'Understanding of Operating Systems'],
    quizId: 'quiz-ethical-hacking-301',
  },
];

export const getCourseById = (id: string): Course | undefined => {
  // This function will still work with the updated placeholderCourses.
  // However, actual course data will now primarily come from Firestore.
  return placeholderCourses.find(course => course.id === id);
};

// getModuleById is no longer needed as modules are removed from course structure

const sampleAssessmentQuestions: AssessmentQuestion[] = [
  { id: 'q1', questionText: 'What is phishing?', options: [{id: 'opt1', text:'A type of malware'}, {id: 'opt2', text:'A social engineering attack'}, {id: 'opt3', text:'A network intrusion method'}], correctOptionId: 'opt2' },
  { id: 'q2', questionText: 'Which of these is a strong password?', options: [{id: 'opt1', text:'password123'}, {id: 'opt2', text:'MyP@$$wOrd!23'}, {id: 'opt3', text:'admin'}], correctOptionId: 'opt2' },
];

// Updated to link assessment to courseId directly
export const getAssessmentByCourseId = (courseId: string): Assessment | undefined => {
  // In a real app, assessments would be unique per course and fetched from DB
  // For demo, we return a generic assessment if the courseId exists in placeholders
  const course = placeholderCourses.find(c => c.id === courseId);
  if (course) {
    return {
      id: `assess-${courseId}`,
      courseId: courseId,
      questions: sampleAssessmentQuestions // Using generic questions for now
    };
  }
  return undefined;
};


export const getCertificateForCourse = (courseId: string, userId: string): Certificate | undefined => {
  const user = placeholderUsers.find(u => u.id === userId);
  const course = getCourseById(courseId); // This might still use mock data for course title
  
  if (user && course && user.enrolledCourses.includes(courseId)) {
    const existingCert = user.certificates.find(c => c.courseId === courseId);
    if (existingCert) return existingCert;

    // Simulating earning a certificate if enrolled
    return {
      id: `cert-${courseId}-${userId}`,
      courseId: courseId,
      courseName: course.title, // Course title from mock data
      userName: user.name,
      issueDate: new Date().toISOString(),
      certificateUrl: `https://placehold.co/800x600.png`
    };
  }
  return undefined;
};

// It's advisable to remove getAssessmentByModuleId if it's no longer used elsewhere.
// For now, I'm leaving it commented out in case it was a typo and you meant to update getAssessmentByCourseId.
// export const getAssessmentByModuleId = (moduleId: string): Assessment | undefined => {
//   // ... (old implementation)
// };
