const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

export const getToken = () => localStorage.getItem("token")
export const saveToken = (t) => localStorage.setItem("token", t)
export const removeToken = () => localStorage.removeItem("token")

const authH = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
})

export const apiSignup = async (email, password) => {
  const response = await fetch(`${BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  return response.json()
}

export const apiLogin = async (email, password) => {
  const response = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  return response.json()
}

export const apiGetPosts = async () => (await fetch(`${BASE}/posts`)).json()

export const apiCreatePost = async (title, content) => {
  const response = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: authH(),
    body: JSON.stringify({ title, content })
  })
  return response.json()
}

export const apiDeletePost = async (id) => {
  const response = await fetch(`${BASE}/posts/${id}`, {
    method: "DELETE",
    headers: authH()
  })
  return response.json()
}
