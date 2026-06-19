import { writeFileSync } from "fs";

const content = `"use client";

import { useState } from "react";

export default function Avis() {
  const [avisOuvert, setAvisOuvert] = useState(false);

  const ouvrirAvis = () => {
    window.open(
      "https://search.google.com/local/writereview?placeid=ChIJEXNs5GO5kUcRT8HixXp-leY",
      "_blank"
    );
    setAvisOuvert(true);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(to bottom, #fff7ed, #ffffff)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{background:"white",borderRadius:"24px",boxShadow:"0 10px 40px rgba(0,0,0,0.1)",padding:"40px",maxWidth:"380px",width:"100%",textAlign:"center"}}>
        
        <div style={{fontSize:"48px",marginBottom:"16px"}}>⭐</div>

        <h1 style={{fontSize:"22px",fontWeight:"bold",color:"#1f2937",marginBottom:"12px"}}>
          Votre avis compte pour nous !
        </h1>

        <p style={{color:"#6b7280",marginBottom:"32px",lineHeight:"1.6"}}>
          Si vous avez apprécié votre expérience, nous serions ravis de lire votre avis Google.
        </p>

        <button
          onClick={ouvrirAvis}
          style={{width:"100%",background:"#4285f4",color:"white",fontWeight:"bold",padding:"16px",borderRadius:"16px",fontSize:"17px",border:"none",cursor:"pointer",marginBottom:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"}}
        >
          <span>G</span> Laisser un avis Google
        </button>

        {avisOuvert && (
          <>
            <p style={{color:"#9ca3af",fontSize:"13px",marginBottom:"12px"}}>
              — ou —
            </p>

            <a
              href="/roue"
              style={{display:"block",background:"#f97316",color:"white",fontWeight:"bold",padding:"16px",borderRadius:"16px",fontSize:"17px",textDecoration:"none"}}
            >
              🎡 Tourner la roue !
            </a>
          </>
        )}

      </div>
    </div>
  );
}
`;

writeFileSync("app/avis/page.tsx", content, "utf8");
console.log("OK - app/avis/page.tsx mis a jour");