'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import BandeauCookie from '../components/BandeauCookie';
export default function Home({ params }: { params: { slug: string } }) {
  const [config, setConfig] = useState<any>({ nom: '', couleur_principale: '#f97316' });
  const [lots, setLots] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [modeLivraison, setModeLivraison] = useState(false);
  const [restaurantId, setRestaurantId] = useState('');
  useEffect(() => {
    const params2 = new URLSearchParams(window.location.search);
    setModeLivraison(params2.get('mode') === 'livraison');
    const charger = async () => {
      const { data: restau } = await supabase.from('restaurants').select('id').eq('slug', params.slug).single();
      if (!restau) return;
      setRestaurantId(restau.id);
      const { data: configData } = await supabase.from('config').select('*').eq('restaurant_id', restau.id).single();
      if (configData) setConfig(configData);
      const { data: lotsData } = await supabase.from('lots').select('*').eq('actif', true).eq('restaurant_id', restau.id);
      if (lotsData) setLots(lotsData.filter(l => !l.label.toLowerCase().includes('tentez')));
    };
    charger();
    setTimeout(() => setVisible(true), 100);
  }, []);
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#ffedd5 0%,#fed7aa 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{textAlign:'center',marginBottom:'32px',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(-20px)',transition:'all 0.6s ease'}}>
        <div style={{fontSize:'64px',marginBottom:'12px'}}>🍽️</div>
        <h1 style={{fontSize:'32px',fontWeight:'bold',color:config.couleur_principale,margin:'0'}}>{config.nom}</h1>
        <p style={{color:'#6b7280',marginTop:'8px',fontSize:'16px'}}>Merci de votre visite !</p>
      </div>
      <div style={{background:'white',borderRadius:'32px',boxShadow:'0 20px 60px rgba(0,0,0,0.12)',padding:'40px',maxWidth:'400px',width:'100%',textAlign:'center',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(20px)',transition:'all 0.6s ease 0.2s'}}>
        <div style={{fontSize:'56px',marginBottom:'12px'}}>🎡</div>
        <h2 style={{fontSize:'24px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>Tentez votre chance !</h2>
        <p style={{color:'#6b7280',marginBottom:'24px',lineHeight:'1.6'}}>Tournez la roue et tentez de gagner un cadeau !</p>
        {lots.length > 0 && (
          <div style={{background:'#fff7ed',borderRadius:'16px',padding:'16px',marginBottom:'24px',textAlign:'left'}}>
            <p style={{color:'#f97316',fontWeight:'bold',fontSize:'13px',marginBottom:'12px',textAlign:'center'}}>CE QUE VOUS POUVEZ GAGNER</p>
            {lots.map((lot, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:lot.couleur,flexShrink:0}}></div>
                <span style={{color:'#1f2937',fontSize:'14px',fontWeight:'500'}}>{lot.label}</span>
              </div>
            ))}
          </div>
        )}
        <a href={modeLivraison ? '/'+params.slug+'/avis?mode=livraison' : '/'+params.slug+'/avis'} style={{display:'block',background:config.couleur_principale,color:'white',fontWeight:'bold',padding:'18px 24px',borderRadius:'16px',fontSize:'18px',textDecoration:'none',boxShadow:'0 8px 24px rgba(249,115,22,0.35)',animation:'pulse 2s infinite'}}>
          Jouer maintenant
        </a>
        <p style={{color:'#9ca3af',fontSize:'13px',marginTop:'16px'}}>1 participation par visite - Resultat instantane</p>
      </div>
      <BandeauCookie />
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 8px 24px rgba(249,115,22,0.35); }
          50% { transform: scale(1.03); box-shadow: 0 12px 32px rgba(249,115,22,0.5); }
          100% { transform: scale(1); box-shadow: 0 8px 24px rgba(249,115,22,0.35); }
        }
      `}</style>
    </div>
  );
}
