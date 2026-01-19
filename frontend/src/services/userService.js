const API_URL = process.env.REACT_APP_API_URL + "/api/resumes";

/**
 * Get all resumes for the current user
 */
export async function getResumes() {
  const res = await fetch(`${API_URL}/list`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch resumes");
  return res.json();
}

/**
 * Create a new resume
 * @param {Object} data { title, content_url }
 */
export async function createResume(data) {
  const res = await fetch(`${API_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create resume");
  return res.json();
}

/**
 * Update the current user's resume
 * @param {Object} data { title?, content_url? }
 */
export async function updateResume(data) {
  const res = await fetch(`${API_URL}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update resume");
  return res.json();
}

/**
 * Delete the current user's resume
 */
export async function deleteResume() {
  const res = await fetch(`${API_URL}/delete`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete resume");
  return res.json();
}
