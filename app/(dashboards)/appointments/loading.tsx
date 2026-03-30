import { Skeleton } from "@/components/ui/skeleton"

export default function AppointmentsLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      <div className="w-80 flex-shrink-0 rounded-lg border p-4 space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-40" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
      <div className="flex-1 rounded-lg border p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-md border p-3 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}
