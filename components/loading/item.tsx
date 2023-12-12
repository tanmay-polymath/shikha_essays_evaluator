import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonItem() {
  return (
    <div className="py-3">
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}
