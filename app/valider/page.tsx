'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '../../lib/supabase';

export default function Valider({ searchParams }: { searchParams: any }) {
  const [statut, setStatut] = useState('chargement');
  const [lot, setLot] = useState('');
  const params = use(searchParams) as any;
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

  const fonds: any = {
    chargement: 'linear-gradient(135deg,#f9fafb,#ffffff)',
    valide: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
    deja_utilise: 'linear-gradient(135deg,#fee2e2,#fecaca)',
    expire: 'linear-gradient(135deg,#fff7ed,#ffedd5)',
    invalide: 'linear-gradient(135deg,#fee2e2,#fecaca)',
  };

  return (
    <div style={{minHeight:'100vh',background:fonds[statut],display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',transition:'background 0.5s ease'}}>
      <div style={{background:'white',borderRadius:'32px',boxShadow:'0 20px 60px rgba(0,0,0,0.12)',padding:'40px',maxWidth:'380px',width:'100%',textAlign:'center'}}>
        {statut === 'chargement' && (
          <div>
            <div style={{width:'56px',height:'56px',border:'5px solid #f3f4f6',borderTop:'5px solid #f97316',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 24px'}}></div>
            <p style={{color:'#6b7280',fontSize:'18px'}}>Verification en cours...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        {statut === 'valide' && (
          <div>
            <div style={{fontSize:'80px',marginBottom:'16px'}}>OK</div>
            <h1 style={{fontSize:'28px',fontWeight:'bold',color:'#16a34a',marginBottom:'16px'}}>Code valide !</h1>
            <div style={{background:'#dcfce7',borderRadius:'16px',padding:'20px',marginBottom:'24px'}}>
              <p style={{color:'#6b7280',fontSize:'14px',marginBottom:'4px'}}>Cadeau a offrir</p>
              <p style={{fontSize:'24px',color:'#16a34a',fontWeight:'bold'}}>{lot}</p>
            </div>
            <p style={{color:'#6b7280'}}>Offrez le cadeau au client !</p>
          </div>
        )}
        {statut === 'deja_utilise' && (
          <div>
            <div style={{fontSize:'80px',marginBottom:'16px',color:'#dc2626',fontWeight:'bold'}}>X</div>
            <h1 style={{fontSize:'28px',fontWeight:'bold',color:'#dc2626',marginBottom:'12px'}}>Deja utilise !</h1>
            <p style={{color:'#6b7280'}}>Ce cadeau a deja ete offert</p>
          </div>
        )}
        {statut === 'expire' && (
          <div>
            <div style={{fontSize:'80px',marginBottom:'16px',fontWeight:'bold',color:'#f97316'}}>!</div>
            <h1 style={{fontSize:'28px',fontWeight:'bold',color:'#f97316',marginBottom:'12px'}}>Code expire !</h1>
            <p style={{color:'#6b7280'}}>Ce code n est plus valable</p>
          </div>
        )}
        {statut === 'invalide' && (
          <div>
            <div style={{fontSize:'80px',marginBottom:'16px',fontWeight:'bold',color:'#dc2626'}}>?</div>
            <h1 style={{fontSize:'28px',fontWeight:'bold',color:'#dc2626',marginBottom:'12px'}}>Code invalide !</h1>
            <p style={{color:'#6b7280'}}>Ce code n existe pas</p>
          </div>
        )}
      </div>
    </div>
  );
}
