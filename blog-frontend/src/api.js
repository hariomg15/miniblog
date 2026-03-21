const BASE = "http://localhost:8000"

export const getToken    = () => localStorage.getItem("token")
export const saveToken   = (t) => localStorage.setItem("token", t)
export const removeToken = () => localStorage.removeItem("token")

const authH = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`
})

export const apiSignup = async (email, password) => {
  const r = await fetch(`${BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  return r.json()
}

export const apiLogin = async (email, password) => {
  const r = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  return r.json()
}

export const apiGetPosts    = async () => (await fetch(`${BASE}/posts`)).json()

export const apiCreatePost  = async (title, content) => {
  const r = await fetch(`${BASE}/posts`, {
    method: "POST", headers: authH(),
    body: JSON.stringify({ title, content })
  })
  return r.json()
}

export const apiDeletePost  = async (id) => {
  const r = await fetch(`${BASE}/posts/${id}`, {
    method: "DELETE", headers: authH()
  })
  return r.json()
}
