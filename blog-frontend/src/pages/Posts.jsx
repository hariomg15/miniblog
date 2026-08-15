import { useState, useEffect } from "react"
import {
  apiGetPosts,
  apiGetCategories,
  apiCreatePost,
  apiUpdatePost,
  apiDeletePost,
  apiGetMe,
  removeToken
} from "../api"

export default function Posts({ onLogout }) {
  const [posts, setPosts]     = useState([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const [totalPosts, setTotalPosts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [title, setTitle]     = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("General")
  const [categories, setCategories] = useState(["General"])
  const [msg, setMsg]         = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editCategory, setEditCategory] = useState("General")

  useEffect(() => {
    load()
    loadMe()
    loadCategories()
  }, [])

  const load = async (
    nextPage = page,
    nextSearch = searchText,
    nextFilter = filterCategory
  ) => {
    const d = await apiGetPosts(nextSearch, nextFilter, nextPage, pageSize)
    if (Array.isArray(d?.items)) {
      setPosts(d.items)
      setTotalPosts(d.total || 0)
      setTotalPages(d.total_pages || 1)
      setPage(d.page || nextPage)
    }
  }

  useEffect(() => {
    load()
  }, [page])

  const loadMe = async () => {
    const d = await apiGetMe()
    if (d?.id) setCurrentUser(d)
  }

  const loadCategories = async () => {
    const d = await apiGetCategories()
    if (Array.isArray(d) && d.length > 0) {
      setCategories(d)
      setCategory("General")
      setEditCategory("General")
    }
  }

  const create = async () => {
    if (!title || !content) { setMsg("Please enter both title and content"); return }
    const d = await apiCreatePost(title, content, category)
    if (d.id) {
      setTitle("")
      setContent("")
      setCategory("General")
      setMsg("Post created successfully")
      load(1)
    }
    else setMsg(d.detail || "Please sign in before creating a post")
  }

  const del = async (id) => {
    const d = await apiDeletePost(id)
    setMsg(d.message || d.detail || "Error")
    load()
  }

  const startEdit = (post) => {
    setEditingId(post.id)
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditCategory(post.category)
    setMsg("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle("")
    setEditContent("")
    setEditCategory("General")
  }

  const saveEdit = async (id) => {
    if (!editTitle || !editContent) {
      setMsg("Please enter both title and content before saving")
      return
    }
    const d = await apiUpdatePost(id, editTitle, editContent, editCategory)
    if (d.id) {
      setMsg("Post updated successfully")
      cancelEdit()
      load()
    } else {
      setMsg(d.detail || "The post could not be updated")
    }
  }

  const logout = () => { removeToken(); onLogout() }

  const runSearch = () => {
    load(1, searchText, filterCategory)
  }

  const resetSearch = async () => {
    setSearchText("")
    setFilterCategory("All")
    load(1, "", "All")
  }

  return (
    <div style={C.page}>
      <div style={C.topbar}>
        <div>
          <h2 style={{margin:"0 0 6px",fontSize:"30px"}}>Blog Management System</h2>
          <p style={C.subtitle}>Create, organize, and manage posts from one workspace</p>
        </div>
        <button style={C.logoutBtn} onClick={logout}>Logout</button>
      </div>

      <div style={C.accountPanel}>
        <div>
          <p style={C.panelLabel}>Current Account</p>
          <h3 style={C.panelValue}>
            {currentUser ? currentUser.email : "Loading account details..."}
          </h3>
        </div>
        <div style={C.badgeGroup}>
          <span style={C.roleBadge}>
            {currentUser ? `Role: ${currentUser.role}` : "Role: Loading"}
          </span>
          <span style={C.statsBadge}>
            Total Posts: {totalPosts}
          </span>
        </div>
      </div>

      <div style={C.searchPanel}>
        <div style={C.searchGrid}>
          <input
            style={C.inp}
            placeholder="Search by title, content, or category"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <select
            style={C.select}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <div style={C.searchActions}>
            <button style={C.btn} onClick={runSearch}>Search</button>
            <button style={C.cancelBtn} onClick={resetSearch}>Reset</button>
          </div>
        </div>
      </div>

      <div style={C.createBox}>
        <h3 style={C.sectionTitle}>Create New Post</h3>
        <input style={C.inp} placeholder="Title"
          value={title} onChange={e => setTitle(e.target.value)} />
        <select style={C.select} value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(item => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <textarea style={{...C.inp, height:"80px", resize:"vertical"}}
          placeholder="Write your content here..."
          value={content} onChange={e => setContent(e.target.value)} />
        <button style={C.btn} onClick={create}>Publish Post</button>
        {msg && <p style={C.msg}>{msg}</p>}
      </div>

      <div>
        {posts.length === 0
          ? <p style={C.emptyState}>No posts available yet</p>
          : posts.map(p => (
            <div key={p.id} style={C.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <h3 style={C.cardTitle}>{p.title}</h3>
                  <div style={C.metaRow}>
                    <span style={C.postMeta}>Post ID: {p.id}</span>
                    <span style={C.postMeta}>Author ID: {p.user_id}</span>
                    <span style={C.categoryBadge}>{p.category}</span>
                    {currentUser && currentUser.id === p.user_id && (
                      <span style={C.ownerBadge}>Your Post</span>
                    )}
                  </div>
                </div>
                <div style={C.actionRow}>
                  <button style={C.editBtn} onClick={() => startEdit(p)}>Edit</button>
                  <button style={C.delBtn} onClick={() => del(p.id)}>Delete</button>
                </div>
              </div>
              {editingId === p.id ? (
                <div style={C.editBox}>
                  <input
                    style={C.inp}
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Title"
                  />
                  <select
                    style={C.select}
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                  >
                    {categories.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <textarea
                    style={{...C.inp, height:"90px", resize:"vertical", marginBottom:"12px"}}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    placeholder="Content"
                  />
                  <div style={C.actionRow}>
                    <button style={C.btn} onClick={() => saveEdit(p.id)}>Save</button>
                    <button style={C.cancelBtn} onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p style={C.cardContent}>{p.content}</p>
              )}
            </div>
          ))
        }
      </div>

      <div style={C.paginationPanel}>
        <p style={C.pageInfo}>
          Page {page} of {totalPages}
        </p>
        <div style={C.searchActions}>
          <button
            style={C.cancelBtn}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <button
            style={C.btn}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

const C = {
  page:      {maxWidth:"920px",margin:"0 auto",padding:"40px 20px 56px",fontFamily:"Trebuchet MS, Segoe UI, sans-serif",color:"#2d2345"},
  topbar:    {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"22px",gap:"16px"},
  subtitle:  {margin:0,color:"#726d8b",fontSize:"14px"},
  accountPanel: {display:"flex",justifyContent:"space-between",alignItems:"center",gap:"16px",padding:"22px 24px",marginBottom:"24px",borderRadius:"24px",background:"linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(255,244,255,0.9) 46%, rgba(241,244,255,0.92) 100%)",border:"1px solid rgba(220,210,255,0.95)",boxShadow:"0 24px 60px -30px rgba(90, 62, 158, 0.45)",backdropFilter:"blur(18px)"},
  searchPanel:{border:"1px solid rgba(223,218,255,0.95)",borderRadius:"24px",padding:"20px 24px",marginBottom:"24px",background:"rgba(255,255,255,0.84)",boxShadow:"0 24px 50px -34px rgba(61, 44, 110, 0.22)",backdropFilter:"blur(16px)"},
  paginationPanel:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"14px",marginTop:"20px",padding:"18px 22px",borderRadius:"20px",background:"rgba(255,255,255,0.8)",border:"1px solid rgba(223,218,255,0.9)"},
  pageInfo:{margin:0,fontSize:"14px",fontWeight:"700",color:"#53457b"},
  searchGrid:{display:"grid",gridTemplateColumns:"2fr 1fr auto",gap:"12px",alignItems:"center"},
  searchActions:{display:"flex",gap:"10px",alignItems:"center"},
  panelLabel:{margin:"0 0 6px",fontSize:"12px",letterSpacing:"0.08em",textTransform:"uppercase",color:"#776d9a"},
  panelValue:{margin:0,fontSize:"20px",color:"#241b3e"},
  badgeGroup:{display:"flex",gap:"10px",flexWrap:"wrap",justifyContent:"flex-end"},
  roleBadge: {padding:"10px 16px",borderRadius:"999px",background:"linear-gradient(135deg, #7148ff 0%, #ff4fa4 100%)",color:"#fff",fontSize:"13px",fontWeight:"700",boxShadow:"0 14px 30px -18px rgba(113, 72, 255, 0.8)"},
  statsBadge:{padding:"10px 16px",borderRadius:"999px",background:"#ffffff",color:"#34416d",fontSize:"13px",fontWeight:"700",border:"1px solid #dfd8ff"},
  createBox: {border:"1px solid rgba(223,218,255,0.95)",borderRadius:"24px",padding:"24px",marginBottom:"30px",background:"rgba(255,255,255,0.9)",boxShadow:"0 24px 50px -34px rgba(61, 44, 110, 0.35)",backdropFilter:"blur(18px)"},
  sectionTitle:{margin:"0 0 16px",fontSize:"18px",color:"#251b43"},
  editBox:   {marginTop:"8px"},
  actionRow: {display:"flex",gap:"8px",alignItems:"center"},
  metaRow:   {display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap",marginBottom:"10px"},
  postMeta:  {fontSize:"11px",color:"#7b7b92",background:"#f3f4f8",padding:"4px 8px",borderRadius:"999px"},
  categoryBadge:{fontSize:"11px",color:"#6a4200",background:"#fff1c8",padding:"4px 9px",borderRadius:"999px",fontWeight:"700"},
  ownerBadge:{fontSize:"11px",color:"#0d6b44",background:"#e9fff4",padding:"4px 8px",borderRadius:"999px",fontWeight:"700"},
  inp:       {display:"block",width:"100%",padding:"13px 14px",marginBottom:"12px",border:"1px solid #dfd7ff",borderRadius:"14px",fontSize:"14px",boxSizing:"border-box",background:"#ffffff",color:"#241b3e",outline:"none"},
  select:    {display:"block",width:"100%",padding:"13px 14px",marginBottom:"12px",border:"1px solid #dfd7ff",borderRadius:"14px",fontSize:"14px",boxSizing:"border-box",background:"#ffffff",color:"#241b3e",outline:"none"},
  btn:       {padding:"12px 24px",background:"linear-gradient(135deg, #6f52ff 0%, #ff4ea3 100%)",color:"#fff",border:"none",borderRadius:"14px",cursor:"pointer",fontSize:"14px",fontWeight:"700",boxShadow:"0 18px 40px -20px rgba(111, 82, 255, 0.9)"},
  card:      {border:"1px solid rgba(229,222,255,0.95)",borderRadius:"24px",padding:"22px",marginBottom:"16px",background:"rgba(255,255,255,0.92)",boxShadow:"0 24px 50px -34px rgba(61, 44, 110, 0.35)",backdropFilter:"blur(18px)"},
  cardTitle: {margin:"0 0 8px",fontSize:"18px",color:"#231a3f"},
  cardContent:{margin:0,color:"#5a556f",fontSize:"14px",lineHeight:"1.8"},
  msg:       {fontSize:"13px",color:"#5f46d8",marginTop:"10px",fontWeight:"600"},
  emptyState:{textAlign:"center",color:"#6e6887",marginTop:"44px",padding:"28px",borderRadius:"20px",background:"rgba(255,255,255,0.75)",border:"1px solid rgba(223,218,255,0.9)"},
  editBtn:   {padding:"7px 14px",background:"#f0edff",color:"#3150d4",border:"1px solid #d4d8ff",borderRadius:"10px",cursor:"pointer",fontSize:"12px",fontWeight:"700"},
  delBtn:    {padding:"7px 14px",background:"#fff1f3",color:"#d11f59",border:"1px solid #ffc7d5",borderRadius:"10px",cursor:"pointer",fontSize:"12px",fontWeight:"700"},
  cancelBtn: {padding:"12px 22px",background:"#fff",color:"#4a4562",border:"1px solid #d9d1f5",borderRadius:"14px",cursor:"pointer",fontSize:"14px",fontWeight:"700"},
  logoutBtn: {padding:"10px 18px",background:"rgba(255,255,255,0.72)",border:"1px solid rgba(223,218,255,0.95)",borderRadius:"14px",cursor:"pointer",fontSize:"13px",fontWeight:"700",color:"#33274f"}
}
