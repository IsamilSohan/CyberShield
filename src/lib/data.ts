import type { Course, User, Certificate, Module, Assessment, AssessmentQuestion } from './types';

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

const sampleModules: Module[] = [
  { id: 'module-1', title: 'Understanding Cyber Threats', videoUrl: 'https://www.example.com/video1.mp4', transcript: 'This is a transcript for understanding cyber threats... In this module, we will cover various types of cyber attacks such as phishing, malware, and ransomware. We will also discuss the motivations behind these attacks and common vulnerabilities exploited by attackers.', duration: '22 min' },
  { id: 'module-2', title: 'Network Security Basics', videoUrl: 'https://www.example.com/video2.mp4', transcript: 'This is a transcript for network security basics... This module explores fundamental concepts of network security, including firewalls, intrusion detection systems (IDS), and virtual private networks (VPNs). We will learn how to configure basic network defenses and monitor for suspicious activity.', duration: '28 min' },
  { id: 'module-3', title: 'Cryptography Fundamentals', videoUrl: 'https://www.example.com/video3.mp4', transcript: 'This is a transcript for cryptography fundamentals... Learn about encryption, decryption, hashing, and digital signatures. This module explains symmetric and asymmetric cryptography, and their applications in securing data at rest and in transit.', duration: '35 min' },
];

export const placeholderCourses: Course[] = [
  {
    id: 'cybersec-101',
    title: 'Cybersecurity Fundamentals',
    description: 'Learn the basics of cybersecurity and protect yourself online.',
    longDescription: 'This comprehensive course covers the foundational principles of cybersecurity. You will learn about common threats, vulnerabilities, and risk management strategies. Perfect for beginners looking to start a career in cybersecurity or individuals wanting to enhance their digital safety.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'cyber security',
    modules: sampleModules.slice(0,2),
    prerequisites: ['Basic computer literacy'],
  },
  {
    id: 'net-defense-201',
    title: 'Network Defense Strategies',
    description: 'Advanced techniques for securing networks against intrusions.',
    longDescription: 'Dive deep into network defense mechanisms. This course explores advanced firewall configurations, intrusion prevention systems (IPS), network segmentation, and security information and event management (SIEM) tools. Hands-on labs will provide practical experience in building resilient network architectures.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'network server',
    modules: sampleModules,
    prerequisites: ['Cybersecurity Fundamentals', 'Basic Networking Knowledge'],
  },
  {
    id: 'ethical-hacking-301',
    title: 'Ethical Hacking & Penetration Testing',
    description: 'Discover vulnerabilities and secure systems like a pro.',
    longDescription: 'Learn the methodologies and tools used by ethical hackers to identify and exploit vulnerabilities in systems and networks. This course covers reconnaissance, scanning, exploitation, post-exploitation, and reporting. Emphasis is placed on ethical considerations and legal frameworks.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'code programming',
    modules: sampleModules.map(m => ({...m, id: `eh-${m.id}`})),
    prerequisites: ['Network Defense Strategies', 'Understanding of Operating Systems'],
  },
];

export const getCourseById = (id: string): Course | undefined => {
  return placeholderCourses.find(course => course.id === id);
};

export const getModuleById = (courseId: string, moduleId: string): Module | undefined => {
  const course = getCourseById(courseId);
  return course?.modules.find(module => module.id === moduleId);
};

const sampleAssessmentQuestions: AssessmentQuestion[] = [
  { id: 'q1', questionText: 'What is phishing?', options: [{id: 'opt1', text:'A type of malware'}, {id: 'opt2', text:'A social engineering attack'}, {id: 'opt3', text:'A network intrusion method'}], correctOptionId: 'opt2' },
  { id: 'q2', questionText: 'Which of these is a strong password?', options: [{id: 'opt1', text:'password123'}, {id: 'opt2', text:'MyP@$$wOrd!23'}, {id: 'opt3', text:'admin'}], correctOptionId: 'opt2' },
];

export const getAssessmentByModuleId = (moduleId: string): Assessment | undefined => {
  // In a real app, assessments would be unique per module
  if (sampleModules.find(m => m.id === moduleId)) {
    return {
      id: `assess-${moduleId}`,
      moduleId: moduleId,
      questions: sampleAssessmentQuestions
    };
  }
  return undefined;
};

export const getCertificateForCourse = (courseId: string, userId: string): Certificate | undefined => {
  const user = placeholderUser; // Assuming single user for now
  const course = getCourseById(courseId);
  if (user.id === userId && course && user.enrolledCourses.includes(courseId)) {
    // Check if user actually completed the course (mocked here)
    const existingCert = user.certificates.find(c => c.courseId === courseId);
    if (existingCert) return existingCert;

    return {
      id: `cert-${courseId}-${userId}`,
      courseId: courseId,
      courseName: course.title,
      userName: user.name,
      issueDate: new Date().toISOString(),
      certificateUrl: `https://placehold.co/800x600.png` // Placeholder cert image
    };
  }
  return undefined;
};
