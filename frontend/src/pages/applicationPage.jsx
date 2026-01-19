import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import JobModal from "../components/jobModal";
import AiFeedbackModal from "../components/AIFeedbackModal";

import {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
} from "../services/applicationService";

import { createJob, updateJob } from "../services/jobService";
import { getCurrentUser } from "../services/authService";
import { getResumes } from "../services/resumeService";
import { getCoverLetters } from "../services/coverLetterService";

export default function ApplicationPage() {
  const [title, setTitle] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [resumes, setResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [applications, setApplications] = useState([]);

  const [editingApp, setEditingApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [showJobModal, setShowJobModal] = useState(false);

  // AI modal
  const [aiOpen, setAiOpen] = useState(false);
  const [activeApplication, setActiveApplication] = useState(null);

  /* ----------------------------------
     Initial Data Load
  -----------------------------------*/
  useEffect(() => {
    async function fetchData() {
      try {
        const [userData, resumeData, coverLetterData, applicationData] =
          await Promise.all([
            getCurrentUser(),
            getResumes(),
            getCoverLetters(),
            getApplications(),
          ]);

        setUser(userData);
        setResumes(resumeData || []);
        setCoverLetters(coverLetterData || []);
        setApplications(applicationData || []);
      } catch (err) {
        console.error("Failed to load application data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  /* ----------------------------------
     Helpers
  -----------------------------------*/
  const resetForm = () => {
    setTitle("");
    setSelectedJob(null);
    setSelectedResume(null);
    setSelectedStatus("");
    setEditingApp(null);
  };

  /* ----------------------------------
     Job Handling
  -----------------------------------*/
  const handleJobChange = async (jobObj) => {
    try {
      if (editingApp && selectedJob?.id) {
        const updatedJob = await updateJob(selectedJob.id, jobObj);
        setSelectedJob(updatedJob);
      } else {
        const newJob = await createJob(jobObj);
        setSelectedJob(newJob);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save job");
    }
  };

  /* ----------------------------------
     Application Submit
  -----------------------------------*/
  const handleSubmit = async () => {
    if (!title || !selectedJob?.id) {
      alert("Application title and job are required");
      return;
    }

    try {
      if (editingApp) {
        const updatedApp = await updateApplication(editingApp.id, {
          title,
          job_id: selectedJob.id,
          resume_id: selectedResume?.id || null,
          status: selectedStatus || null,
        });

        setApplications(apps =>
          apps.map(app =>
            app.id === updatedApp.id ? updatedApp : app
          )
        );
      } else {
        const newApp = await createApplication({
          title,
          job_id: selectedJob.id,
          resume_id: selectedResume?.id || null,
          status: selectedStatus || null,
        });

        setApplications(apps => [...apps, newApp]);
      }

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to submit application");
    }
  };

  /* ----------------------------------
     Edit / Delete
  -----------------------------------*/
  const handleEdit = (app) => {
    setEditingApp(app);
    setTitle(app.title);
    setSelectedJob(app.job || null);
    setSelectedStatus(app.status || "");

    setSelectedResume(
      app.resume_id ? resumes.find(r => r.id === app.resume_id) : null
    );
  };

  const handleDelete = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this application?"))
      return;

    try {
      await deleteApplication(appId);
      setApplications(apps => apps.filter(app => app.id !== appId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete application");
    }
  };

  if (loading) return <p>Loading...</p>;

  const totalApps = applications.length;
  const totalJobs = new Set(applications.map(a => a.job_id)).size;

  /* ----------------------------------
     Render
  -----------------------------------*/
  return (
    <div className="app-layout">
      <div className="page-header">
        <Link to="/dashboard" className="back-button">
        ← Back to Dashboard
        </Link>
      </div>

      <div className="main-grid">
        {/* LEFT PANEL */}
        <div className="panel left">
          <div className="form-card compact">
            <h2>{editingApp ? "Edit Application" : "New Application"}</h2>

            <div className="field">
              <label>Application Title</label>
              <input
                className="input-sm"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Job</label>
              <div className="inline-job-box">
                <span className="job-label">
                  {selectedJob?.title || "No job selected"}
                </span>
                <button
                  className="btn-sm"
                  onClick={() => setShowJobModal(true)}
                >
                  {selectedJob?.id ? "Edit" : "Add"}
                </button>
              </div>
            </div>

            <div className="field">
              <label>Resume (optional)</label>
              <select
                className="input-sm"
                value={selectedResume?.id || ""}
                onChange={e =>
                  setSelectedResume(
                    resumes.find(r => r.id === Number(e.target.value)) || null
                  )
                }
              >
                <option value="">Select...</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Status</label>
              <input
                className="input-sm"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
              />
            </div>

            <div className="row-actions">
              <button className="btn-primary-sm" onClick={handleSubmit}>
                {editingApp ? "Update" : "Create"}
              </button>
              {editingApp && (
                <button className="btn-ghost-sm" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="stats-card compact">
            <h4>Stats</h4>
            <div className="stat-line">Applications: {totalApps}</div>
            <div className="stat-line">Unique Jobs: {totalJobs}</div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="panel right">
          <div className="panel-card">
            <h2>Applications</h2>
            <ul className="list-scroll">
              {applications.map(app => (
                <li key={app.id} className="item-card compact">
                  <div className="item-title">{app.title}</div>
                  <div className="item-meta">Job: {app.job?.title}</div>
                  <div className="item-sub">
                    Cover Letter:{" "}
                    {coverLetters.find(cl => cl.application_id === app.id)?.title || "None"}
                  </div>

                  <div className="item-actions">
                    <button
                      className="btn-primary-sm"
                      onClick={() => handleEdit(app)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn-ghost-sm"
                      onClick={() => handleDelete(app.id)}
                    >
                      Delete
                    </button>

                    <button
                      className="btn-secondary-sm"
                      onClick={() => {
                        setActiveApplication(app);
                        setAiOpen(true);
                      }}
                    >
                      AI Feedback
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showJobModal && (
        <JobModal
          onClose={() => setShowJobModal(false)}
          onJobChange={handleJobChange}
          initialJob={selectedJob}
          currentUserId={user?.id}
        />
      )}

      {aiOpen && activeApplication && (
        <AiFeedbackModal
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          coverLetterText={
            coverLetters.find(cl => cl.application_id === activeApplication.id)?.content || ""
          }
          resumeText={
            resumes.find(r => r.id === activeApplication.resume_id)?.content || ""
          }
          jobText={activeApplication.job?.description || ""}
        />
      )}
    </div>
  );
}
