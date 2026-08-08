import { Skeleton, CardGridSkeleton } from "@/components/Skeleton";

export default function ExperiencesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
      <CardGridSkeleton count={6} />
    </div>
  );
}
