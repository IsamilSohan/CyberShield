
import { z } from 'zod';

export interface User {
  id: string; 
  name: string;
  email: string;
  enrolledCourses: string[]; 
  certificates: Certificate[];
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[]; // Array of answer option strings
  correctOptionIndex: number; // 0-based index of the correct option in the options array
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string; // To link back to the course
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
  quizId: string; // Non-optional: ID of the quiz document in the 'quizzes' collection
}

// Assessment interface might not be directly used if Quiz interface serves the purpose for forms
// For now, keeping it simple and the AssessmentForm will use the Quiz type.
// If needed later for storing user attempts, we can expand on this.
// export interface Assessment {
//   id: string;
//   courseId: string; 
//   questions: AssessmentQuestion[]; // Re-using QuizQuestion for consistency
// }


export interface Certificate {
  id: string; // Unique ID for the certificate record
  courseId: string;
  courseTitle: string; // Storing title at issuance time
  userId: string;
  userName: string;
  issueDate: string; // ISO date string
  certificateUrl?: string; 
}

export const NewCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  longDescription: z.string().optional(),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL if provided." }).or(z.literal('')).optional(),
  imageHint: z.string().optional(),
  videoUrl: z.string().url({ message: "Video URL must be a valid URL if provided." }).or(z.literal('')).optional(),
  prerequisites: z.string().optional(), 
});

export type NewCourseInput = z.infer<typeof NewCourseSchema>;
