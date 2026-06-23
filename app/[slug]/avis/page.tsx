'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams } from 'next/navigation';
export default function Avis() {
  const params = useParams();
  const slug = params.slug as string;
  const [avisOuvert, setAvisOuvert] = useState(false);
  const [modeLivraison, setModeLivraison] = useState(false);
  const [config, setConfig] = useState({ nom: '', couleur_principale: '#f97316', lien_google: '' });
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setModeLivraison(p.get('mode') === 'livraison');
    const charger = async () => {
      const { data: restau } = await supabase.from('restaurants').select('id').eq('slug', slug).single();
      if (!restau) return;
      const { data } = await supabase.from('config').select('*').eq('restaurant_id', restau.id).single();
      if (data) setConfig(data);
    };
    charger();
    setTimeout(() => setVisible(true), 100);
  }, []);
  const ouvrirAvis = () => {
    window.open(config.lien_google || "https://search.google.com/local/writereview", "_blank");
    setAvisOuvert(true);
  };
  const styleBoutonGoogle = {
    width:'100%',
    background:'#4285f4',
    color:'white',
    fontWeight:'bold',
    padding:'22px',
    borderRadius:'16px',
    border:'none',
    cursor:'pointer',
    fontSize:'18px',
    marginBottom:'8px',
    boxShadow:'0 8px 24px rgba(66,133,244,0.4)',
    animation:'pulse 2s infinite'
  };
  const styleBoutonRoue = {
    display:'block',
    background:config.couleur_principale,
    color:'white',
    fontWeight:'bold',
    padding:'18px',
    borderRadius:'16px',
    textDecoration:'none',
    fontSize:'18px',
    boxShadow:'0 8px 24px rgba(249,115,22,0.4)',
    animation:'pulse 2s infinite'
  };
  const styleLienPasser = {
    display:'block',
    fontSize:'11px',
    marginTop:'10px',
    textDecoration:'none',
    padding:'4px'
  };
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#ffedd5 0%,#fed7aa 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',colorScheme:'light'}}>
      <div style={{textAlign:'center',marginBottom:'32px',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(-20px)',transition:'all 0.6s ease'}}>
        <div style={{fontSize:'56px',animation:'bounce 1s infinite'}}>⭐</div>
        <h1 style={{fontSize:'30px',fontWeight:'bold',color:config.couleur_principale,margin:'0'}}>{config.nom}</h1>
        <p style={{color:'#6b7280',marginTop:'8px'}}>Votre avis compte ❤️</p>
      </div>
      <div style={{background:'white',borderRadius:'32px',boxShadow:'0 20px 60px rgba(0,0,0,0.12)',padding:'40px',maxWidth:'420px',width:'100%',textAlign:'center',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(20px)',transition:'all 0.6s ease 0.2s',colorScheme:'light'}}>
        <div style={{fontSize:'52px',marginBottom:'8px'}}>🍽️</div>
        <h2 style={{fontSize:'22px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>Vous avez aime votre repas ?</h2>
        <p style={{color:'#6b7280',margin:'12px 0 20px',lineHeight:'1.6'}}>Laissez un avis et debloquez la roue 🎡 — ca prend 30 secondes !</p>
        <button onClick={ouvrirAvis} style={styleBoutonGoogle}>⭐ Laisser un avis Google</button>
        {avisOuvert ? (
          <a href={modeLivraison ? '/'+slug+'/roue?mode=livraison' : '/'+slug+'/roue'} style={styleBoutonRoue}>🎡 Tourner la roue !</a>
        ) : (
          <a href={modeLivraison ? '/'+slug+'/roue?mode=livraison' : '/'+slug+'/roue'} style={styleLienPasser} className="lien-passer">(passer)</a>
        )}
      </div>
      <style>{`
        .lien-passer { color: #e5e7eb; }
        @media (prefers-color-scheme: dark) { .lien-passer { color: #6b7280; } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}
