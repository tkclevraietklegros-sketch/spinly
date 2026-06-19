"use client";
import { useState } from "react";

export default function BandeauCookie() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#1f2937",color:"white",padding:"14px 16px",zIndex:9999,display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"center",gap:"12px",boxShadow:"0 -4px 20px rgba(0,0,0,0.2)"}}>
      <p style={{margin:0,fontSize:"13px",maxWidth:"560px",textAlign:"center",lineHeight:"1.5"}}>
        Ce site utilise des cookies techniques necessaires a son fonctionnement.{" "}
        <a href="/politique-confidentialite" style={{color:"#f97316",textDecoration:"underline"}}>
          En savoir plus
        </a>
      </p>
      <button
        onClick={() => setVisible(false)}
        style={{background:"#f97316",color:"white",border:"none",padding:"7px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px",fontWeight:"bold",whiteSpace:"nowrap"}}
      >
        OK
      </button>
    </div>
  );
}
