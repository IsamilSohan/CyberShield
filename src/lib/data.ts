
import type { Course, User, Certificate, Module } from './types'; // Module added

export const placeholderUser: User = {
  id: 'user123',
  name: 'Alex Shield',
  email: 'alex.shield@example.com',
  isAdmin: false,
  enrolledCourses: ['cybersec-101', 'net-defense-201'],
  certificates: [
    {
      id: 'cert-001-user123-cybersec-101',
      courseId: 'cybersec-101',
      courseTitle: 'Cybersecurity Fundamentals', // Renamed from courseName
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
    prerequisites: ['Basic computer literacy'],
    modules: [
        { id: 'm101-1', title: 'Introduction to Cybersecurity', order: 1 },
        { id: 'm101-2', title: 'Common Threats', order: 2 },
    ],
    // videoUrl: 'https://www.example.com/video_fundamentals.mp4', // Removed
    // quizId: 'quiz-cybersec-101-placeholder', // Removed
  },
  {
    id: 'net-defense-201',
    title: 'Network Defense Strategies',
    description: 'Advanced techniques for securing networks against intrusions.',
    longDescription: 'Dive deep into network defense mechanisms...',
    imageUrl: 'https://placehold.co/600x400.png?text=Network+Defense',
    imageHint: 'network server',
    prerequisites: ['Cybersecurity Fundamentals', 'Basic Networking Knowledge'],
    modules: [
        { id: 'm201-1', title: 'Firewalls and IDS/IPS', order: 1 },
        { id: 'm201-2', title: 'Secure Network Design', order: 2 },
        { id: 'm201-3', title: 'Incident Response', order: 3 },
    ],
    // videoUrl: 'https://www.example.com/video_network_defense.mp4', // Removed
    // quizId: 'quiz-net-defense-201-placeholder', // Removed
  },
];

export const getCourseById = (id: string): Course | undefined => {
  return placeholderCourses.find(course => course.id === id);
};

// Old getAssessmentByCourseId and related functions are removed as quiz structure has changed.
// They will be re-implemented at the module level if needed for mock data.
