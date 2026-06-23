'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MOT_DE_PASSE_SPINLY = 'spinly2024';

export default function SpinlyLogin() {
  const [mdp, setMdp] = useState('');
  const [erreur, setErreur] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = document.cookie.split(';').find(c => c.trim().startsWith('spinly_admin='));
    if (auth) router.push('/spinly-admin');
  }, []);

  const valider = () => {
    if (mdp === MOT_DE_PASSE_SPINLY) {
      const exp = new Date();
      exp.setDate(exp.getDate() + 30);
      document.cookie = 'spinly_admin=1; expires=' + exp.toUTCString() + '; path=/';
      router.push('/spinly-admin');
    } else {
      setErreur(true);
      setMdp('');
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#1f2937,#374151)',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{background:'white',borderRadius:'24px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)',padding:'40px',maxWidth:'360px',width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'8px'}}>🎡</div>
        <h1 style={{fontSize:'24px',fontWeight:'bold',color:'#1f2937',marginBottom:'4px'}}>Spinly</h1>
        <p style={{color:'#6b7280',fontSize:'14px',marginBottom:'24px'}}>Dashboard global</p>
        {erreur && <p style={{color:'#dc2626',fontSize:'14px',marginBottom:'16px'}}>Mot de passe incorrect</p>}
        <input
          type='password'
          placeholder='Mot de passe Spinly'
          value={mdp}
          onChange={(e) => { setMdp(e.target.value); setErreur(false); }}
          onKeyDown={(e) => e.key === 'Enter' && valider()}
          style={{width:'100%',padding:'14px',borderRadius:'12px',border:'2px solid #e5e7eb',fontSize:'16px',marginBottom:'16px',boxSizing:'border-box'}}
        />
        <button onClick={valider} style={{width:'100%',background:'#1f2937',color:'white',fontWeight:'bold',padding:'14px',borderRadius:'12px',fontSize:'16px',border:'none',cursor:'pointer'}}>
          Connexion
        </button>
      </div>
    </div>
  );
}
