import { writeFileSync } from 'fs';

const code = `'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [config, setConfig] = useState({ nom: 'Le Petit Bistrot', couleur_principale: '#f97316' });

  useEffect(() => {
    const charger = async () => {
      const { data } = await supabase.from('config').select('*').single();
      if (data) setConfig(data);
    };
    charger();
  }, []);

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(to bottom,#fff7ed,#ffffff)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{textAlign:'center',marginBottom:'40px'}}>
        <div style={{fontSize:'64px',marginBottom:'16px'}}>🍽️</div>
        <h1 style={{fontSize:'28px',fontWeight:'bold',color:'#1f2937',margin:'0'}}>{config.nom}</h1>
        <p style={{color:'#6b7280',marginTop:'8px'}}>Merci de votre visite !</p>
      </div>
      <div style={{background:'white',borderRadius:'24px',boxShadow:'0 10px 40px rgba(0,0,0,0.1)',padding:'40px',maxWidth:'380px',width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'56px',marginBottom:'16px'}}>🎡</div>
        <h2 style={{fontSize:'22px',fontWeight:'bold',color:'#1f2937',marginBottom:'12px'}}>Tentez votre chance !</h2>
        <p style={{color:'#6b7280',marginBottom:'32px',lineHeight:'1.6'}}>
          Laissez-nous un avis Google et tournez la roue pour gagner un <strong style={{color:config.couleur_principale}}>cafe offert</strong>, un <strong style={{color:config.couleur_principale}}>dessert</strong> ou autres surprises !
        </p>
        <a href='/avis' style={{display:'block',background:config.couleur_principale,color:'white',fontWeight:'bold',padding:'16px 24px',borderRadius:'16px',fontSize:'18px',textDecoration:'none'}}>
          Laisser un avis et jouer
        </a>
        <p style={{color:'#9ca3af',fontSize:'13px',marginTop:'16px'}}>1 participation par visite - Resultat instantane</p>
      </div>
    </div>
  );
}`;

writeFileSync('app/page.tsx', code);
console.log('Fichier cree avec succes !');