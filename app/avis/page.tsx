"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Avis() {
  const [peutJouer, setPeutJouer] = useState(false);
  const [avisOuvert, setAvisOuvert] = useState(false);
  const [lienGoogle, setLienGoogle] = useState('');
  const [config, setConfig] = useState({ couleur_principale: '#f97316' });
  const [secondes, setSecondes] = useState(30);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const charger = async () => {
      const { data } = await supabase.from('config').select('*').single();
      if (data) { setLienGoogle(data.lien_google); setConfig(data); }
    };
    charger();
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    if (!avisOuvert) return;
    const interval = setInterval(() => {
      setSecondes(s => {
        if (s <= 1) { clearInterval(interval); setPeutJouer(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [avisOuvert]);

  const ouvrirAvis = () => {
    window.open(lienGoogle || 'https://search.google.com/local/writereview', '_blank');
    setAvisOuvert(true);
  };

  const circonference = 283;

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#fff7ed 0%,#ffedd5 50%,#ffffff 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      
      <div style={{textAlign:'center',marginBottom:'32px',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(-20px)',transition:'all 0.6s ease'}}>
        <div style={{fontSize:'48px',marginBottom:'8px'}}>&#11088;</div>
        <h1 style={{fontSize:'28px',fontWeight:'bold',color:'#1f2937',margin:'0'}}>Votre avis compte !</h1>
        <p style={{color:'#6b7280',marginTop:'8px',fontSize:'16px'}}>2 minutes pour gagner un cadeau</p>
      </div>

      <div style={{background:'white',borderRadius:'32px',boxShadow:'0 20px 60px rgba(0,0,0,0.12)',padding:'40px',maxWidth:'400px',width:'100%',textAlign:'center',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(20px)',transition:'all 0.6s ease 0.2s'}}>
        
        {!avisOuvert ? (
          <div>
            <div style={{background:'#fff7ed',borderRadius:'16px',padding:'20px',marginBottom:'28px'}}>
              <p style={{color:'#1f2937',fontWeight:'500',lineHeight:'1.7',margin:'0'}}>
                1. Cliquez sur le bouton ci-dessous<br/>
                2. Laissez votre avis Google<br/>
                3. Revenez tourner la roue et gagner !
              </p>
            </div>
            <button onClick={ouvrirAvis} style={{display:'block',width:'100%',background:'#4285f4',color:'white',fontWeight:'bold',padding:'18px 24px',borderRadius:'16px',fontSize:'18px',border:'none',cursor:'pointer',boxShadow:'0 8px 24px rgba(66,133,244,0.35)'}}>
              Ouvrir Google Avis
            </button>
          </div>
        ) : !peutJouer ? (
          <div>
            <div style={{position:'relative',width:'100px',height:'100px',margin:'0 auto 24px'}}>
              <svg viewBox="0 0 100 100" style={{width:'100px',height:'100px',transform:'rotate(-90deg)'}}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
                <circle cx="50" cy="50" r="45" fill="none" stroke={config.couleur_principale} strokeWidth="8"
                  strokeDasharray={circonference}
                  strokeDashoffset={circonference * secondes / 30}
                  style={{transition:'stroke-dashoffset 1s linear'}}/>
              </svg>
              <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:'24px',fontWeight:'bold',color:config.couleur_principale}}>{secondes}</div>
            </div>
            <p style={{color:'#1f2937',fontWeight:'600',fontSize:'16px',marginBottom:'8px'}}>Merci pour votre avis !</p>
            <p style={{color:'#6b7280',fontSize:'14px'}}>La roue sera disponible dans {secondes} secondes...</p>
          </div>
        ) : (
          <div>
            <div style={{fontSize:'56px',marginBottom:'16px'}}>&#127905;</div>
            <h2 style={{fontSize:'22px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>C est parti !</h2>
            <p style={{color:'#6b7280',marginBottom:'24px'}}>La roue vous attend, bonne chance !</p>
            <a href='/roue' style={{display:'block',background:config.couleur_principale,color:'white',fontWeight:'bold',padding:'18px 24px',borderRadius:'16px',fontSize:'18px',textDecoration:'none',boxShadow:'0 8px 24px rgba(249,115,22,0.35)'}}>
              Tourner la roue !
            </a>
          </div>
        )}
      </div>
    </div>
  );
}