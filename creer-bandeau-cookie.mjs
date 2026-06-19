import { writeFileSync, mkdirSync } from "fs";

const content = `"use client";
import { useState, useEffect } from "react";

export default function BandeauCookie() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consentement = document.cookie.split(";").find((c) => c.trim().startsWith("consentement_cookie="));
    if (!consentement) setVisible(true);
  }, []);

  const accepter = () => {
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 1);
    document.cookie = "consentement_cookie=accepte; expires=" + exp.toUTCString() + "; path=/";
    setVisible(false);
  };

  const refuser = () => {
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 1);
    document.cookie = "consentement_cookie=refuse; expires=" + exp.toUTCString() + "; path=/";
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#1f2937",color:"white",padding:"16px",zIndex:9999,display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"center",gap:"12px",boxShadow:"0 -4px 20px rgba(0,0,0,0.2)"}}>
      <p style={{margin:0,fontSize:"14px",maxWidth:"500px",textAlign:"center"}}>
        Ce site utilise un cookie pour eviter les participations multiples au jeu. Vous pouvez l'accepter ou le refuser.
      </p>
      <div style={{display:"flex",gap:"8px"}}>
        <button onClick={refuser} style={{background:"transparent",color:"white",border:"1px solid white",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>
          Refuser
        </button>
        <button onClick={accepter} style={{background:"#f97316",color:"white",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px",fontWeight:"bold"}}>
          J'accepte
        </button>
      </div>
    </div>
  );
}
`;

mkdirSync("app/components", { recursive: true });
writeFileSync("app/components/BandeauCookie.tsx", content, "utf8");
console.log("OK - app/components/BandeauCookie.tsx cree");