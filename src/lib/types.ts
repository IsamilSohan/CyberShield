
import { z } from 'zod';

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

// Schema for validating new course data from the form
export const NewCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  longDescription: z.string().optional(),
  // imageUrl can be a valid URL or an empty string. It's optional in the sense that if not provided, it's fine.
  // The form will provide an empty string by default if not filled.
  imageUrl: z.string().url({ message: "Image URL must be a valid URL if provided." }).or(z.literal('')).optional(),
  imageHint: z.string().optional(),
  prerequisites: z.string().optional(), // Will be comma-separated string
});

export type NewCourseInput = z.infer<typeof NewCourseSchema>;
