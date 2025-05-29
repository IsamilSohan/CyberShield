
import { z } from 'zod';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  enrolledCourses: string[]; // Array of course IDs
  certificates: Certificate[];
}

export interface ContentBlock {
  id: string; 
  type: 'text' | 'image' | 'video';
  value: string; 
  order: number;
  imageHint?: string; 
}

export interface Module {
  id: string; 
  title: string;
  order: number; 
  contentBlocks: ContentBlock[];
  quizId?: string; 
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  imageHint?: string;
  prerequisites?: string[];
  modules: Module[];
  // quizId is now per module
}

export interface QuizQuestion {
  id: string; 
  questionText: string;
  options: string[]; 
  correctAnswerIndex: number; 
  explanation?: string; // Optional explanation for the answer
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string; 
  moduleId?: string; // To link quiz to a specific module if needed
  questions: QuizQuestion[];
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
  imageHint: z.string().max(50, "Image hint should be concise (max 50 chars).").optional(),
  prerequisites: z.string().optional(),
});
export type NewCourseInput = z.infer<typeof NewCourseSchema>;

export interface BlogPost {
  id: string;
  title: string; 
  subHeader?: string; 
  content: string; 
  imageUrl: string; 
  imageHint?: string; 
  createdAt: string; 
  updatedAt: string; 
}

export const NewBlogPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(200, "Title must be 200 characters or less."),
  subHeader: z.string().max(300, "Sub-header must be 300 characters or less.").optional(),
  content: z.string().min(50, "Content must be at least 50 characters."),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL." }).or(z.literal('')).optional(),
  imageHint: z.string().max(50, "Image hint should be concise (max 50 chars).").optional(),
});
export type NewBlogPostInput = z.infer<typeof NewBlogPostSchema>;

// --- Course Review Types ---
export const NewReviewSchema = z.object({
  rating: z.number().min(1, "Rating must be between 1 and 5.").max(5, "Rating must be between 1 and 5."),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(1000, "Comment must be 1000 characters or less."),
  courseId: z.string(),
  userId: z.string(),
  // userName will be fetched server-side based on userId
});
export type NewReviewInput = z.infer<typeof NewReviewSchema>;

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string; // To display who wrote the review
  rating: number; // e.g., 1-5
  comment: string;
  createdAt: string; // ISO date string
}
