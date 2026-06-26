'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const LOTS_DEFAUT = [
  { label: 'Cafe offert', couleur: '#f97316', probabilite: 15 },
  { label: 'Dessert offert', couleur: '#8b5cf6', probabilite: 10 },
  { label: 'Reduction 10%', couleur: '#3b82f6', probabilite: 20 },
];

export default function SpinlyAdmin() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [chargement, setChargement] = useState(true);
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauSlug, setNouveauSlug] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [nouvelleCouleur, setNouvelleCouleur] = useState('#f97316');
  const [confirmation, setConfirmation] = useState('');
  const [lienCreation, setLienCreation] = useState('');
  const [resetId, setResetId] = useState('');
  const [resetMdp, setResetMdp] = useState('');
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
    await supabase.from('config').insert({ nom: nouveauNom, couleur_principale: nouvelleCouleur, mot_de_passe: nouveauMdp, restaurant_id: restau.id, nb_segments_perdants: 1 });
    for (const lot of LOTS_DEFAUT) {
      await supabase.from('lots').insert({ ...lot, actif: true, restaurant_id: restau.id });
    }
    const lien = 'spinlyo.vercel.app/'+nouveauSlug+'/admin';
    setLienCreation(lien);
    setNouveauNom('');
    setNouveauSlug('');
    setNouveauMdp('');
    setNouvelleCouleur('#f97316');
    setConfirmation('Restaurant ajoute et pret a utiliser !');
    setTimeout(() => { setConfirmation(''); setLienCreation(''); }, 10000);
    charger();
  };

  const toggleActif = async (id: string, actif: boolean) => {
    await supabase.from('restaurants').update({ actif: !actif }).eq('id', id);
    charger();
  };

  const reinitialiserMdp = async (restaurantId: string) => {
    if (!resetMdp) return;
    await supabase.from('config').update({ mot_de_passe: resetMdp }).eq('restaurant_id', restaurantId);
    setResetId('');
    setResetMdp('');
    alert('Mot de passe reinitialise !');
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
        <button onClick={() => { document.cookie='spinly_admin=; max-age=0; path=/'; router.push('/spinly-admin/login'); }} style={{background:'#ef4444',color:'white',padding:'8px 16px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'14px',fontWeight:'bold'}}>
          Deconnexion
        </button>
      </div>

      <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',marginBottom:'24px'}}>
        <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',marginBottom:'16px'}}>Ajouter un restaurant</h2>
        {confirmation && (
          <div style={{background:'#f0fdf4',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
            <p style={{color:'#16a34a',fontWeight:'bold',marginBottom:'8px'}}>✅ {confirmation}</p>
            {lienCreation && (
              <div>
                <p style={{color:'#6b7280',fontSize:'13px',marginBottom:'4px'}}>Lien dashboard a envoyer au restaurateur :</p>
                <p style={{color:'#1f2937',fontWeight:'bold',fontSize:'14px',background:'#f9fafb',padding:'8px',borderRadius:'8px'}}>{lienCreation}</p>
              </div>
            )}
          </div>
        )}
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'8px'}}>
          <input value={nouveauNom} onChange={(e) => setNouveauNom(e.target.value)} placeholder='Nom du restaurant' style={{flex:1,minWidth:'140px',padding:'10px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px'}}/>
          <input value={nouveauSlug} onChange={(e) => setNouveauSlug(e.target.value.toLowerCase().replace(/\s/g,'').replace(/[^a-z0-9]/g,''))} placeholder='slug (ex: fujisushi)' style={{flex:1,minWidth:'140px',padding:'10px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px'}}/>
          <input value={nouveauMdp} onChange={(e) => setNouveauMdp(e.target.value)} placeholder='Mot de passe admin' style={{flex:1,minWidth:'140px',padding:'10px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px'}}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
          <input type='color' value={nouvelleCouleur} onChange={(e) => setNouvelleCouleur(e.target.value)} style={{width:'40px',height:'36px',borderRadius:'8px',border:'1px solid #e5e7eb',cursor:'pointer'}}/>
          <p style={{color:'#6b7280',fontSize:'13px',margin:'0'}}>Couleur principale du restaurant</p>
        </div>
        <p style={{color:'#9ca3af',fontSize:'12px',marginBottom:'12px'}}>3 lots gagnants par defaut seront crees automatiquement (Cafe, Dessert, Reduction 10%). Les cases perdantes sont generees automatiquement.</p>
        <button onClick={ajouterRestaurant} style={{padding:'10px 24px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#f97316',color:'white',fontWeight:'bold',fontSize:'14px'}}>
          Ajouter et configurer
        </button>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {restaurants.map((r) => (
          <div key={r.id} style={{background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <div>
                <h3 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',margin:'0'}}>{r.nom}</h3>
                <p style={{color:'#9ca3af',fontSize:'13px',margin:'2px 0 0'}}>/{r.slug}</p>
              </div>
              <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                <button onClick={() => toggleActif(r.id, r.actif)} style={{padding:'6px 12px',borderRadius:'8px',border:'none',cursor:'pointer',background:r.actif?'#dcfce7':'#fee2e2',color:r.actif?'#16a34a':'#dc2626',fontSize:'12px',fontWeight:'bold'}}>
                  {r.actif ? 'Actif' : 'Inactif'}
                </button>
                <button onClick={() => setResetId(resetId === r.id ? '' : r.id)} style={{padding:'6px 12px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#f3f4f6',color:'#6b7280',fontSize:'12px',fontWeight:'bold'}}>
                  🔑 Mdp
                </button>
                <button onClick={() => window.open('/spinly-admin/connect?slug='+r.slug, '_blank')} style={{padding:'6px 12px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#f97316',color:'white',fontSize:'12px',fontWeight:'bold'}}>
                  Dashboard
                </button>
                <button onClick={async () => { if (!confirm('Supprimer '+r.nom+' ? Cette action est irreversible.')) return; if (!confirm('CONFIRMATION FINALE — Toutes les donnees (lots, codes, participations) seront supprimees. Continuer ?')) return; const { error: e1 } = await supabase.from('participations').delete().eq('restaurant_id', r.id);
const { error: e2 } = await supabase.from('codes').delete().eq('restaurant_id', r.id);
const { error: e3 } = await supabase.from('sous_lots').delete().eq('restaurant_id', r.id);
const { error: e4 } = await supabase.from('lots').delete().eq('restaurant_id', r.id);
const { error: e5 } = await supabase.from('config').delete().eq('restaurant_id', r.id);
const { error: e6 } = await supabase.from('restaurants').delete().eq('id', r.id);
alert(JSON.stringify({e1,e2,e3,e4,e5,e6})); await supabase.from('codes').delete().eq('restaurant_id', r.id); await supabase.from('sous_lots').delete().eq('restaurant_id', r.id); await supabase.from('lots').delete().eq('restaurant_id', r.id); await supabase.from('config').delete().eq('restaurant_id', r.id); await supabase.from('restaurants').delete().eq('id', r.id); charger(); }} style={{padding:'6px 12px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#fee2e2',color:'#dc2626',fontSize:'12px',fontWeight:'bold'}}>
                  🗑️ Suppr
                </button>
              </div>
            </div>
            {resetId === r.id && (
              <div style={{background:'#fff7ed',borderRadius:'12px',padding:'12px',marginBottom:'12px',display:'flex',gap:'8px',alignItems:'center'}}>
                <input value={resetMdp} onChange={(e) => setResetMdp(e.target.value)} placeholder='Nouveau mot de passe' style={{flex:1,padding:'8px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px'}}/>
                <button onClick={() => reinitialiserMdp(r.id)} style={{padding:'8px 16px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#f97316',color:'white',fontWeight:'bold',fontSize:'13px'}}>
                  Valider
                </button>
                <button onClick={() => { setResetId(''); setResetMdp(''); }} style={{padding:'8px 12px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#f3f4f6',color:'#6b7280',fontSize:'13px'}}>
                  Annuler
                </button>
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px',marginBottom:'12px'}}>
              <div style={{background:'#f9fafb',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
                <p style={{color:'#6b7280',fontSize:'12px',margin:'0 0 4px'}}>Participations</p>
                <p style={{fontSize:'24px',fontWeight:'bold',color:'#1f2937',margin:'0'}}>{stats[r.id]?.participations || 0}</p>
              </div>
              <div style={{background:'#f9fafb',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
                <p style={{color:'#6b7280',fontSize:'12px',margin:'0 0 4px'}}>Cadeaux utilises</p>
                <p style={{fontSize:'24px',fontWeight:'bold',color:'#16a34a',margin:'0'}}>{stats[r.id]?.codeUtilises || 0}</p>
              </div>
            </div>
            <div style={{background:'#f9fafb',borderRadius:'10px',padding:'12px',display:'flex',flexDirection:'column',gap:'6px'}}>
              <p style={{color:'#6b7280',fontSize:'11px',margin:'0',fontWeight:'bold'}}>LIENS</p>
              <p style={{color:'#3b82f6',fontSize:'12px',margin:'0'}}>🌐 spinlyo.vercel.app/{r.slug}</p>
              <p style={{color:'#6b7280',fontSize:'12px',margin:'0'}}>✅ spinlyo.vercel.app/{r.slug}/valider</p>
              <p style={{color:'#9ca3af',fontSize:'12px',margin:'0'}}>🛵 spinlyo.vercel.app/{r.slug}?mode=livraison</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
