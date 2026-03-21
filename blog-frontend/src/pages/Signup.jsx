import { useState } from "react"
import { apiSignup } from "../api"

export default function Signup({ onSwitch }) {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg]           = useState("")
  const [ok, setOk]             = useState(false)

  const handle = async () => {
    if (!email || !password) { setMsg("Dono fields bharo"); return }
    const d = await apiSignup(email, password)
    if (d.id) {
      setOk(true)
      setMsg("Account ban gaya! Login karo.")
      setTimeout(() => onSwitch("login"), 1500)
    } else {
      setMsg(d.detail || "Error aaya")
    }
  }

  return (
    <div style={C.wrap}>
      <h2 style={C.h2}>Signup</h2>
      <input style={C.inp} placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} />
      <input style={C.inp} type="password" placeholder="Password"
        value={password} onChange={e => setPassword(e.target.value)} />
      <button style={C.btn} onClick={handle}>Account banao</button>
      {/* <button onClick={() => console.log("Button clicked!")}>
        Account banao
      </button> */}
      {msg && <p style={{...C.msg, color: ok ? "#1D9E75" : "#E24B4A"}}>{msg}</p>}
      <p style={C.link} onClick={() => onSwitch("login")}>
        Pehle se account hai? Login karo
      </p>
    </div>
  )
}

const C = {
  wrap: {maxWidth:"380px",margin:"80px auto",padding:"36px",border:"1px solid #e0e0e0",borderRadius:"14px",fontFamily:"sans-serif"},
  h2:   {margin:"0 0 22px",textAlign:"center",fontSize:"24px",color:"#222"},
  inp:  {display:"block",width:"100%",padding:"11px 12px",marginBottom:"12px",border:"1px solid #ccc",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box"},
  btn:  {width:"100%",padding:"11px",background:"#534AB7",color:"#fff",border:"none",borderRadius:"8px",fontSize:"14px",cursor:"pointer",marginBottom:"10px"},
  msg:  {textAlign:"center",fontSize:"13px",margin:"6px 0"},
  link: {textAlign:"center",marginTop:"14px",cursor:"pointer",color:"#534AB7",fontSize:"13px"}
}