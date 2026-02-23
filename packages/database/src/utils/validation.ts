import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2).max(50),
  birthdate: z.string(),
  bio: z.string().max(1000).optional(),
  gender: z.string(),
  seeking_gender: z.string(),
})

export const messageSchema = z.object({
  content: z.string().min(1).max(1000),
})

export type ProfileFormData = z.infer<typeof profileSchema>
export type MessageFormData = z.infer<typeof messageSchema>
