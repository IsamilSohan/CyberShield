
export interface User {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[]; // Array of course IDs
  certificates: Certificate[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  imageHint?: string;
  modules: Module[];
  prerequisites?: string[];
}

export interface Module {
  id: string;
  title: string;
  videoUrl: string;
  transcript: string;
  duration: string; // e.g., "15 min"
}

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export interface Assessment {
  id: string;
  moduleId: string;
  questions: AssessmentQuestion[];
}

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  userName: string;
  issueDate: string; // ISO date string
  certificateUrl?: string; // Optional URL to a PDF or image
}
