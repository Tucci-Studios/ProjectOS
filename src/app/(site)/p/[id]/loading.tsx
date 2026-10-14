import { LoadingRegion } from "@/components/skeleton";

/** Shaped like a project page: title, buttons, stat bar, then panels. */
export default function Loading() {
  const bar = "rounded bg-neutral-800 motion-safe:animate-pulse";
  return (
    <div className="mx-auto w-full max-w-3xl">
      <LoadingRegion label="Loading project">
        <div className={`${bar} h-8 w-2/5`} />
        <div className={`${bar} mt-3 h-3.5 w-1/4`} />
        <div className={`${bar} mt-5 h-4 w-full`} />
        <div className={`${bar} mt-2 h-4 w-3/4`} />
        <div className="mt-6 flex gap-2.5">
          <div className={`${bar} h-11 w-40`} />
          <div className={`${bar} h-11 w-28`} />
          <div className={`${bar} h-11 w-28`} />
        </div>
        <div className={`${bar} mt-6 h-14 w-full`} />
        <div className={`${bar} mt-6 h-32 w-full`} />
      </LoadingRegion>
    </div>
  );
}
