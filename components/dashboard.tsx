export function Dashboard({
  id,
  children,
}: {
  id: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="dash-main" id={id}>
      {children}
    </main>
  );
}

export function ComingSoon() {
  return <h2>Tính năng đang phát triển</h2>;
}

export function WipPage({ id }: { id: string }) {
  return (
    <Dashboard id={id}>
      <ComingSoon />
    </Dashboard>
  );
}
export function TableSkeleton() {
  return (
    <section className="section">
      <div className="section-table mb-6">
        <div className="relative min-h-100 table-skeleton-pulse overflow-hidden max-w-full">
          <div className="loading show">
            <div className="loading-inner">
              <h2 className="loader">Đang tải dữ liệu...</h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

