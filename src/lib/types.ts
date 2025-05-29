
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
  id: string; // Unique ID for the content block
  type: 'text' | 'image' | 'video';
  value: string; // For text: the actual text. For image/video: the URL.
  order: number;
  imageHint?: string; // Optional hint for AI if type is image
}

export interface Module {
  id: string; // Unique identifier for the module
  title: string;
  order: number; // For sequencing within the course
  contentBlocks: ContentBlock[];
  quizId?: string; // Optional: ID of the quiz associated with this module
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
}

export interface QuizQuestion {
  id: string; // Unique ID for the question
  questionText: string;
  options: string[]; // Array of answer options
  correctAnswerIndex: number; // Index of the correct answer in the options array
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  moduleId?: string;
  questions: QuizQuestion[];
}

export interface Certificate {
  id: string; // Unique certificate ID
  courseId: string;
  courseTitle: string;
  userId: string;
  userName: string;
  issueDate: string; // ISO date string
  certificateUrl?: string; // Optional URL to a visual certificate image/pdf
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


// --- Blog Post Types ---
export interface BlogPost {
  id: string;
  title: string; // Header
  subHeader?: string; // Optional sub-header
  content: string; // Main content (can be markdown or HTML string)
  imageUrl: string; // Main picture URL
  imageHint?: string; // Optional AI hint for the main picture
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export const NewBlogPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(200, "Title must be 200 characters or less."),
  subHeader: z.string().max(300, "Sub-header must be 300 characters or less.").optional(),
  content: z.string().min(50, "Content must be at least 50 characters."),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL." }).or(z.literal('')).optional(),
  imageHint: z.string().max(50, "Image hint should be concise (max 50 chars).").optional(),
});
export type NewBlogPostInput = z.infer<typeof NewBlogPostSchema>;
