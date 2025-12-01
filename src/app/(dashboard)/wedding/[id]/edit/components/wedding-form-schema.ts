// app/wedding/[id]/edit/components/wedding-form-schema.ts
import { z } from "zod"

export const weddingFormSchema = z.object({
  // Basic Info
  path: z.string().min(1, "Path is required").regex(/^[a-z0-9-]+$/, "Path can only contain lowercase letters, numbers, and hyphens"),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean(),

  // Groom Information
  groom: z.object({
    shortName: z.string().min(1, "Short name is required"),
    fullName: z.string().min(1, "Full name is required"),
    fullNameWithTitle: z.string().min(1, "Full name with title is required"),
    fatherName: z.string().min(1, "Father's name is required"),
    motherName: z.string().min(1, "Mother's name is required"),
    orderInFamily: z.string().optional(),
    instagram: z.string().optional(),
  }),

  // Bride Information
  bride: z.object({
    shortName: z.string().min(1, "Short name is required"),
    fullName: z.string().min(1, "Full name is required"),
    fullNameWithTitle: z.string().min(1, "Full name with title is required"),
    fatherName: z.string().min(1, "Father's name is required"),
    motherName: z.string().min(1, "Mother's name is required"),
    orderInFamily: z.string().optional(),
    instagram: z.string().optional(),
  }),

  // Quotes
  quotes: z.object({
    quote1: z.string().min(1, "Quote 1 is required"),
    quote1From: z.string().min(1, "Quote 1 source is required"),
    quote2: z.string().optional(),
    quote2From: z.string().optional(),
  }),

  // Akad Ceremony
  akad: z.object({
    isAkad:z.boolean(),
    timeRange: z.object({
      start: z.string(),
      end: z.string(),
    }),
    date: z.string().min(1, "Akad date is required"),
    place: z.string().min(1, "Akad place is required"),
    address: z.string().min(1, "Akad address is required"),
    liveLink: z.string().optional(),
  }),

  // Resepsi Ceremony
  resepsi: z.object({
    isResepsi: z.boolean(),
    eventCategory:z.string().min(1, "event category is required"),
    timeRange: z.object({
      start: z.string(),
      end: z.string(),
    }),
    date: z.string(),
    place: z.string(),
    address: z.string(),
    liveLink: z.string(),
    mapsLink: z.string(),
  }),

  // Love Story
  loveStory: z.object({
    loveStoryActived: z.boolean(),
    firstMeet: z.string().optional(),
    theProposal: z.string().optional(),
    marriage: z.string().optional(),
  }),

  // Gift Information
  gift: z.object({
    isRecieveGift: z.boolean(),
    showGift:z.boolean(),
    giftAddress: z.string().optional(),
    nameNoRek1: z.string().optional(),
    groomBank: z.string().optional(),
    groomNoRek: z.string().regex(/^\d+$/, "Must be a number").optional(),
    nameNoRek2: z.string().optional(),
    brideBank: z.string().optional(),
    brideNoRek: z.string().regex(/^\d+$/, "Must be a number").optional(),
  }),

  // Dress Colors
  dressColors: z.array(z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color")).optional(),
})

export type WeddingFormValues = z.infer<typeof weddingFormSchema>