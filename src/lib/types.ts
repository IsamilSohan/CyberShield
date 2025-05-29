
import { z } from 'zod';

export interface User {
  id: string; 
  name: string;
  email: string;
  isAdmin?: boolean; // Added isAdmin field
  enrolledCourses: string[]; 
  certificates: Certificate[];
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[]; 
  correctOptionIndex: number; 
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string; 
  questions: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  imageHint?: string;
  videoUrl?: string; 
  prerequisites?: string[];
  quizId: string; 
}

export interface Certificate {
  id: string; 
  courseId: string;
  courseTitle: string; 
  userId: string;
  userName: string;
  issueDate: string; 
  certificateUrl?: string; 
}

export const NewCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  longDescription: z.string().optional(),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL if provided." }).or(z.literal('')).optional(),
  imageHint: z.string().max(30, "Image hint should be concise (max 30 chars).").optional(),
  videoUrl: z.string().url({ message: "Video URL must be a valid URL if provided." }).or(z.literal('')).optional(),
  prerequisites: z.string().optional(), 
});

export type NewCourseInput = z.infer<typeof NewCourseSchema>;

    