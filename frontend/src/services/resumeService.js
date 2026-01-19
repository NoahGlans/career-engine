const API_URL = process.env.REACT_APP_API_URL + "/api/resumes";

// -----------------------------
// GET ALL RESUMES
// -----------------------------
export async function getResumes() {
  const res = await fetch(`${API_URL}/list`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch resumes");
  return await res.json();
}

// -----------------------------
// CREATE RESUME (PDF SUPPORTED)
// -----------------------------
export async function createResume(data) {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.file) formData.append("file", data.file);

  const res = await fetch(`${API_URL}/create`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to create resume");
  }

  return await res.json();
}

// -----------------------------
// UPDATE RESUME (PDF SUPPORTED)
// -----------------------------
export async function updateResume(resumeId, data) {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.file) formData.append("file", data.file);

  const res = await fetch(`${API_URL}/update/${resumeId}`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to update resume");
  }

  return await res.json();
}

// -----------------------------
// DELETE RESUME
// -----------------------------
export async function deleteResume(resumeId) {
  const res = await fetch(`${API_URL}/delete/${resumeId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to delete resume");
  }

  return await res.json();
}
