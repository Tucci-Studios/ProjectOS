import { LoadingRegion, HeaderSkeleton, TileGridSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <LoadingRegion label="Loading tutorials">
        <HeaderSkeleton />
        <div className="mt-8">
          <TileGridSkeleton count={4} />
        </div>
        <div className="mt-8">
          <TileGridSkeleton count={2} />
        </div>
      </LoadingRegion>
    </div>
  );
}
