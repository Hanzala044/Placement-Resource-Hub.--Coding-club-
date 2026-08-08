"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  difficulties,
  experienceLevels,
  experienceCreateSchema,
  experienceUpdateSchema,
  outcomes,
  entryStatuses,
} from "@/lib/validators";
import type { Experience } from "@/lib/types";
import { input, label as labelClass, button, card } from "@/lib/ui";
import { useToast } from "@/components/Toast";

interface ExperienceFormProps {
  mode: "create" | "edit";
  experience?: Experience;
  defaultCompanyName?: string;
}

export function ExperienceForm({ mode, experience, defaultCompanyName }: ExperienceFormProps) {
  const router = useRouter();
  const { show } = useToast();
  const [companyName, setCompanyName] = useState(experience?.companies?.name ?? defaultCompanyName ?? "");
  const [role, setRole] = useState(experience?.role ?? "");
  const [level, setLevel] = useState(experience?.experience_level ?? "fresher");
  const [difficulty, setDifficulty] = useState(experience?.difficulty ?? "medium");
  const [outcome, setOutcome] = useState(experience?.outcome ?? "pending");
  
  // Parse rounds if it's JSON, otherwise fall back to raw string in round1
  const initialRounds = (() => {
    try {
      if (experience?.rounds && experience.rounds.startsWith("{")) {
        return JSON.parse(experience.rounds);
      }
    } catch (e) {}
    return { round1: experience?.rounds ?? "", round2: "", round3: "" };
  })();

  const [round1, setRound1] = useState(initialRounds.round1);
  const [round2, setRound2] = useState(initialRounds.round2);
  const [round3, setRound3] = useState(initialRounds.round3);

  const [content, setContent] = useState(experience?.content ?? "");
  const [tags, setTags] = useState(experience?.tags.join(", ") ?? "");
  const [authorName, setAuthorName] = useState(experience?.author_name ?? "");
  const [status, setStatus] = useState(experience?.status ?? "open");

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const combinedRounds = JSON.stringify({ round1, round2, round3 });

    const payload =
      mode === "create"
        ? { company_name: companyName, role, experience_level: level, difficulty, outcome, rounds: combinedRounds, content, tags, author_name: authorName }
        : { role, experience_level: level, difficulty, outcome, rounds: combinedRounds, content, tags, author_name: authorName, status };

    const schema = mode === "create" ? experienceCreateSchema : experienceUpdateSchema;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      show("Fix the highlighted fields", "error");
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const url = mode === "create" ? "/api/experiences" : `/api/experiences/${experience!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.issues) setErrors(data.issues);
        throw new Error(data?.error ?? "Something went wrong");
      }
      show(mode === "create" ? "Experience shared" : "Changes saved", "success");
      router.push(`/experience/${data.experience.id}`);
      router.refresh();
    } catch (err) {
      show(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(name: string) {
    const msgs = errors[name];
    return msgs?.length ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{msgs[0]}</p> : null;
  }

  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-6 p-6 ${card}`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="company">
            Company
          </label>
          {mode === "create" ? (
            <input
              id="company"
              className={`${input} mt-1`}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          ) : (
            <p className="mt-1 rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-secondary)]">
              {experience?.companies?.name} (not editable)
            </p>
          )}
          {fieldError("company_name")}
        </div>

        <div>
          <label className={labelClass} htmlFor="role">
            Role
          </label>
          <input
            id="role"
            className={`${input} mt-1`}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. SDE Intern"
          />
          {fieldError("role")}
        </div>

        <div>
          <label className={labelClass} htmlFor="level">
            Level
          </label>
          <select id="level" className={`${input} mt-1`} value={level} onChange={(e) => setLevel(e.target.value as typeof level)}>
            {experienceLevels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="difficulty">
            Difficulty
          </label>
          <select
            id="difficulty"
            className={`${input} mt-1`}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="outcome">
            Outcome
          </label>
          <select id="outcome" className={`${input} mt-1`} value={outcome} onChange={(e) => setOutcome(e.target.value as typeof outcome)}>
            {outcomes.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {mode === "edit" && (
          <div>
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select id="status" className={`${input} mt-1`} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              {entryStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="author">
            Your name (optional)
          </label>
          <input
            id="author"
            className={`${input} mt-1`}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Stays anonymous if left blank"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            className={`${input} mt-1`}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="dsa, system-design, hr-round"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor="round1">
            Round 1: Online Assessment
          </label>
          <textarea
            id="round1"
            className={`${input} mt-1 min-h-[80px]`}
            value={round1}
            onChange={(e) => setRound1(e.target.value)}
            placeholder="Topics covered, difficulty, duration..."
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="round2">
            Round 2: Technical Interview
          </label>
          <textarea
            id="round2"
            className={`${input} mt-1 min-h-[80px]`}
            value={round2}
            onChange={(e) => setRound2(e.target.value)}
            placeholder="Specific coding problems, DSA topics, core CS subjects like DBMS/OS..."
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="round3">
            Round 3: HR & Behavioral
          </label>
          <textarea
            id="round3"
            className={`${input} mt-1 min-h-[80px]`}
            value={round3}
            onChange={(e) => setRound3(e.target.value)}
            placeholder="Common questions asked, your responses, behavioral scenarios..."
          />
        </div>
        {fieldError("rounds")}
      </div>

      <div>
        <label className={labelClass} htmlFor="content">
          Full write-up
        </label>
        <textarea
          id="content"
          className={`${input} mt-1 min-h-[220px]`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Walk through each round in detail — questions asked, how you approached them, what you'd do differently."
        />
        {fieldError("content")}
      </div>

      <button type="submit" disabled={submitting} className={`${button.primary} self-start`}>
        {submitting ? "Saving…" : mode === "create" ? "Submit experience" : "Save changes"}
      </button>
    </form>
  );
}
