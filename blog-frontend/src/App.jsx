import { useState } from "react"
import { getToken } from "./api"
import Signup from "./pages/Signup"
import Login  from "./pages/Login"
import Posts  from "./pages/Posts"

export default function App() {
  const [page, setPage] = useState(getToken() ? "posts" : "login")

  if (page === "signup")
    return <Signup onSwitch={setPage} />

  if (page === "login")
    return <Login onSwitch={setPage} onLogin={() => setPage("posts")} />

  return <Posts onLogout={() => setPage("login")} />
}