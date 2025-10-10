import { z } from 'zod'

export const jobPostingSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  company: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  category: z.string().optional(),
  location: z.string().max(100).optional(),
  job_type: z.enum(['remote', 'hybrid', 'onsite']),
})

export type JobPostingFormData = z.infer<typeof jobPostingSchema>

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
  job_posting_id: z.string().uuid(),
  parent_comment_id: z.string().uuid().optional(),
})

export type CommentFormData = z.infer<typeof commentSchema>

export const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
