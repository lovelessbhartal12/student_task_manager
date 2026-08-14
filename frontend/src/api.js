const API_BASE_URL = "/api/todos";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) {
        message = Array.isArray(data.detail)
          ? data.detail.map((error) => error.msg).join(", ")
          : data.detail;
      }
    } catch {
      // Response had no JSON body; keep the default message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const getTodos = () => request("");

export const getTodo = (id) => request(`/${id}`);

export const createTodo = (todo) =>
  request("", { method: "POST", body: JSON.stringify(todo) });

export const updateTodo = (id, todo) =>
  request(`/${id}`, { method: "PUT", body: JSON.stringify(todo) });

export const toggleTodo = (id) => request(`/${id}/complete`, { method: "PATCH" });

export const deleteTodo = (id) => request(`/${id}`, { method: "DELETE" });

export const getStats = () => request("/stats");