import { LoadingRegion, HeaderSkeleton, TileGridSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <LoadingRegion label="Loading the community feed">
        <HeaderSkeleton />
        <TileGridSkeleton count={4} />
      </LoadingRegion>
    </div>
  );
}
