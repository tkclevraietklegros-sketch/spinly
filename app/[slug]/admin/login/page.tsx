'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

export default function LoginRestaurant() {
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [slug, setSlug] = useState('');
  const router = useRouter();

  useEffect(() => {
    const slugActuel = window.location.pathname.split('/')[1];
    setSlug(slugActuel);
    const auth = document.cookie.split(';').find(c => c.trim().startsWith('admin_auth_'+slugActuel+'='));
    if (auth) router.push('/'+slugActuel+'/admin');
  }, []);

  const seConnecter = async () => {
    const { data: restau } = await supabase.from('restaurants').select('id').eq('slug', slug).single();
    if (!restau) { setErreur('Restaurant introuvable'); return; }
    const { data: configData } = await supabase.from('config').select('mot_de_passe').eq('restaurant_id', restau.id).single();
    if (!configData || configData.mot_de_passe !== motDePasse) {
      setErreur('Mot de passe incorrect');
      return;
    }
    const exp = new Date();
    exp.setDate(exp.getDate() + 7);
    document.cookie = 'admin_auth_'+slug+'=1; expires=' + exp.toUTCString() + '; path=/';
    await supabase.from('config').update({ dernier_login: new Date().toISOString() }).eq('restaurant_id', restau.id);
    router.push('/'+slug+'/admin');
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#ffedd5 0%,#fef3e2 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{background:'white',borderRadius:'24px',boxShadow:'0 20px 60px rgba(0,0,0,0.1)',padding:'40px',maxWidth:'360px',width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>🔐</div>
        <h1 style={{fontSize:'24px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>Espace admin</h1>
        <p style={{color:'#6b7280',fontSize:'14px',marginBottom:'24px'}}>Connectez-vous pour acceder au dashboard</p>
        {erreur && <p style={{color:'#dc2626',fontSize:'14px',marginBottom:'16px'}}>{erreur}</p>}
        <input
          type='password'
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && seConnecter()}
          placeholder='Mot de passe'
          style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid #e5e7eb',fontSize:'16px',boxSizing:'border-box',marginBottom:'16px'}}
        />
        <button onClick={seConnecter} style={{width:'100%',background:'#f97316',color:'white',fontWeight:'bold',padding:'14px',borderRadius:'12px',border:'none',cursor:'pointer',fontSize:'16px'}}>
          Se connecter
        </button>
      </div>
    </div>
  );
}
