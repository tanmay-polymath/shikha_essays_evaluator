import SkeletonItem from "@/components/loading/item"
import { Shell } from "@/components/loading/shell"

export default function Loading() {
  return (
    <Shell>
      <div className="animate-pulse rounded-md">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </div>
    </Shell>
  )
}
