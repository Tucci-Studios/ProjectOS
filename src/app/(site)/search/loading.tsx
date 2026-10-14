import { LoadingRegion, HeaderSkeleton, RowListSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <LoadingRegion label="Searching">
        <HeaderSkeleton />
        <RowListSkeleton count={4} />
      </LoadingRegion>
    </div>
  );
}
