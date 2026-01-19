const API_URL = process.env.REACT_APP_API_URL + "/api/jobs";

export async function getJobs() {
  const res = await fetch(`${API_URL}/list`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

export async function createJob(data) {
  const res = await fetch(`${API_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create job");
  return res.json();
}

export async function getJob(id) {
  const res = await fetch(`${API_URL}/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch job");
  return res.json();
}

export async function updateJob(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update job");
  return res.json();
}

export async function deleteJob(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete job");
  return res.json();
}
