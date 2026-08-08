import Link from "next/link";
import { BuildingIcon, ArrowRightIcon } from "@/components/icons";
import { cardHover, surface } from "@/lib/ui";

interface CompanyCardProps {
  id: string;
  name: string;
  industry: string | null;
  experienceCount: number;
  resourceCount: number;
}

export function CompanyCard({ id, name, industry, experienceCount, resourceCount }: CompanyCardProps) {
  return (
    <Link href={`/company/${id}`} className={`group flex flex-col gap-3 p-4 ${cardHover}`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`flex size-9 items-center justify-center rounded-lg ${surface} text-indigo-600 dark:text-indigo-400`}>
          <BuildingIcon width={17} height={17} />
        </span>
        <ArrowRightIcon
          width={16}
          height={16}
          className="text-[var(--text-secondary)] opacity-40 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-500 group-hover:opacity-100"
        />
      </div>
      <div>
        <h3 className="font-semibold text-[var(--text-primary)]">{name}</h3>
        {industry && <p className="text-sm text-[var(--text-secondary)]">{industry}</p>}
      </div>
      <div className="mt-auto flex gap-3 pt-2 text-xs text-[var(--text-secondary)]">
        <span>{experienceCount} experience{experienceCount === 1 ? "" : "s"}</span>
        <span>·</span>
        <span>{resourceCount} resource{resourceCount === 1 ? "" : "s"}</span>
      </div>
    </Link>
  );
}
