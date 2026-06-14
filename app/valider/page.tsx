'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '../../lib/supabase';

export default function Valider({ searchParams }) {
  const [statut, setStatut] = useState('chargement');
  const [lot, setLot] = useState('');
  const params = use(searchParams);
  const code = params.code;

  useEffect(() => {
    const verifier = async () => {
      if (!code) { setStatut('invalide'); return; }
      const { data, error } = await supabase.from('codes').select('*').eq('code', code).single();
      if (error || !data) { setStatut('invalide'); return; }
      if (data.utilise) { setStatut('deja_utilise'); return; }
      if (data.expire_le && Date.now() > new Date(data.expire_le).getTime()) { setStatut('expire'); return; }
      await supabase.from('codes').update({ utilise: true }).eq('code', code);
      setLot(data.lot);
      setStatut('valide');
    };
    verifier();
  }, [code]);

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(to bottom,#fff7ed,#ffffff)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{background:'white',borderRadius:'24px',boxShadow:'0 10px 40px rgba(0,0,0,0.1)',padding:'40px',maxWidth:'380px',width:'100%',textAlign:'center'}}>
        {statut === 'chargement' && <p style={{color:'#6b7280',fontSize:'18px'}}>Verification en cours...</p>}
        {statut === 'valide' && (
          <div>
            <div style={{fontSize:'64px',marginBottom:'16px'}}>✅</div>
            <h1 style={{fontSize:'24px',fontWeight:'bold',color:'#16a34a',marginBottom:'12px'}}>Code valide !</h1>
            <p style={{fontSize:'20px',color:'#1f2937',fontWeight:'bold',marginBottom:'8px'}}>{lot}</p>
            <p style={{color:'#6b7280'}}>Offrez le cadeau au client</p>
          </div>
        )}
        {statut === 'deja_utilise' && (
          <div>
            <div style={{fontSize:'64px',marginBottom:'16px'}}>❌</div>
            <h1 style={{fontSize:'24px',fontWeight:'bold',color:'#dc2626',marginBottom:'12px'}}>Code deja utilise !</h1>
            <p style={{color:'#6b7280'}}>Ce cadeau a deja ete offert</p>
          </div>
        )}
        {statut === 'expire' && (
          <div>
            <div style={{fontSize:'64px',marginBottom:'16px'}}>⏰</div>
            <h1 style={{fontSize:'24px',fontWeight:'bold',color:'#f97316',marginBottom:'12px'}}>Code expire !</h1>
            <p style={{color:'#6b7280'}}>Ce code n est plus valable</p>
          </div>
        )}
        {statut === 'invalide' && (
          <div>
            <div style={{fontSize:'64px',marginBottom:'16px'}}>⛔</div>
            <h1 style={{fontSize:'24px',fontWeight:'bold',color:'#dc2626',marginBottom:'12px'}}>Code invalide !</h1>
            <p style={{color:'#6b7280'}}>Ce code n existe pas</p>
          </div>
        )}
      </div>
    </div>
  );
}