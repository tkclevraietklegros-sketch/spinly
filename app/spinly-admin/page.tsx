'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function SpinlyAdmin() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [chargement, setChargement] = useState(true);
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauSlug, setNouveauSlug] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const router = useRouter();

  useEffect(() => {
    const auth = document.cookie.split(';').find(c => c.trim().startsWith('spinly_admin='));
    if (!auth) { router.push('/spinly-admin/login'); return; }
    charger();
  }, []);

  const charger = async () => {
    const { data: restaus } = await supabase.from('restaurants').select('*').order('cree_le', { ascending: false });
    if (!restaus) return;
    setRestaurants(restaus);
    const statsMap: any = {};
    for (const r of restaus) {
      const { count: participations } = await supabase.from('participations').select('*', { count: 'exact', head: true }).eq('restaurant_id', r.id);
      const { count: codes } = await supabase.from('codes').select('*', { count: 'exact', head: true }).eq('restaurant_id', r.id).eq('utilise', true);
      statsMap[r.id] = { participations: participations || 0, codeUtilises: codes || 0 };
    }
    setStats(statsMap);
    setChargement(false);
  };

  const ajouterRestaurant = async () => {
    if (!nouveauNom || !nouveauSlug || !nouveauMdp) return;
    const { data: restau } = await supabase.from('restaurants').insert({ nom: nouveauNom, slug: nouveauSlug, actif: true }).select().single();
    if (!restau) return;
    await supabase.from('config').insert({ nom: nouveauNom, couleur_principale: '#f97316', mot_de_passe: nouveauMdp, restaurant_id: restau.id });
    setNouveauNom('');
    setNouveauSlug('');
    setNouveauMdp('');
    setConfirmation('Restaurant ajoute !');
    setTimeout(() => setConfirmation(''), 3000);
    charger();
  };

  const toggleActif = async (id: string, actif: boolean) => {
    await supabase.from('restaurants').update({ actif: !actif }).eq('id', id);
    charger();
  };

  if (chargement) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb'}}>
      <p style={{color:'#6b7280'}}>Chargement...</p>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#f9fafb',padding:'16px',boxSizing:'border-box'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <div>
          <h1 style={{fontSize:'24px',fontWeight:'bold',color:'#1f2937',margin:'0'}}>🎡 Spinly Admin</h1>
          <p style={{color:'#6b7280',fontSize:'14px',margin:'4px 0 0'}}>{restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { document.cookie='spinly_admin=; max-age=0'; router.push('/spinly-admin/login'); }} style={{background:'#ef4444',color:'white',padding:'8px 16px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'14px',fontWeight:'bold'}}>
          Deconnexion
        </button>
      </div>

      <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',marginBottom:'24px'}}>
        <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',marginBottom:'16px'}}>Ajouter un restaurant</h2>
        {confirmation && <p style={{color:'#16a34a',fontWeight:'bold',marginBottom:'12px'}}>{confirmation}</p>}
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
          <input value={nouveauNom} onChange={(e) => setNouveauNom(e.target.value)} placeholder='Nom du restaurant' style={{flex:1,minWidth:'140px',padding:'10px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px'}}/>
          <input value={nouveauSlug} onChange={(e) => setNouveauSlug(e.target.value.toLowerCase().replace(/\s/g,''))} placeholder='slug (ex: fujisushi)' style={{flex:1,minWidth:'140px',padding:'10px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px'}}/>
          <input value={nouveauMdp} onChange={(e) => setNouveauMdp(e.target.value)} placeholder='Mot de passe admin' style={{flex:1,minWidth:'140px',padding:'10px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px'}}/>
          <button onClick={ajouterRestaurant} style={{padding:'10px 20px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#f97316',color:'white',fontWeight:'bold',fontSize:'14px'}}>
            Ajouter
          </button>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {restaurants.map((r) => (
          <div key={r.id} style={{background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <div>
                <h3 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',margin:'0'}}>{r.nom}</h3>
                <p style={{color:'#9ca3af',fontSize:'13px',margin:'2px 0 0'}}>/{r.slug}</p>
              </div>
              <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <button onClick={() => toggleActif(r.id, r.actif)} style={{padding:'6px 12px',borderRadius:'8px',border:'none',cursor:'pointer',background:r.actif?'#dcfce7':'#fee2e2',color:r.actif?'#16a34a':'#dc2626',fontSize:'12px',fontWeight:'bold'}}>
                  {r.actif ? 'Actif' : 'Inactif'}
                </button>
                <button onClick={() => {
  const exp = new Date();
  exp.setDate(exp.getDate() + 7);
  document.cookie = 'admin_auth_'+r.slug+'=1; expires=' + exp.toUTCString() + '; path=/';
  window.open('/'+r.slug+'/admin', '_blank');
}} style={{padding:'6px 12px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#f97316',color:'white',fontSize:'12px',fontWeight:'bold'}}>
  Dashboard
</button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px'}}>
              <div style={{background:'#f9fafb',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
                <p style={{color:'#6b7280',fontSize:'12px',margin:'0 0 4px'}}>Participations</p>
                <p style={{fontSize:'24px',fontWeight:'bold',color:'#1f2937',margin:'0'}}>{stats[r.id]?.participations || 0}</p>
              </div>
              <div style={{background:'#f9fafb',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
                <p style={{color:'#6b7280',fontSize:'12px',margin:'0 0 4px'}}>Cadeaux utilises</p>
                <p style={{fontSize:'24px',fontWeight:'bold',color:'#16a34a',margin:'0'}}>{stats[r.id]?.codeUtilises || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
