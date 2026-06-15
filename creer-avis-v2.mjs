import { writeFileSync } from 'fs';

const code = `"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Avis() {
  const [peutJouer, setPeutJouer] = useState(false);
  const [avisOuvert, setAvisOuvert] = useState(false);
  const [lienGoogle, setLienGoogle] = useState('');

  useEffect(() => {
    const charger = async () => {
      const { data } = await supabase.from('config').select('lien_google').single();
      if (data) setLienGoogle(data.lien_google);
    };
    charger();
  }, []);

  useEffect(() => {
    if (!avisOuvert) return;
    const timeout = setTimeout(() => setPeutJouer(true), 30000);
    return () => clearTimeout(timeout);
  }, [avisOuvert]);

  const ouvrirAvis = () => {
    window.open(lienGoogle || 'https://search.google.com/local/writereview', '_blank');
    setAvisOuvert(true);
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(to bottom,#fff7ed,#ffffff)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{background:'white',borderRadius:'24px',boxShadow:'0 10px 40px rgba(0,0,0,0.1)',padding:'40px',maxWidth:'380px',width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>⭐</div>
        <h1 style={{fontSize:'22px',fontWeight:'bold',color:'#1f2937',marginBottom:'12px'}}>Laissez votre avis Google</h1>
        <p style={{color:'#6b7280',marginBottom:'32px',lineHeight:'1.6'}}>Cliquez ci-dessous, laissez votre avis, puis revenez tourner la roue !</p>

        {!avisOuvert ? (
          <button onClick={ouvrirAvis} style={{display:'block',width:'100%',background:'#4285f4',color:'white',fontWeight:'bold',padding:'16px 24px',borderRadius:'16px',fontSize:'18px',border:'none',cursor:'pointer'}}>Ouvrir Google Avis</button>
        ) : !peutJouer ? (
          <div>
            <div style={{width:'48px',height:'48px',border:'5px solid #f3f4f6',borderTop:'5px solid #f97316',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px'}}></div>
            <p style={{color:'#6b7280',fontWeight:'500'}}>Verification de votre avis en cours...</p>
            <p style={{color:'#9ca3af',fontSize:'13px',marginTop:'8px'}}>Merci de patienter quelques instants</p>
            <style>{\`@keyframes spin { to { transform: rotate(360deg); } }\`}</style>
          </div>
        ) : (
          <a href='/roue' style={{display:'block',background:'#f97316',color:'white',fontWeight:'bold',padding:'16px 24px',borderRadius:'16px',fontSize:'18px',textDecoration:'none'}}>Tourner la roue !</a>
        )}
      </div>
    </div>
  );
}`;

writeFileSync('app/avis/page.tsx', code);
console.log('Fichier cree avec succes !');