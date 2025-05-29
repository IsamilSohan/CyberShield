
import { z } from 'zod';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  enrolledCourses: string[];
  certificates: Certificate[]; // Certificates are still course-level for now
}

// Simplified Module for Phase 1: Just ID, title, and order. Content and quiz linking later.
export interface Module {
  id: string; // Unique identifier for the module (e.g., generated string)
  title: string;
  order: number; // For sequencing within the course
  // quizId?: string; // Will be added in a later phase for module-specific quizzes
  // contentBlocks?: ContentBlock[]; // For text/image/video, to be added in a later phase
}

// export interface ContentBlock {
//   id: string;
//   type: 'text' | 'image' | 'video';
//   value: string; // Text content or URL for image/video
//   imageHint?: string; // For AI hint if type is image
//   order: number;
// }

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  imageHint?: string;
  prerequisites?: string[];
  modules: Module[]; // Array of modules
  // videoUrl?: string; // Removed, video content will be in modules
  // quizId?: string; // Removed, quizzes will be per module
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
  prerequisites: z.string().optional(),
  // videoUrl: z.string().url({ message: "Video URL must be a valid URL if provided." }).or(z.literal('')).optional(), // Removed
});

export type NewCourseInput = z.infer<typeof NewCourseSchema>;
