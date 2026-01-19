import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplications } from "../services/applicationService";

const statusColors = {
  Applied: "#2563eb",
  "In Progress": "#10b981",
  Interview: "#ff9d00ff",
  Rejected: "#ef4444",
  Pending: "#6b7280",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const apps = await getApplications();
        setRecentApplications(apps || []);
      } catch (err) {
        console.error("Failed to load recent applications", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Aggregate stats for overview
  const totalApps = recentApplications.length;
  const statusCounts = recentApplications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const upcomingDeadlines = recentApplications
  .filter(app => app.job?.deadline)
  .map(app => ({
    id: app.id,
    title: app.title,
    company: app.job.company,
    deadline: new Date(app.job.deadline),
  }))
  .filter(item => item.deadline >= new Date())
  .sort((a, b) => a.deadline - b.deadline)
  .slice(0, 4); // Max next 4 deadlines

  return (
    <div className="dashboard-container">
      {/* LEFT COLUMN */}
      <div className="left-column">
        {/* Scrollable Recent Applications */}
        <div className="card recent-apps-card">
          <h2>Recent Applications</h2>

          <div className="recent-app-list-wrapper">
            {!loading && (
              <div className="recent-app-list two-column-grid">
                {recentApplications.map((app) => (
                  <div key={app.id} className="recent-app">
                    <div className="app-info">
                      <strong>{app.title}</strong>
                      {app.job && (
                        <>
                          <p>Company: {app.job.company}</p>
                          <p>Location: {app.job.location || "N/A"}</p>
                          <p>Type: {app.job.employment_type || "Full-time"}</p>
                          <p>
                            Submitted:
                            {" "}
                            {app.submitted_at
                              ? new Date(app.submitted_at).toLocaleDateString()
                              : "N/A"}
                          </p>
                          <p>
                            Deadline:{" "}
                            {app.job.deadline
                              ? new Date(app.job.deadline).toLocaleDateString()
                              : "N/A"}
                          </p>
                          {app.job.job_url && (
                            <p>
                              <a
                                href={app.job.job_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Job Link
                              </a>
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <span
                      className={`status-badge status-${app.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                      style={{
                        backgroundColor: statusColors[app.status] || "#9ca3af",
                      }}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="right-column">
        {/* Quick Actions */}
        <div className="card">
          <h2>Quick Actions</h2>

          <button className="action-btn" onClick={() => navigate("/resumes")}>
            Resumes
          </button>
          <button className="action-btn" onClick={() => navigate("/cover-letters")}>
            Cover Letters
          </button>
          <button className="action-btn" onClick={() => navigate("/applications")}>
            Applications
          </button>
        </div>

        {/* Activity Summary */}
        <div className="card stats-card">
  <h2>Activity Summary</h2>

  <div className="stats-grid">
    {/* LEFT: Status counts */}
    <div>
      <p>Total Applications: {totalApps}</p>
      <ul>
        {Object.entries(statusCounts).map(([status, count]) => (
          <li key={status}>
            <span className="label">{status}</span>
            <span className="value">{count}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* RIGHT: Upcoming deadlines */}
    <div className="upcoming-deadlines">
      <h4>Upcoming Deadlines</h4>

                {upcomingDeadlines.length === 0 ? (
                  <p className="empty">No upcoming deadlines</p>
                ) : (
                  <ul>
                    {upcomingDeadlines.map(item => (
                      <li key={item.id}>
                        <div className="deadline-title">{item.title}</div>
                        <div className="deadline-meta">
                          {item.company} ·{" "}
                          {item.deadline.toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

      </div>
    </div>
  );
}
