export default function ProductLoading() {
  return (
    <div className="container-page py-8" aria-busy="true" aria-label="Đang tải sản phẩm">
      <div className="skeleton h-3 w-64" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="skeleton aspect-square rounded-lg" />
        <div className="space-y-4">
          <div className="skeleton h-3 w-40" />
          <div className="skeleton h-9 w-full" />
          <div className="skeleton h-9 w-3/4" />
          <div className="skeleton mt-6 h-28 w-full rounded-lg" />
          <div className="space-y-2 pt-2">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-2/3" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="skeleton h-12 flex-1" />
            <div className="skeleton h-12 w-14" />
          </div>
        </div>
      </div>
      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-lg border border-ink-200 bg-white">
            <div className="skeleton aspect-square rounded-none" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-2.5 w-1/3" />
              <div className="skeleton h-3.5 w-full" />
              <div className="skeleton h-3.5 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
