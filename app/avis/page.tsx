'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Avis() {
  const [avisOuvert, setAvisOuvert] = useState(false);
  const [config, setConfig] = useState({
    nom: 'Le Petit Bistrot',
    couleur_principale: '#f97316',
    lien_google: ''
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const charger = async () => {
      const { data } = await supabase.from('config').select('*').single();
      if (data) setConfig(data);
    };
    charger();
    setTimeout(() => setVisible(true), 100);
  }, []);

  const ouvrirAvis = () => {
    window.open(
      config.lien_google ||
      "https://search.google.com/local/writereview",
      "_blank"
    );
    setAvisOuvert(true);
  };

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#ffedd5 0%,#fed7aa 100%)',
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'center',
      padding:'24px'
    }}>

      <div style={{
        textAlign:'center',
        marginBottom:'32px',
        opacity:visible ? 1 : 0,
        transform:visible ? 'translateY(0)' : 'translateY(-20px)',
        transition:'all 0.6s ease'
      }}>
        <div style={{fontSize:'56px'}}>⭐</div>

        <h1 style={{
          fontSize:'30px',
          fontWeight:'bold',
          color:config.couleur_principale,
          margin:'0'
        }}>
          {config.nom}
        </h1>

        <p style={{color:'#6b7280',marginTop:'8px'}}>
          Votre avis compte ❤️
        </p>
      </div>

      <div style={{
        background:'white',
        borderRadius:'32px',
        boxShadow:'0 20px 60px rgba(0,0,0,0.12)',
        padding:'40px',
        maxWidth:'420px',
        width:'100%',
        textAlign:'center',
        opacity:visible ? 1 : 0,
        transform:visible ? 'translateY(0)' : 'translateY(20px)',
        transition:'all 0.6s ease 0.2s'
      }}>

        <div style={{fontSize:'52px'}}>🍽️</div>

        <h2 style={{
          fontSize:'22px',
          fontWeight:'bold',
          color:'#1f2937'
        }}>
          Laissez un avis Google
        </h2>

        <p style={{
          color:'#6b7280',
          margin:'20px 0'
        }}>
          Débloquez votre roue 🎡
        </p>

        <button
          onClick={ouvrirAvis}
          style={{
            width:'100%',
            background:'#4285f4',
            color:'white',
            fontWeight:'bold',
            padding:'16px',
            borderRadius:'16px',
            border:'none',
            cursor:'pointer'
          }}
        >
          ⭐ Laisser un avis Google
        </button>

        {avisOuvert && (
          <a
            href="/roue"
            style={{
              display:'block',
              marginTop:'16px',
              background:config.couleur_principale,
              color:'white',
              fontWeight:'bold',
              padding:'18px',
              borderRadius:'16px',
              textDecoration:'none'
            }}
          >
            🎡 Tourner la roue !
          </a>
        )}

      </div>

    </div>
  );
}
