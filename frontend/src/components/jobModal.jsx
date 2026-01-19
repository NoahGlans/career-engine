import React, { useState, useEffect } from "react";

export default function JobModal({ onClose, onJobChange, initialJob, currentUserId }) {
  // Helper to format date to yyyy-MM-dd for <input type="date">
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [jobUrl, setJobUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  // Populate state from initialJob when editing
  useEffect(() => {
    if (initialJob) {
      setTitle(initialJob.title || "");
      setCompany(initialJob.company || "");
      setLocation(initialJob.location || "");
      setEmploymentType(initialJob.employment_type || "Full-time");
      setJobUrl(initialJob.job_url || "");
      setDeadline(formatDate(initialJob.deadline));
      setDescription(initialJob.description || "");
    }
  }, [initialJob]);

  const handleSubmit = () => {
    if (!title.trim() || !company.trim() || !description.trim()) {
      alert("Title, company, and description are required.");
      return;
    }

    const jobObj = {
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      employment_type: employmentType.trim(),
      job_url: jobUrl.trim(),
      deadline: deadline || null, // yyyy-MM-dd format
      description: description.trim(),
      user_id: currentUserId,
    };

    onJobChange(jobObj);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <h2>{initialJob ? "Edit Job" : "Add Job"}</h2>

        <label>Job Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Frontend Developer" />

        <label>Company *</label>
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google" />

        <label>Location</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote / NY" />

        <label>Employment Type</label>
        <input
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          placeholder="Full-time / Part-time / Contract"
        />

        <label>Job URL</label>
        <input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://..." />

        <label>Deadline</label>
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

        <label>Description *</label>
        <textarea
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Job responsibilities, requirements..."
        />

        <div className="modal-buttons">
          <button onClick={handleSubmit}>{initialJob ? "Update Job" : "Save Job"}</button>
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
