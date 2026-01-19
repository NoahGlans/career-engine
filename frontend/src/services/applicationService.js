const API_URL = process.env.REACT_APP_API_URL + "/api/applications";

export async function getApplications() {
  const res = await fetch(`${API_URL}/list`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

export async function createApplication(data) {
  const res = await fetch(`${API_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create application");
  return res.json();
}

export async function getApplication(id) {
  const res = await fetch(`${API_URL}/${id}`, { credentials: "include" }); 
  if (!res.ok) throw new Error("Failed to fetch application");
  return res.json();
}

export async function updateApplication(id, data) {
  const res = await fetch(`${API_URL}/update/${id}`, {  
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update application");
  return res.json();
}

export async function deleteApplication(id) {
  const res = await fetch(`${API_URL}/delete/${id}`, {  
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete application");
  return res.json();
}
