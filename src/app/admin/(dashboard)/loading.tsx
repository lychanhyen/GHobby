export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Đang tải dữ liệu quản trị">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-7 w-56" />
        </div>
        <div className="skeleton h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card p-5">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton mt-3 h-7 w-32" />
            <div className="skeleton mt-2 h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-ink-200 px-5 py-4">
          <div className="skeleton h-4 w-40" />
        </div>
        <div className="divide-y divide-ink-100">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-5 py-4">
              <div className="skeleton h-10 w-10 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3.5 w-1/3" />
                <div className="skeleton h-2.5 w-1/5" />
              </div>
              <div className="skeleton h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
