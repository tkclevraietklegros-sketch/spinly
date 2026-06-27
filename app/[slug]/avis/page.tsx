'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

function Etoiles() {
  const [etoiles, setEtoiles] = useState<any[]>([]);
  useEffect(() => {
    setEtoiles(Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      taille: Math.random() * 2.5 + 0.5,
      duree: Math.random() * 3 + 2,
      delai: Math.random() * 4,
    })));
  }, []);
  if (etoiles.length === 0) return null;
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}>
      {etoiles.map(e => (
        <motion.div key={e.id} style={{position:'absolute',left:e.x+'%',top:e.y+'%',width:e.taille+'px',height:e.taille+'px',borderRadius:'50%',background:'white'}} animate={{opacity:[0,1,0]}} transition={{duration:e.duree,repeat:Infinity,delay:e.delai,ease:'easeInOut'}}/>
      ))}
    </div>
  );
}

export default function Avis() {
  const params = useParams();
  const slug = params.slug as string;
  const [avisOuvert, setAvisOuvert] = useState(false);
  const [modeLivraison, setModeLivraison] = useState(false);
  const [config, setConfig] = useState({ nom: '', couleur_principale: '#f97316', lien_google: '' });

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
  }, []);

  const ouvrirAvis = () => {
    window.open(config.lien_google || 'https://search.google.com/local/writereview', '_blank');
    setAvisOuvert(true);
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',colorScheme:'light',position:'relative',overflow:'hidden'}}>
      <Etoiles />
      <div style={{position:'absolute',top:'-100px',left:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(66,133,244,0.08) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-100px',right:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(249,115,22,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>

      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.6}} style={{textAlign:'center',marginBottom:'32px',position:'relative',zIndex:1}}>
        <motion.div animate={{y:[0,-8,0]}} transition={{duration:2,repeat:Infinity,ease:'easeInOut'}} style={{fontSize:'56px',marginBottom:'12px'}}>⭐</motion.div>
        <h1 style={{fontSize:'30px',fontWeight:'800',color:'white',margin:'0',letterSpacing:'-0.3px'}}>{config.nom}</h1>
        <p style={{color:'rgba(255,255,255,0.4)',marginTop:'8px'}}>Votre avis compte ❤️</p>
      </motion.div>

      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.2}} style={{background:'rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'32px',padding:'40px',maxWidth:'420px',width:'100%',textAlign:'center',position:'relative',zIndex:1}}>
        <div style={{fontSize:'52px',marginBottom:'12px'}}>🍽️</div>
        <h2 style={{fontSize:'22px',fontWeight:'800',color:'white',marginBottom:'8px'}}>Vous avez aime votre repas ?</h2>
        <p style={{color:'rgba(255,255,255,0.4)',margin:'12px 0 24px',lineHeight:'1.6'}}>Laissez un avis et debloquez la roue 🎡 — ca prend 30 secondes !</p>

        <motion.button
          onClick={ouvrirAvis}
          whileHover={{scale:1.03}}
          whileTap={{scale:0.97}}
          animate={{boxShadow:['0 8px 24px rgba(66,133,244,0.3)','0 8px 40px rgba(66,133,244,0.6)','0 8px 24px rgba(66,133,244,0.3)']}}
          transition={{duration:2,repeat:Infinity}}
          style={{width:'100%',background:'linear-gradient(135deg,#4285f4,#1a73e8)',color:'white',fontWeight:'800',padding:'22px',borderRadius:'18px',border:'none',cursor:'pointer',fontSize:'18px',marginBottom:'12px',letterSpacing:'0.3px'}}
        >
          ⭐ Laisser un avis Google
        </motion.button>

        {avisOuvert ? (
          <motion.a
            href={modeLivraison ? '/'+slug+'/roue?mode=livraison' : '/'+slug+'/roue'}
            initial={{opacity:0,scale:0.9}}
            animate={{opacity:1,scale:1}}
            whileHover={{scale:1.03}}
            whileTap={{scale:0.97}}
            style={{display:'block',background:'linear-gradient(135deg,#f97316,#ea580c)',color:'white',fontWeight:'800',padding:'18px',borderRadius:'18px',textDecoration:'none',fontSize:'18px',boxShadow:'0 8px 24px rgba(249,115,22,0.4)'}}
          >
            🎡 Tourner la roue !
          </motion.a>
        ) : (
          <a href={modeLivraison ? '/'+slug+'/roue?mode=livraison' : '/'+slug+'/roue'} className="lien-passer" style={{display:'block',fontSize:'11px',marginTop:'8px',textDecoration:'none',padding:'4px',color:'rgba(255,255,255,0.3)',opacity:0.25}}>
            (passer)
          </a>
        )}
      </motion.div>
      <style>{`.lien-passer { opacity: 0.25; } @media (prefers-color-scheme: dark) { .lien-passer { color: rgba(255,255,255,0.3); } }`}</style>
    </div>
  );
}