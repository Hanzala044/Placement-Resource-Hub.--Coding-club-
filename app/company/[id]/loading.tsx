import { Skeleton, CardGridSkeleton } from "@/components/Skeleton";

export default function CompanyLoading() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <CardGridSkeleton count={3} />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <CardGridSkeleton count={3} />
      </div>
    </div>
  );
}
