import { LoadingRegion, HeaderSkeleton, StripSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <LoadingRegion label="Loading group">
        <HeaderSkeleton />
        <StripSkeleton />
      </LoadingRegion>
    </div>
  );
}
