import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getCoverLetters,
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
} from "../services/coverLetterService";
import { getApplications } from "../services/applicationService";

export default function CoverLetterPage() {
  const [coverLetters, setCoverLetters] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Create form state
  // -----------------------------
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  // -----------------------------
  // Edit form state
  // -----------------------------
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const [editApplication, setEditApplication] = useState(null);
  const [editPdfFile, setEditPdfFile] = useState(null);

  // -----------------------------
  // Load data
  // -----------------------------
  useEffect(() => {
    async function fetchData() {
      try {
        const [cls, apps] = await Promise.all([
          getCoverLetters(),
          getApplications(),
        ]);
        setCoverLetters(cls);
        setApplications(apps);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // -----------------------------
  // Create
  // -----------------------------
  const handleCreate = async () => {
    if (!title || !selectedApplication?.id || !pdfFile) {
      alert("Title, application, and PDF are required");
      return;
    }

    try {
      const newCL = await createCoverLetter({
        title,
        language,
        application_id: selectedApplication.id,
        file: pdfFile,
      });

      setCoverLetters([...coverLetters, newCL]);
      setTitle("");
      setLanguage("");
      setSelectedApplication(null);
      setPdfFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to create cover letter");
    }
  };

  // -----------------------------
  // Edit
  // -----------------------------
  const handleEdit = (cl) => {
    setEditingId(cl.id);
    setEditTitle(cl.title);
    setEditLanguage(cl.language || "");
    setEditApplication(
      applications.find((a) => a.id === cl.application_id) || null
    );
    setEditPdfFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditLanguage("");
    setEditApplication(null);
    setEditPdfFile(null);
  };

  const handleUpdate = async (id) => {
    if (!editTitle || !editApplication?.id) {
      alert("Title and application are required");
      return;
    }

    try {
      const updated = await updateCoverLetter(id, {
        title: editTitle,
        language: editLanguage,
        application_id: editApplication.id,
        file: editPdfFile || undefined,
      });

      setCoverLetters(
        coverLetters.map((cl) => (cl.id === id ? updated : cl))
      );
      handleCancelEdit();
    } catch (err) {
      console.error(err);
      alert("Failed to update cover letter");
    }
  };

  // -----------------------------
  // Delete
  // -----------------------------
  const handleDelete = async (id) => {
    try {
      await deleteCoverLetter(id);
      setCoverLetters(coverLetters.filter((cl) => cl.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete cover letter");
    }
  };

  const languageCounts = coverLetters.reduce((acc, cl) => {
  const lang = cl.language?.trim() || "Unspecified";
  acc[lang] = (acc[lang] || 0) + 1;
  return acc;
}, {});
const totalCoverLetters = coverLetters.length;


 return (
  
  <div className="app-layout">
        {/* Page header */}
    <div className="page-header">
      <Link to="/dashboard" className="back-button">
        ← Back to Dashboard
      </Link>
    </div>
    {/* Main grid, same grid style as the ApplicationPage */}
    <div className="main-grid">
      {/* LEFT PANEL */}
      <div className="panel-left">
        <div className="form-card">
          <h2>Create New Cover Letter</h2>

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            placeholder="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />

          <select
            value={selectedApplication?.id || ""}
            onChange={(e) =>
              setSelectedApplication(
                applications.find((a) => a.id === Number(e.target.value))
              )
            }
          >
            <option value="">Select Application</option>
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
          />

          <button onClick={handleCreate}>Create Cover Letter</button>
        </div>

        
     <div className="form-card">
  <h3>Stats</h3>

  {totalCoverLetters === 0 ? (
    <p>No cover letters yet</p>
  ) : (
    <>
      <div className="summary-row">
        <span>Cover Letters: </span>
        <span>{totalCoverLetters}</span>
      </div>

      <ul className="language-summary">
        {Object.entries(languageCounts).map(([language, count]) => (
          <li key={language}>
            <span>{language}: </span>
            <span>{count}</span>
          </li>
        ))}
      </ul>
    </>
  )}
</div>

      </div>


      {/* RIGHT PANEL */}
      <div className="panel right">
        <div className="panel-card">
        <div><h1>Your Cover Letters</h1></div>
        <div className = "cl-scrollable-list">
          {loading ? (
            <p>Loading cover letters...</p>
          ) : coverLetters.length === 0 ? (
            <p>No cover letters found</p>
          ) : (
            <ul>
              {coverLetters.map((cl) => (
                <li key={cl.id}>
                  {editingId === cl.id ? (
                    <>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                      />

                      <input
                        value={editLanguage}
                        onChange={(e) => setEditLanguage(e.target.value)}
                        placeholder="Language"
                      />

                      <select
                        value={editApplication?.id || ""}
                        onChange={(e) =>
                          setEditApplication(
                            applications.find(
                              (a) => a.id === Number(e.target.value)
                            )
                          )
                        }
                      >
                        <option value="">Select Application</option>
                        {applications.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.title}
                          </option>
                        ))}
                      </select>

                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setEditPdfFile(e.target.files[0])}
                      />

                      <button onClick={() => handleUpdate(cl.id)}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <strong>{cl.title}</strong>{" "}
                      ({cl.language || "No language"})

                      <p>
                        Application:{" "}
                        {applications.find(
                          (a) => a.id === cl.application_id
                        )?.title || "N/A"}
                      </p>

                      <p className="pdf-preview">{cl.content}</p>

                      <button onClick={() => handleEdit(cl)}>Update</button>
                      <button onClick={() => handleDelete(cl.id)}>Delete</button>
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
);}