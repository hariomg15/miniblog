import { useState, useEffect } from "react"
import { apiGetPosts, apiCreatePost, apiDeletePost, removeToken } from "../api"

export default function Posts({ onLogout }) {
  const [posts, setPosts]     = useState([])
  const [title, setTitle]     = useState("")
  const [content, setContent] = useState("")
  const [msg, setMsg]         = useState("")

  useEffect(() => { load() }, [])

  const load = async () => {
    const d = await apiGetPosts()
    if (Array.isArray(d)) setPosts(d)
  }

  const create = async () => {
    if (!title || !content) { setMsg("Title aur content dono bharo"); return }
    const d = await apiCreatePost(title, content)
    if (d.id) { setTitle(""); setContent(""); setMsg("Post ban gayi!"); load() }
    else setMsg(d.detail || "Error — login karo pehle")
  }

  const del = async (id) => {
    const d = await apiDeletePost(id)
    setMsg(d.message || d.detail || "Error")
    load()
  }

  const logout = () => { removeToken(); onLogout() }

  return (
    <div style={C.page}>

      <div style={C.topbar}>
        <h2 style={{margin:0,fontSize:"22px"}}>Mini Blog</h2>
        <button style={C.logoutBtn} onClick={logout}>Logout</button>
      </div>

      <div style={C.createBox}>
        <h3 style={{margin:"0 0 14px",fontSize:"16px"}}>Naya post</h3>
        <input style={C.inp} placeholder="Title"
          value={title} onChange={e => setTitle(e.target.value)} />
        <textarea style={{...C.inp, height:"80px", resize:"vertical"}}
          placeholder="Kuch likho..."
          value={content} onChange={e => setContent(e.target.value)} />
        <button style={C.btn} onClick={create}>Post karo</button>
        {msg && <p style={{fontSize:"13px",color:"#534AB7",marginTop:"8px"}}>{msg}</p>}
      </div>

      <div>
        {posts.length === 0
          ? <p style={{textAlign:"center",color:"#999",marginTop:"40px"}}>Koi post nahi abhi</p>
          : posts.map(p => (
            <div key={p.id} style={C.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <h3 style={{margin:"0 0 6px",fontSize:"16px"}}>{p.title}</h3>
                <button style={C.delBtn} onClick={() => del(p.id)}>Delete</button>
              </div>
              <p style={{margin:0,color:"#555",fontSize:"14px",lineHeight:"1.6"}}>{p.content}</p>
              <span style={{fontSize:"11px",color:"#aaa",marginTop:"6px",display:"block"}}>#{p.id}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}

const C = {
  page:      {maxWidth:"640px",margin:"0 auto",padding:"24px 16px",fontFamily:"sans-serif"},
  topbar:    {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px",paddingBottom:"16px",borderBottom:"1px solid #eee"},
  createBox: {border:"1px solid #e0e0e0",borderRadius:"12px",padding:"18px",marginBottom:"28px",background:"#fafafa"},
  inp:       {display:"block",width:"100%",padding:"10px 12px",marginBottom:"10px",border:"1px solid #ddd",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box"},
  btn:       {padding:"10px 22px",background:"#534AB7",color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:"14px"},
  card:      {border:"1px solid #eee",borderRadius:"10px",padding:"16px",marginBottom:"12px",background:"#fff"},
  delBtn:    {padding:"4px 12px",background:"#fff0f0",color:"#d00",border:"1px solid #fcc",borderRadius:"6px",cursor:"pointer",fontSize:"12px"},
  logoutBtn: {padding:"7px 16px",background:"transparent",border:"1px solid #ccc",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}
}