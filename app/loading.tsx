import { Skeleton, CardGridSkeleton } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col items-center gap-6 py-8">
        <Skeleton className="h-6 w-56 rounded-full" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-12 w-full max-w-xl rounded-lg" />
      </section>
      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-48" />
        <CardGridSkeleton count={3} />
      </section>
      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-48" />
        <CardGridSkeleton count={6} />
      </section>
    </div>
  );
}
