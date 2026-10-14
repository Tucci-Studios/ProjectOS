import { LoadingRegion, HeaderSkeleton, TileGridSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <LoadingRegion label="Loading">
        <HeaderSkeleton />
        <TileGridSkeleton count={4} />
      </LoadingRegion>
    </div>
  );
}
