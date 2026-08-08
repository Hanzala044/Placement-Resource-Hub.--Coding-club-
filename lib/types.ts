/**
 * Shared TypeScript types mirroring the Supabase schema (see sql/schema.sql).
 * Kept hand-written rather than generated since the schema is small and
 * stable for the scope of this project.
 */

export type ExperienceLevel = "intern" | "fresher" | "experienced";
export type Difficulty = "easy" | "medium" | "hard";
export type Outcome = "selected" | "rejected" | "pending";
export type EntryStatus = "open" | "archived";
export type ResourceType = "article" | "video" | "pdf" | "sheet" | "note";

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  created_at: string;
}

export interface Experience {
  id: string;
  company_id: string | null;
  role: string;
  experience_level: ExperienceLevel;
  difficulty: Difficulty;
  outcome: Outcome;
  rounds: string;
  content: string;
  tags: string[];
  author_name: string | null;
  status: EntryStatus;
  ai_summary: string | null;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  companies?: Pick<Company, "id" | "name" | "industry"> | null;
}

export interface Resource {
  id: string;
  company_id: string | null;
  title: string;
  url: string;
  resource_type: ResourceType;
  tags: string[];
  status: EntryStatus;
  created_at: string;
  companies?: Pick<Company, "id" | "name" | "industry"> | null;
}

/** Parsed shape of the AI-generated summary stored (as JSON text) in experiences.ai_summary */
export interface AiSummary {
  summary: string;
  tags: string[];
}
