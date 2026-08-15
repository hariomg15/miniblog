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

export const apiGetPosts = async (search = "", category = "All", page = 1, pageSize = 5) => {
  const params = new URLSearchParams()
  if (search.trim()) params.set("q", search.trim())
  if (category && category !== "All") params.set("category", category)
  params.set("page", String(page))
  params.set("page_size", String(pageSize))

  const queryString = params.toString()
  const url = queryString ? `${BASE}/posts?${queryString}` : `${BASE}/posts`
  return (await fetch(url)).json()
}

export const apiGetCategories = async () => (await fetch(`${BASE}/categories`)).json()

export const apiGetMe = async () => {
  const response = await fetch(`${BASE}/me`, {
    headers: authH()
  })
  return response.json()
}

export const apiCreatePost = async (title, content, category) => {
  const response = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: authH(),
    body: JSON.stringify({ title, content, category })
  })
  return response.json()
}

export const apiUpdatePost = async (id, title, content, category) => {
  const response = await fetch(`${BASE}/posts/${id}`, {
    method: "PUT",
    headers: authH(),
    body: JSON.stringify({ title, content, category, published: true })
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
