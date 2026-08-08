import { z } from "zod";

/**
 * Shared zod schemas — imported by both the form components (client-side
 * check, fast feedback) and the Route Handlers (server-side check, the one
 * that actually guarantees no bad data reaches the DB).
 */

export const experienceLevels = ["intern", "fresher", "experienced"] as const;
export const difficulties = ["easy", "medium", "hard"] as const;
export const outcomes = ["selected", "rejected", "pending"] as const;
export const entryStatuses = ["open", "archived"] as const;
export const resourceTypes = ["article", "video", "pdf", "sheet", "note"] as const;

/** Accepts a comma-separated string (from a plain text input) or a string[]
 *  and normalizes to a deduped, lowercased string[]. Missing/empty -> []. */
const tagsField = z
  .preprocess((val) => {
    if (typeof val === "string") {
      return val.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    }
    if (Array.isArray(val)) {
      return val
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }
    return val;
  }, z.array(z.string().min(1).max(40)).max(20))
  .default([]);

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(200),
  industry: optionalTrimmed(200),
});

export const experienceCreateSchema = z.object({
  company_name: z.string().trim().min(1, "Company is required").max(200),
  role: z.string().trim().min(1, "Role is required").max(200),
  experience_level: z.enum(experienceLevels).default("fresher"),
  difficulty: z.enum(difficulties).default("medium"),
  outcome: z.enum(outcomes).default("pending"),
  rounds: z.string().trim().min(1, "Describe at least one round"),
  content: z.string().trim().min(1, "Write-up is required"),
  tags: tagsField,
  author_name: optionalTrimmed(120),
});
export type ExperienceCreateInput = z.infer<typeof experienceCreateSchema>;

export const experienceUpdateSchema = z
  .object({
    role: z.string().trim().min(1).max(200),
    experience_level: z.enum(experienceLevels),
    difficulty: z.enum(difficulties),
    outcome: z.enum(outcomes),
    rounds: z.string().trim().min(1),
    content: z.string().trim().min(1),
    tags: tagsField,
    author_name: optionalTrimmed(120),
    status: z.enum(entryStatuses),
  })
  .partial();
export type ExperienceUpdateInput = z.infer<typeof experienceUpdateSchema>;

export const resourceCreateSchema = z.object({
  company_name: optionalTrimmed(200),
  title: z.string().trim().min(1, "Title is required").max(200),
  url: z.string().trim().url("Must be a valid URL, including https://"),
  resource_type: z.enum(resourceTypes).default("article"),
  tags: tagsField,
});
export type ResourceCreateInput = z.infer<typeof resourceCreateSchema>;

export const resourceUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    url: z.string().trim().url("Must be a valid URL, including https://"),
    resource_type: z.enum(resourceTypes),
    tags: tagsField,
    status: z.enum(entryStatuses),
  })
  .partial();
export type ResourceUpdateInput = z.infer<typeof resourceUpdateSchema>;
