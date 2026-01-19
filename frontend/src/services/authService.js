const API_URL = process.env.REACT_APP_API_URL + "/api/auth";

/**
 * Registers a new user
 * @param {Object} payload - { username, email, password }
 * @returns {Object} response data
 */
export const register = async (payload) => {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    return data;
  } catch (err) {
    console.error("Register error:", err);
    throw err;
  }
};

/**
 * Logs in a user
 * @param {Object} payload - { email, password }
 * @returns {Object} response data
 */
export const login = async (payload) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data;
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
};

export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get user");
    return data;
  } catch (err) {
    console.error("Get user error:", err);
    return null;
  }
};