export default function DashboardLoading() {
  return (
    <section className="dashboard-loading" aria-live="polite">
      <div className="dashboard-loading-header">
        <div className="dashboard-loading-icon" />
        <div>
          <div className="dashboard-loading-title" />
          <div className="dashboard-loading-subtitle" />
        </div>
      </div>

      <div className="dashboard-loading-grid">
        <div className="dashboard-loading-card" />
        <div className="dashboard-loading-card" />
        <div className="dashboard-loading-card" />
        <div className="dashboard-loading-card tall" />
        <div className="dashboard-loading-card wide" />
        <div className="dashboard-loading-card" />
      </div>
    </section>
  );
}
