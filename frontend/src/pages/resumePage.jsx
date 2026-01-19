import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getResumes,
  createResume,
  updateResume,
  deleteResume,
} from "../services/resumeService";

export default function ResumePage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  // Edit form state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPdfFile, setEditPdfFile] = useState(null);

  // -----------------------------
  // Load resumes
  // -----------------------------
  useEffect(() => {
    async function fetchResumes() {
      try {
        const data = await getResumes();
        setResumes(data);
      } catch (err) {
        console.error("Failed to load resumes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResumes();
  }, []);

  // -----------------------------
  // Create
  // -----------------------------
  const handleCreate = async () => {
    if (!title || !pdfFile) {
      alert("Title and PDF are required");
      return;
    }
    try {
      const newResume = await createResume({ title, file: pdfFile });
      setResumes([...resumes, newResume]);
      setTitle("");
      setPdfFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to create resume");
    }
  };

  // -----------------------------
  // Edit
  // -----------------------------
  const handleEdit = (resume) => {
    setEditingId(resume.id);
    setEditTitle(resume.title);
    setEditPdfFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditPdfFile(null);
  };

  const handleUpdate = async (id) => {
    if (!editTitle) {
      alert("Title is required");
      return;
    }
    try {
      const updated = await updateResume(id, {
        title: editTitle,
        file: editPdfFile || undefined,
      });
      setResumes(resumes.map((r) => (r.id === id ? updated : r)));
      handleCancelEdit();
    } catch (err) {
      console.error(err);
      alert("Failed to update resume");
    }
  };

  // -----------------------------
  // Delete
  // -----------------------------
  const handleDelete = async (id) => {
    try {
      await deleteResume(id);
      setResumes(resumes.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete resume");
    }
  };

  const totalResumes = resumes.length;

  return (
    <div className="app-layout">
      {/* Page Header */}
      <div className="page-header">
        <Link to="/dashboard" className="back-button">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        {/* LEFT PANEL */}
        <div className="panel-left">
          {/* Create Resume Card */}
          <div className="form-card">
            <h2>Create Resume</h2>
            <input
              placeholder="Resume Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
            />
            <button onClick={handleCreate}>Add Resume</button>
          </div>

          {/* Stats Card */}
          <div className="stats-card">
            <h2>Resume Stats</h2>
            <ul>
              <li>
                <span className="label">Total Resumes</span>
                <span className="value">{totalResumes}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="panel right">
          <div className="panel-card">
            <h2>Your Resumes</h2>
            <div className="cl-scrollable-list">
              {loading ? (
                <p>Loading resumes...</p>
              ) : resumes.length === 0 ? (
                <p>No resumes found</p>
              ) : (
                <ul>
                  {resumes.map((resume) => (
                    <li key={resume.id}>
                      {editingId === resume.id ? (
                        <>
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                          />
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setEditPdfFile(e.target.files[0])}
                          />
                          <div className="row-actions">
                            <button onClick={() => handleUpdate(resume.id)}>
                              Save
                            </button>
                            <button onClick={handleCancelEdit}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <strong>{resume.title}</strong>
                          {resume.content && (
                            <div className="pdf-preview">{resume.content}</div>
                          )}
                          <div className="row-actions">
                            <button onClick={() => handleEdit(resume)}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(resume.id)}>
                              Delete
                            </button>
                          </div>
                        </>
                      )}
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
