"use client";
import { useState, useEffect } from "react";
export default function Avis() {
  const [timer, setTimer] = useState(30);
  const [peutJouer, setPeutJouer] = useState(false);
  const [avisOuvert, setAvisOuvert] = useState(false);
  useEffect(() => {
    if (!avisOuvert) return;
    if (timer === 0) { setPeutJouer(true); return; }
    const interval = setInterval(() => { setTimer((t) => t - 1); }, 1000);
    return () => clearInterval(interval);
  }, [timer, avisOuvert]);
  const ouvrirAvis = () => {
    window.open("https://search.google.com/local/writereview?placeid=VOTRE_ID", "_blank");
    setAvisOuvert(true);
  };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(to bottom, #fff7ed, #ffffff)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{background:"white",borderRadius:"24px",boxShadow:"0 10px 40px rgba(0,0,0,0.1)",padding:"40px",maxWidth:"380px",width:"100%",textAlign:"center"}}>
        <h1 style={{fontSize:"22px",fontWeight:"bold",color:"#1f2937",marginBottom:"12px"}}>Laissez votre avis Google</h1>
        <p style={{color:"#6b7280",marginBottom:"32px"}}>Cliquez ci-dessous, laissez votre avis, puis revenez tourner la roue !</p>
        {!avisOuvert ? (
          <button onClick={ouvrirAvis} style={{width:"100%",background:"#4285f4",color:"white",fontWeight:"bold",padding:"16px",borderRadius:"16px",fontSize:"18px",border:"none",cursor:"pointer"}}>Ouvrir Google Avis</button>
        ) : !peutJouer ? (
          <div>
            <p style={{color:"#6b7280",fontWeight:"500"}}>Verification de votre avis en cours...</p>
            <p style={{color:"#9ca3af",fontSize:"13px",marginTop:"8px"}}>Merci de patienter quelques instants</p>
          </div>
        ) : (
          <a href="/roue" style={{display:"block",background:"#f97316",color:"white",fontWeight:"bold",padding:"16px",borderRadius:"16px",fontSize:"18px",textDecoration:"none"}}>Tourner la roue !</a>
        )}
      </div>
    </div>
  );
}
