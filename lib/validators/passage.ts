import { z } from "zod";

export const passageFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  sourceEnglish: z
    .string()
    .min(20, "Source English should be at least 20 characters."),
  referenceChinese: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  tags: z.string().optional(),
});

export const attemptStepOneSchema = z.object({
  passageId: z.string().min(1),
  userChinese: z.string().min(1, "Please write your Chinese translation."),
});

export const attemptStepTwoSchema = z.object({
  userBackTranslatedEnglish: z
    .string()
    .min(1, "Please write your back-translated English."),
});

export type PassageFormInput = z.infer<typeof passageFormSchema>;
