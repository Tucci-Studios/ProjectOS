import { LoadingRegion, HeaderSkeleton, RowListSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <LoadingRegion label="Loading section">
        <HeaderSkeleton />
        <RowListSkeleton count={5} />
      </LoadingRegion>
    </div>
  );
}
