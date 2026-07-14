const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const BASE = `${API_BASE_URL}/api/v1`;

export const api = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("wm-token");
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res = await fetch(`${BASE}${endpoint}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};