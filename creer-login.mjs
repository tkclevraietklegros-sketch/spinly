import { writeFileSync } from 'fs';

const code = `'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function Login() {
  const [mdp, setMdp] = useState('');
  const [erreur, setErreur] = useState(false);
  const router = useRouter();

  const valider = async () => {
    const { data } = await supabase.from('config').select('mot_de_passe').single();
    const motDePasse = data?.mot_de_passe || 'admin1234';
    if (mdp === motDePasse) {
      document.cookie = 'admin_auth=1; path=/; max-age=86400';
      router.push('/admin');
    } else {
      setErreur(true);
      setMdp('');
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(to bottom,#fff7ed,#ffffff)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{background:'white',borderRadius:'24px',boxShadow:'0 10px 40px rgba(0,0,0,0.1)',padding:'40px',maxWidth:'380px',width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>🔐</div>
        <h1 style={{fontSize:'22px',fontWeight:'bold',color:'#1f2937',marginBottom:'24px'}}>Espace Admin</h1>
        <input
          type='password'
          placeholder='Mot de passe'
          value={mdp}
          onChange={(e) => { setMdp(e.target.value); setErreur(false); }}
          onKeyDown={(e) => e.key === 'Enter' && valider()}
          style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',marginBottom:'16px',boxSizing:'border-box',outline:'none'}}
        />
        {erreur && <p style={{color:'#dc2626',fontSize:'14px',marginBottom:'12px'}}>Mot de passe incorrect</p>}
        <button
          onClick={valider}
          style={{width:'100%',background:'#f97316',color:'white',fontWeight:'bold',padding:'14px',borderRadius:'12px',fontSize:'16px',border:'none',cursor:'pointer'}}
        >
          Connexion
        </button>
      </div>
    </div>
  );
}`;

writeFileSync('app/admin/login/page.tsx', code);
console.log('Fichier cree avec succes !');