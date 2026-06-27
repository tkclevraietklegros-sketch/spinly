'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
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
      const { data: configData } = await supabase.from('config').select('dernier_login').eq('restaurant_id', r.id).single();
      statsMap[r.id] = { participations: participations || 0, codeUtilises: codes || 0, dernierLogin: configData?.dernier_login || null };
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
    setFormulaireOuvert(false);
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
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)'}}>
      <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}} style={{width:'40px',height:'40px',border:'3px solid rgba(249,115,22,0.3)',borderTop:'3px solid #f97316',borderRadius:'50%'}}/>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)',padding:'16px',boxSizing:'border-box'}}>
      <div style={{position:'fixed',top:'-100px',left:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(249,115,22,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'fixed',bottom:'-100px',right:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(139,92,246,0.04) 0%,transparent 70%)',pointerEvents:'none'}}/>

      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <motion.span animate={{rotate:360}} transition={{duration:20,repeat:Infinity,ease:'linear'}} style={{fontSize:'28px',display:'block'}}>🎡</motion.span>
            <h1 style={{fontSize:'24px',fontWeight:'800',color:'white',margin:'0',letterSpacing:'-0.3px'}}>Spinly Admin</h1>
          </div>
          <p style={{color:'rgba(255,255,255,0.4)',fontSize:'14px',margin:'4px 0 0'}}>{restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { document.cookie='spinly_admin=; max-age=0; path=/'; router.push('/spinly-admin/login'); }} style={{background:'rgba(239,68,68,0.15)',color:'#f87171',padding:'8px 16px',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',cursor:'pointer',fontSize:'14px',fontWeight:'bold'}}>
          Deconnexion
        </button>
      </motion.div>

      {confirmation && (
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} style={{background:'rgba(22,163,74,0.1)',border:'1px solid rgba(22,163,74,0.3)',borderRadius:'16px',padding:'16px',marginBottom:'16px'}}>
          <p style={{color:'#4ade80',fontWeight:'bold',marginBottom: lienCreation ? '8px' : '0'}}>✅ {confirmation}</p>
          {lienCreation && (
            <div>
              <p style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',marginBottom:'4px'}}>Lien dashboard a envoyer au restaurateur :</p>
              <p style={{color:'white',fontWeight:'bold',fontSize:'14px',background:'rgba(255,255,255,0.06)',padding:'8px',borderRadius:'8px',margin:'0'}}>{lienCreation}</p>
            </div>
          )}
        </motion.div>
      )}

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} style={{background:'rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',padding:'20px',marginBottom:'20px'}}>
        <button onClick={() => setFormulaireOuvert(!formulaireOuvert)} style={{width:'100%',background:'linear-gradient(135deg,#f97316,#ea580c)',color:'white',fontWeight:'800',padding:'14px',borderRadius:'14px',border:'none',cursor:'pointer',fontSize:'16px'}}>
          {formulaireOuvert ? '✕ Fermer' : '+ Ajouter un restaurant'}
        </button>

        <AnimatePresence>
          {formulaireOuvert && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} style={{overflow:'hidden'}}>
              <div style={{paddingTop:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
                <input value={nouveauNom} onChange={(e) => setNouveauNom(e.target.value)} placeholder='Nom du restaurant' style={{padding:'12px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.15)',fontSize:'14px',background:'rgba(255,255,255,0.08)',color:'white',outline:'none'}}/>
                <input value={nouveauSlug} onChange={(e) => setNouveauSlug(e.target.value.toLowerCase().replace(/\s/g,'').replace(/[^a-z0-9]/g,''))} placeholder='slug (ex: fujisushi)' style={{padding:'12px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.15)',fontSize:'14px',background:'rgba(255,255,255,0.08)',color:'white',outline:'none'}}/>
                <input value={nouveauMdp} onChange={(e) => setNouveauMdp(e.target.value)} placeholder='Mot de passe admin' style={{padding:'12px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.15)',fontSize:'14px',background:'rgba(255,255,255,0.08)',color:'white',outline:'none'}}/>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <input type='color' value={nouvelleCouleur} onChange={(e) => setNouvelleCouleur(e.target.value)} style={{width:'44px',height:'40px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.15)',cursor:'pointer',background:'transparent'}}/>
                  <p style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',margin:'0'}}>Couleur principale du restaurant</p>
                </div>
                <p style={{color:'rgba(255,255,255,0.25)',fontSize:'12px',margin:'0'}}>3 lots gagnants par defaut seront crees automatiquement.</p>
                <motion.button onClick={ajouterRestaurant} whileHover={{scale:1.02}} whileTap={{scale:0.98}} style={{padding:'12px 24px',borderRadius:'12px',border:'none',cursor:'pointer',background:'linear-gradient(135deg,#f97316,#ea580c)',color:'white',fontWeight:'800',fontSize:'14px'}}>
                  Ajouter et configurer
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {restaurants.map((r, idx) => (
          <motion.div key={r.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:idx*0.05}} style={{background:'rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',padding:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <div>
                <h3 style={{fontSize:'18px',fontWeight:'800',color:'white',margin:'0'}}>{r.nom}</h3>
                <p style={{color:'rgba(255,255,255,0.3)',fontSize:'13px',margin:'2px 0 0'}}>/{r.slug}</p>
              </div>
              <div style={{display:'flex',gap:'6px',alignItems:'center',flexWrap:'wrap'}}>
                <button onClick={() => toggleActif(r.id, r.actif)} style={{padding:'6px 10px',borderRadius:'8px',border:'none',cursor:'pointer',background:r.actif?'rgba(22,163,74,0.15)':'rgba(220,38,38,0.15)',color:r.actif?'#4ade80':'#f87171',fontSize:'12px',fontWeight:'bold'}}>
                  {r.actif ? 'Actif' : 'Inactif'}
                </button>
                <button onClick={() => setResetId(resetId === r.id ? '' : r.id)} style={{padding:'6px 10px',borderRadius:'8px',border:'none',cursor:'pointer',background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.6)',fontSize:'12px',fontWeight:'bold'}}>
                  🔑
                </button>
                <button onClick={() => window.open('/spinly-admin/connect?slug='+r.slug, '_blank')} style={{padding:'6px 10px',borderRadius:'8px',border:'none',cursor:'pointer',background:'linear-gradient(135deg,#f97316,#ea580c)',color:'white',fontSize:'12px',fontWeight:'bold'}}>
                  Dashboard
                </button>
                <button onClick={async () => { if (!confirm('Supprimer '+r.nom+' ? Cette action est irreversible.')) return; if (!confirm('CONFIRMATION FINALE — Toutes les donnees seront supprimees. Continuer ?')) return; await supabase.from('participations').delete().eq('restaurant_id', r.id); await supabase.from('codes').delete().eq('restaurant_id', r.id); await supabase.from('sous_lots').delete().eq('restaurant_id', r.id); await supabase.from('lots').delete().eq('restaurant_id', r.id); await supabase.from('config').delete().eq('restaurant_id', r.id); await supabase.from('restaurants').delete().eq('id', r.id); setRestaurants(prev => prev.filter(rest => rest.id !== r.id)); }} style={{padding:'6px 10px',borderRadius:'8px',border:'none',cursor:'pointer',background:'rgba(220,38,38,0.15)',color:'#f87171',fontSize:'12px',fontWeight:'bold'}}>
                  🗑️
                </button>
              </div>
            </div>

            <AnimatePresence>
              {resetId === r.id && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} style={{overflow:'hidden',marginBottom:'12px'}}>
                  <div style={{background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'12px',padding:'12px',display:'flex',gap:'8px',alignItems:'center'}}>
                    <input value={resetMdp} onChange={(e) => setResetMdp(e.target.value)} placeholder='Nouveau mot de passe' style={{flex:1,padding:'8px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.15)',fontSize:'14px',background:'rgba(255,255,255,0.08)',color:'white',outline:'none'}}/>
                    <button onClick={() => reinitialiserMdp(r.id)} style={{padding:'8px 14px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#f97316',color:'white',fontWeight:'bold',fontSize:'13px'}}>OK</button>
                    <button onClick={() => { setResetId(''); setResetMdp(''); }} style={{padding:'8px 10px',borderRadius:'8px',border:'none',cursor:'pointer',background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>✕</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px',marginBottom:'10px'}}>
              <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'12px',textAlign:'center'}}>
                <p style={{color:'rgba(255,255,255,0.3)',fontSize:'12px',margin:'0 0 4px'}}>Participations</p>
                <p style={{fontSize:'24px',fontWeight:'800',color:'white',margin:'0'}}>{stats[r.id]?.participations || 0}</p>
              </div>
              <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'12px',textAlign:'center'}}>
                <p style={{color:'rgba(255,255,255,0.3)',fontSize:'12px',margin:'0 0 4px'}}>Cadeaux utilises</p>
                <p style={{fontSize:'24px',fontWeight:'800',color:'#4ade80',margin:'0'}}>{stats[r.id]?.codeUtilises || 0}</p>
              </div>
            </div>

            <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'10px',marginBottom:'10px',display:'flex',alignItems:'center',gap:'8px'}}>
              <p style={{color:'rgba(255,255,255,0.3)',fontSize:'12px',margin:'0'}}>🕐 Derniere connexion :</p>
              <p style={{color: stats[r.id]?.dernierLogin ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',fontSize:'12px',fontWeight:'bold',margin:'0'}}>
                {stats[r.id]?.dernierLogin ? new Date(stats[r.id].dernierLogin).toLocaleString('fr-FR') : 'Jamais connecte'}
              </p>
            </div>

            <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'10px',display:'flex',flexDirection:'column',gap:'4px'}}>
              <p style={{color:'rgba(255,255,255,0.2)',fontSize:'11px',margin:'0',fontWeight:'bold',letterSpacing:'1px'}}>LIENS</p>
              <p style={{color:'#60a5fa',fontSize:'12px',margin:'0'}}>🌐 spinlyo.vercel.app/{r.slug}</p>
              <p style={{color:'rgba(255,255,255,0.3)',fontSize:'12px',margin:'0'}}>✅ spinlyo.vercel.app/{r.slug}/valider</p>
              <p style={{color:'rgba(255,255,255,0.2)',fontSize:'12px',margin:'0'}}>🛵 spinlyo.vercel.app/{r.slug}?mode=livraison</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}