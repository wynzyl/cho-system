import { Skeleton } from "@/components/ui/skeleton"

export default function TriageLoading() {
  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_800px]">
        <div className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-full" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
        <div className="rounded-lg border p-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
