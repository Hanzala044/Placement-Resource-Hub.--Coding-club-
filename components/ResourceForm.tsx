"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { resourceCreateSchema, resourceUpdateSchema, resourceTypes, entryStatuses } from "@/lib/validators";
import type { Resource } from "@/lib/types";
import { input, label as labelClass, button, card } from "@/lib/ui";
import { useToast } from "@/components/Toast";

interface ResourceFormProps {
  mode: "create" | "edit";
  resource?: Resource;
  defaultCompanyName?: string;
}

export function ResourceForm({ mode, resource, defaultCompanyName }: ResourceFormProps) {
  const router = useRouter();
  const { show } = useToast();
  const [companyName, setCompanyName] = useState(resource?.companies?.name ?? defaultCompanyName ?? "");
  const [title, setTitle] = useState(resource?.title ?? "");
  const [url, setUrl] = useState(resource?.url ?? "");
  const [type, setType] = useState(resource?.resource_type ?? "article");
  const [tags, setTags] = useState(resource?.tags.join(", ") ?? "");
  const [status, setStatus] = useState(resource?.status ?? "open");

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const payload =
      mode === "create"
        ? { company_name: companyName, title, url, resource_type: type, tags }
        : { title, url, resource_type: type, tags, status };

    const schema = mode === "create" ? resourceCreateSchema : resourceUpdateSchema;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      show("Fix the highlighted fields", "error");
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const apiUrl = mode === "create" ? "/api/resources" : `/api/resources/${resource!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.issues) setErrors(data.issues);
        throw new Error(data?.error ?? "Something went wrong");
      }
      show(mode === "create" ? "Resource added" : "Changes saved", "success");
      const saved = data.resource;
      router.push(saved.company_id ? `/company/${saved.company_id}` : "/resources");
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
          <label className={labelClass} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className={`${input} mt-1`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Acme OA Prep Sheet"
          />
          {fieldError("title")}
        </div>

        <div>
          <label className={labelClass} htmlFor="company">
            Company (optional)
          </label>
          <input
            id="company"
            className={`${input} mt-1`}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Leave blank for a general resource"
            disabled={mode === "edit"}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="type">
            Type
          </label>
          <select id="type" className={`${input} mt-1`} value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            {resourceTypes.map((t) => (
              <option key={t} value={t}>
                {t}
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

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="url">
            Link
          </label>
          <input
            id="url"
            className={`${input} mt-1`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
          {fieldError("url")}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            className={`${input} mt-1`}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="dsa, aptitude, resume"
          />
        </div>
      </div>

      <button type="submit" disabled={submitting} className={`${button.primary} self-start`}>
        {submitting ? "Saving…" : mode === "create" ? "Add resource" : "Save changes"}
      </button>
    </form>
  );
}
