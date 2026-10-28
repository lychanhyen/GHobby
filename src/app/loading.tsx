export default function Loading() {
  return (
    <div className="container-page py-10 lg:py-14" aria-busy="true" aria-label="Đang tải nội dung">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6">
          <div className="skeleton h-3 w-48" />
          <div className="mt-5 space-y-3">
            <div className="skeleton h-10 w-full max-w-md" />
            <div className="skeleton h-10 w-4/5 max-w-sm" />
          </div>
          <div className="mt-5 space-y-2">
            <div className="skeleton h-3.5 w-full max-w-lg" />
            <div className="skeleton h-3.5 w-3/4 max-w-md" />
          </div>
          <div className="mt-7 flex gap-3">
            <div className="skeleton h-11 w-40" />
            <div className="skeleton h-11 w-32" />
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="grid h-[300px] grid-cols-5 grid-rows-6 gap-2.5 sm:h-[400px] lg:h-[440px]">
            <div className="skeleton col-span-3 row-span-6" />
            <div className="skeleton col-span-2 row-span-3" />
            <div className="skeleton col-span-2 row-span-3" />
          </div>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-lg border border-ink-200 bg-white">
            <div className="skeleton aspect-square rounded-none" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-2.5 w-1/3" />
              <div className="skeleton h-3.5 w-full" />
              <div className="skeleton h-3.5 w-2/3" />
              <div className="mt-3 flex items-center justify-between">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-8 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
