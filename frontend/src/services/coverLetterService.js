const API_URL = process.env.REACT_APP_API_URL + "/api/cover-letters";

/* -----------------------------
   Get all cover letters
------------------------------ */
export async function getCoverLetters() {
  const res = await fetch(`${API_URL}/list`, { credentials: "include" });
  return res.json();
}

/* -----------------------------
   Get single cover letter
------------------------------ */
export async function getCoverLetter(id) {
  const res = await fetch(`${API_URL}/${id}`, { credentials: "include" });
  return res.json();
}

/* -----------------------------
   Create a new cover letter
------------------------------ */
export async function createCoverLetter({ title, language, application_id, file }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("language", language || "");
  formData.append("application_id", application_id);
  if (file) formData.append("file", file);

  const res = await fetch(`${API_URL}/create`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });
  return res.json();
}

/* -----------------------------
   Update a cover letter (supports optional PDF upload)
------------------------------ */
export async function updateCoverLetter(id, { title, language, application_id, file }) {
  const formData = new FormData();
  if (title) formData.append("title", title);
  if (language) formData.append("language", language);
  if (application_id) formData.append("application_id", application_id);
  if (file) formData.append("file", file);

  const res = await fetch(`${API_URL}/update/${id}`, {
    method: "PUT",
    body: formData,
    credentials: "include"
  });
  return res.json();
}

/* -----------------------------
   Delete a cover letter
------------------------------ */
export async function deleteCoverLetter(id) {
  const res = await fetch(`${API_URL}/delete/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
  return res.json();
}

export async function assignCoverLetterToApplication(coverLetterId, applicationId) {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/cover-letters/${coverLetterId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ application_id: applicationId }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to assign cover letter to application");
  }

  return res.json();
}

