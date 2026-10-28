export default function CartLoading() {
  return (
    <div className="container-page py-16" aria-busy="true" aria-label="Đang tải giỏ hàng">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-ink-200 bg-white">
          <div className="skeleton h-6 w-6 shrink-0" />
        </div>
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-1/3" />
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-3.5 p-3.5 sm:p-4">
              <div className="h-20 w-20 shrink-0 rounded-md border border-ink-100 bg-ink-50">
                <div className="skeleton h-full w-full" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-2/3" />
              </div>
              <div className="text-right">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-ink-200 bg-white p-5">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton mt-4 h-3 w-full" />
          <div className="skeleton mt-4 h-3 w-1/2" />
          <div className="skeleton mt-3 h-8 w-1/2" />
        </div>
      </div>
    </div>
  );
}
