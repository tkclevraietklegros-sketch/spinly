'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const OPTIONS_FREQUENCE = [
  { label: '1 client sur 2', probabilite: 50 },
  { label: '1 client sur 3', probabilite: 33 },
  { label: '1 client sur 5', probabilite: 20 },
  { label: '1 client sur 10', probabilite: 10 },
  { label: '1 client sur 20', probabilite: 5 },
  { label: '1 client sur 50', probabilite: 2 },
  { label: '1 client sur 100', probabilite: 1 },
];

function GraphiqueArea({ partData }: { partData: any[] }) {
  if (!partData || partData.length === 0) return <p style={{color:'rgba(255,255,255,0.3)',textAlign:'center',padding:'24px'}}>Pas encore de donnees</p>;
  const comptesParJour: any = {};
  partData.forEach(c => {
    const jour = new Date(c.cree_le).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' });
    if (!comptesParJour[jour]) comptesParJour[jour] = { jour, restaurant: 0, livraison: 0 };
    if (c.mode === 'livraison') comptesParJour[jour].livraison++;
    else comptesParJour[jour].restaurant++;
  });
  const data = Object.values(comptesParJour).sort((a: any, b: any) => {
    const [da, ma] = a.jour.split('/').map(Number);
    const [db, mb] = b.jour.split('/').map(Number);
    return ma !== mb ? ma - mb : da - db;
  }).slice(-30);
  return (
    <ResponsiveContainer width='100%' height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id='restaurant' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#f97316' stopOpacity={0.3}/>
            <stop offset='95%' stopColor='#f97316' stopOpacity={0}/>
          </linearGradient>
          <linearGradient id='livraison' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#4ade80' stopOpacity={0.3}/>
            <stop offset='95%' stopColor='#4ade80' stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey='jour' tick={{fill:'rgba(255,255,255,0.3)',fontSize:10}} axisLine={false} tickLine={false}/>
        <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10}} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={{background:'rgba(15,15,15,0.9)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',color:'white'}}/>
        <Area type='monotone' dataKey='restaurant' stroke='#f97316' fill='url(#restaurant)' strokeWidth={2} name='Restaurant'/>
        <Area type='monotone' dataKey='livraison' stroke='#4ade80' fill='url(#livraison)' strokeWidth={2} name='Livraison'/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function AdminRestaurant() {
  const [codes, setCodes] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, restaurant: 0, livraison: 0, utilises: 0, expires: 0 });
  const [onglet, setOnglet] = useState('stats');
  const [periode, setPeriode] = useState('mois');
  const [config, setConfig] = useState<any>({ nom: '', couleur_principale: '#f97316' });
  const [confirmation, setConfirmation] = useState('');
  const [partData, setPartData] = useState<any[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newCouleur, setNewCouleur] = useState('#f97316');
  const [newFrequence, setNewFrequence] = useState(10);
  const [newEstPerdant, setNewEstPerdant] = useState(false);
  const [newEstRoueBonus, setNewEstRoueBonus] = useState(false);
  const [sousLots, setSousLots] = useState<any[]>([]);
  const [lotBonusOuvert, setLotBonusOuvert] = useState<string|null>(null);
  const [newSousLabel, setNewSousLabel] = useState('');
  const [newSousCouleur, setNewSousCouleur] = useState('#8b5cf6');
  const [newSousProba, setNewSousProba] = useState(33);
  const [restaurantId, setRestaurantId] = useState('');
  const [slug, setSlug] = useState('');
  const router = useRouter();

  useEffect(() => {
    const slugActuel = window.location.pathname.split('/')[1];
    setSlug(slugActuel);
    const auth = document.cookie.split(';').find(c => c.trim().startsWith('admin_auth_'+slugActuel+'='));
    if (!auth) { router.push('/'+slugActuel+'/admin/login'); return; }
    const init = async () => {
      const { data: restau } = await supabase.from('restaurants').select('id').eq('slug', slugActuel).single();
      if (!restau) return;
      setRestaurantId(restau.id);
      charger(periode, restau.id);
    };
    init();
  }, []);

  const charger = async (p = periode, rid = restaurantId) => {
    if (!rid) return;
    let query = supabase.from('codes').select('*').eq('restaurant_id', rid).order('cree_le', { ascending: false });
    if (p === 'semaine') { const d = new Date(); d.setDate(d.getDate()-7); query = query.gte('cree_le', d.toISOString()); }
    else if (p === 'mois') { const d = new Date(); d.setMonth(d.getMonth()-1); query = query.gte('cree_le', d.toISOString()); }
    const { data: codesData } = await query.limit(50);
    let partQuery = supabase.from('participations').select('*').eq('restaurant_id', rid);
    if (p === 'semaine') { const d = new Date(); d.setDate(d.getDate()-7); partQuery = partQuery.gte('cree_le', d.toISOString()); }
    else if (p === 'mois') { const d = new Date(); d.setMonth(d.getMonth()-1); partQuery = partQuery.gte('cree_le', d.toISOString()); }
    const { data: partData } = await partQuery;
    if (partData) setPartData(partData);
    const { data: lotsData } = await supabase.from('lots').select('*').eq('restaurant_id', rid).order('probabilite', { ascending: false });
    const { data: configData } = await supabase.from('config').select('*').eq('restaurant_id', rid).single();
    if (configData) { const { mot_de_passe, ...rest } = configData; setConfig(rest); }
    if (codesData) {
      setCodes(codesData);
      setStats({ total: partData?.length || 0, restaurant: partData?.filter(p => p.mode==='restaurant').length || 0, livraison: partData?.filter(p => p.mode==='livraison').length || 0, utilises: codesData.filter(c => c.utilise).length, expires: codesData.filter(c => c.expire_le && new Date(c.expire_le) < new Date()).length });
    }
    if (lotsData) setLots(lotsData);
  };

  const totalProbas = () => lots.filter(l => !l.est_perdant).reduce((a, l) => a + l.probabilite, 0);
  const probaRestante = () => Math.max(0, 100 - totalProbas());

  const modifierProba = async (id: string, probabilite: number) => {
    await supabase.from('lots').update({ probabilite }).eq('id', id);
    setConfirmation('Frequence mise a jour !'); setTimeout(() => setConfirmation(''), 2000);
    charger(periode, restaurantId);
  };

  const modifierLabel = async (id: string, valeur: string) => {
    await supabase.from('lots').update({ label: valeur }).eq('id', id);
    setConfirmation('Nom mis a jour !'); setTimeout(() => setConfirmation(''), 2000);
    charger(periode, restaurantId);
  };

  const toggleActif = async (id: string, actif: boolean) => {
    await supabase.from('lots').update({ actif: !actif }).eq('id', id);
    charger(periode, restaurantId);
  };

  const ajouterLot = async () => {
    if (!newLabel) return;
    if (!newEstPerdant && !newEstRoueBonus && totalProbas() + newFrequence > 100) { setConfirmation('Total depasse 100% !'); setTimeout(() => setConfirmation(''), 3000); return; }
    await supabase.from('lots').insert({ label: newLabel, couleur: newCouleur, probabilite: newEstPerdant ? 0 : newFrequence, actif: true, restaurant_id: restaurantId, est_perdant: newEstPerdant, est_roue_bonus: newEstRoueBonus });
    setNewLabel(''); setNewCouleur('#f97316'); setNewFrequence(10); setNewEstPerdant(false); setNewEstRoueBonus(false);
    setConfirmation('Lot ajoute !'); setTimeout(() => setConfirmation(''), 2000);
    charger(periode, restaurantId);
  };

  const chargerSousLots = async (lotId: string) => { const { data } = await supabase.from('sous_lots').select('*').eq('lot_id', lotId); if (data) setSousLots(data); };
  const ajouterSousLot = async (lotId: string) => {
    if (!newSousLabel) return;
    await supabase.from('sous_lots').insert({ label: newSousLabel, couleur: newSousCouleur, probabilite: newSousProba, actif: true, lot_id: lotId, restaurant_id: restaurantId });
    setNewSousLabel(''); setNewSousCouleur('#8b5cf6'); setNewSousProba(33);
    chargerSousLots(lotId);
  };
  const supprimerSousLot = async (id: string, lotId: string) => { await supabase.from('sous_lots').delete().eq('id', id); chargerSousLots(lotId); };
  const supprimerCode = async (id: string) => { if (!confirm('Supprimer ce code ?')) return; await supabase.from('codes').delete().eq('id', id); charger(periode, restaurantId); };
  const supprimerTout = async () => { if (!confirm('Supprimer tous les codes ?')) return; await supabase.from('codes').delete().eq('restaurant_id', restaurantId); charger(periode, restaurantId); };

  const pieData = [
    { name: 'Restaurant', value: stats.restaurant, color: '#f97316' },
    { name: 'Livraison', value: stats.livraison, color: '#4ade80' },
  ].filter(d => d.value > 0);

  const cardStyle: any = { background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'20px', padding:'20px', textAlign:'center' as const };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)',padding:'16px',maxWidth:'100%',overflowX:'hidden',boxSizing:'border-box'}}>
      <div style={{position:'fixed',top:'-100px',left:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(249,115,22,0.06) 0%,transparent 70%)',pointerEvents:'none',zIndex:0}}/>

      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',position:'relative',zIndex:1}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:'800',color:'white',margin:'0',letterSpacing:'-0.3px'}}>Dashboard</h1>
          <p style={{color:'#f97316',fontSize:'14px',margin:'2px 0 0',fontWeight:'bold'}}>{config.nom}</p>
        </div>
        <button onClick={() => { document.cookie='admin_auth_'+slug+'=; max-age=0; path=/'; router.push('/'+slug+'/admin/login'); }} style={{background:'rgba(239,68,68,0.15)',color:'#f87171',padding:'8px 16px',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.3)',cursor:'pointer',fontWeight:'bold',fontSize:'14px'}}>
          Deconnexion
        </button>
      </motion.div>

      <div style={{display:'flex',gap:'6px',marginBottom:'20px',position:'relative',zIndex:1}}>
        {['stats','lots','codes','params'].map(o => (
          <motion.button key={o} onClick={() => setOnglet(o)} whileTap={{scale:0.95}} style={{padding:'10px 16px',borderRadius:'12px',border:'none',cursor:'pointer',background:onglet===o?'linear-gradient(135deg,#f97316,#ea580c)':'rgba(255,255,255,0.06)',color:'white',fontWeight:'bold',fontSize:'13px',flex:1,backdropFilter:'blur(10px)'}}>
            {o.charAt(0).toUpperCase()+o.slice(1)}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode='wait'>
        {onglet === 'stats' && (
          <motion.div key='stats' initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}>
            <div style={{display:'flex',gap:'6px',marginBottom:'16px'}}>
              {[['semaine','Semaine'],['mois','Mois'],['tout','Tout']].map(([val,label]) => (
                <button key={val} onClick={() => { setPeriode(val); charger(val, restaurantId); }} style={{padding:'8px 14px',borderRadius:'10px',border:'none',cursor:'pointer',background:periode===val?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.05)',color:periode===val?'white':'rgba(255,255,255,0.4)',fontWeight:'bold',fontSize:'13px',flex:1}}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'16px'}}>
              {[
                { label:'Total', value:stats.total, color:'white' },
                { label:'🍽️ Restaurant', value:stats.restaurant, color:'#f97316' },
                { label:'🛵 Livraison', value:stats.livraison, color:'#4ade80' },
                { label:'Cadeaux', value:stats.utilises, color:'#4ade80' },
                { label:'Expires', value:stats.expires, color:'#f87171' },
                { label:'Taux', value:(stats.total > 0 ? Math.round(stats.utilises/stats.total*100) : 0)+'%', color:'#f97316' },
              ].map((s, i) => (
                <motion.div key={i} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:i*0.05}} style={cardStyle}>
                  <p style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',margin:'0 0 6px'}}>{s.label}</p>
                  <p style={{fontSize:'28px',fontWeight:'800',color:s.color,margin:'0'}}>{s.value}</p>
                </motion.div>
              ))}
            </div>

            {pieData.length > 0 && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}} style={{...cardStyle,marginBottom:'16px',display:'flex',alignItems:'center',gap:'16px'}}>
                <PieChart width={100} height={100}>
                  <Pie data={pieData} cx={50} cy={50} innerRadius={30} outerRadius={45} dataKey='value'>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                  </Pie>
                </PieChart>
                <div style={{flex:1}}>
                  {pieData.map((d, i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                      <div style={{width:'8px',height:'8px',borderRadius:'50%',background:d.color}}/>
                      <span style={{color:'rgba(255,255,255,0.6)',fontSize:'13px'}}>{d.name} — <strong style={{color:'white'}}>{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}} style={{...cardStyle,textAlign:'left'}}>
              <h3 style={{fontSize:'14px',fontWeight:'bold',color:'white',marginBottom:'16px',margin:'0 0 16px'}}>Participations par jour</h3>
              <GraphiqueArea partData={partData}/>
            </motion.div>
          </motion.div>
        )}

        {onglet === 'lots' && (
          <motion.div key='lots' initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} style={{...cardStyle,textAlign:'left'}}>
            <h2 style={{fontSize:'16px',fontWeight:'800',color:'white',marginBottom:'12px'}}>Gestion des lots</h2>
            {confirmation && <motion.p initial={{opacity:0}} animate={{opacity:1}} style={{color:confirmation.includes('depasse')?'#f87171':'#4ade80',fontWeight:'bold',marginBottom:'12px',background:confirmation.includes('depasse')?'rgba(220,38,38,0.1)':'rgba(22,163,74,0.1)',padding:'10px',borderRadius:'10px'}}>{confirmation}</motion.p>}

            <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'14px',padding:'14px',marginBottom:'16px'}}>
              <p style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',margin:'0 0 4px'}}>Chance de gagner</p>
              <p style={{fontSize:'20px',fontWeight:'800',color:totalProbas()>100?'#f87171':'#f97316',margin:'0 0 4px'}}>{totalProbas()}% <span style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',fontWeight:'normal'}}>({probaRestante()}% perdant)</span></p>
              <p style={{fontSize:'13px',color:'rgba(255,255,255,0.4)',margin:'0 0 10px'}}>soit {totalProbas()>0?Math.round(totalProbas()/10):'?'} client{Math.round(totalProbas()/10)>1?'s':''} sur 10 gagnent</p>
              <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                <p style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',margin:'0'}}>Cases perdantes :</p>
                <select value={config.nb_segments_perdants||1} onChange={async (e) => { const val=parseInt(e.target.value); setConfig({...config,nb_segments_perdants:val}); await supabase.from('config').update({nb_segments_perdants:val}).eq('id',config.id); setConfirmation('Mis a jour !'); setTimeout(()=>setConfirmation(''),2000); }} style={{padding:'6px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.15)',fontSize:'13px',background:'rgba(255,255,255,0.08)',color:'white'}}>
                  <option value={1}>1 case ({probaRestante()}%)</option>
                  <option value={2}>2 cases ({Math.floor(probaRestante()/2)}% chacune)</option>
                  <option value={3}>3 cases ({Math.floor(probaRestante()/3)}% chacune)</option>
                  <option value={4}>4 cases ({Math.floor(probaRestante()/4)}% chacune)</option>
                </select>
              </div>
            </div>

            <div style={{display:'flex',flexWrap:'wrap',gap:'8px',padding:'14px',background:'rgba(255,255,255,0.04)',borderRadius:'14px',marginBottom:'16px',alignItems:'center'}}>
              <input value={newLabel} onChange={(e)=>setNewLabel(e.target.value)} placeholder='Nom du lot' style={{flex:1,minWidth:'120px',padding:'10px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.15)',fontSize:'14px',background:'rgba(255,255,255,0.08)',color:'white',outline:'none'}}/>
              <input type='color' value={newCouleur} onChange={(e)=>setNewCouleur(e.target.value)} style={{width:'40px',height:'40px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.15)',cursor:'pointer',background:'transparent'}}/>
              {!newEstPerdant && (
                <select value={OPTIONS_FREQUENCE.find(o=>o.probabilite===newFrequence)?newFrequence:'custom'} onChange={(e)=>{if(e.target.value!=='custom')setNewFrequence(parseInt(e.target.value));}} style={{padding:'10px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.15)',fontSize:'13px',background:'rgba(255,255,255,0.08)',color:'white'}}>
                  {OPTIONS_FREQUENCE.map(o=><option key={o.probabilite} value={o.probabilite}>{o.label}</option>)}
                  <option value='custom'>Personnaliser...</option>
                </select>
              )}
              <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',color:'#fbbf24',cursor:'pointer',fontWeight:'bold'}}>
                <input type='checkbox' checked={newEstRoueBonus} onChange={(e)=>{setNewEstRoueBonus(e.target.checked);if(e.target.checked)setNewEstPerdant(false);}}/>
                🎰 Bonus
              </label>
              <motion.button onClick={ajouterLot} whileTap={{scale:0.95}} style={{padding:'10px 16px',borderRadius:'10px',border:'none',cursor:'pointer',background:'linear-gradient(135deg,#f97316,#ea580c)',color:'white',fontWeight:'800',fontSize:'14px'}}>
                Ajouter
              </motion.button>
            </div>

            {newEstRoueBonus && (
              <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'12px',padding:'14px',marginBottom:'16px'}}>
                <p style={{color:'#fbbf24',fontSize:'13px',margin:'0'}}>🎰 <strong>Roue bonus</strong> — Declenche une 2eme roue surprise. Ideal pour ecouler vos stocks !</p>
              </div>
            )}

            {lots.map((lot) => (
              <div key={lot.id} style={{marginBottom:'8px'}}>
                <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'8px',padding:'12px',borderRadius:'14px',border:lot.est_roue_bonus?'1px solid rgba(245,158,11,0.4)':'1px solid rgba(255,255,255,0.08)',background:lot.est_roue_bonus?'rgba(245,158,11,0.06)':'rgba(255,255,255,0.04)'}}>
                  <div style={{width:'14px',height:'14px',borderRadius:'50%',background:lot.couleur,flexShrink:0,boxShadow:'0 0 6px '+lot.couleur}}/>
                  {lot.est_roue_bonus && <span style={{background:'rgba(245,158,11,0.2)',color:'#fbbf24',fontSize:'10px',fontWeight:'bold',padding:'2px 8px',borderRadius:'20px',border:'1px solid rgba(245,158,11,0.3)'}}>🎰 BONUS</span>}
                  <input defaultValue={lot.label} onBlur={(e)=>modifierLabel(lot.id,e.target.value)} style={{flex:1,padding:'8px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',fontSize:'14px',background:'rgba(255,255,255,0.06)',color:'white',outline:'none'}}/>
                  {lot.est_perdant ? (
                    <span style={{color:'rgba(255,255,255,0.3)',fontSize:'12px',fontStyle:'italic'}}>Perdant</span>
                  ) : (
                    <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                      <select value={OPTIONS_FREQUENCE.find(o=>o.probabilite===lot.probabilite)?lot.probabilite:'custom'} onChange={(e)=>{if(e.target.value!=='custom')modifierProba(lot.id,parseInt(e.target.value));}} style={{padding:'6px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',fontSize:'12px',background:'rgba(255,255,255,0.06)',color:'white'}}>
                        {OPTIONS_FREQUENCE.map(o=><option key={o.probabilite} value={o.probabilite}>{o.label}</option>)}
                        <option value='custom'>Personnaliser...</option>
                      </select>
                      <span style={{color:lot.est_roue_bonus?'#fbbf24':'#f97316',fontSize:'12px',fontWeight:'bold'}}>{lot.probabilite}%</span>
                    </div>
                  )}
                  <button onClick={()=>toggleActif(lot.id,lot.actif)} style={{padding:'6px 10px',borderRadius:'8px',border:'none',cursor:'pointer',background:lot.actif?'rgba(22,163,74,0.15)':'rgba(220,38,38,0.15)',color:lot.actif?'#4ade80':'#f87171',fontSize:'12px',fontWeight:'bold'}}>
                    {lot.actif?'Actif':'Inactif'}
                  </button>
                  {lot.est_roue_bonus && (
                    <button onClick={()=>{if(lotBonusOuvert===lot.id){setLotBonusOuvert(null);}else{setLotBonusOuvert(lot.id);chargerSousLots(lot.id);}}} style={{padding:'6px 10px',borderRadius:'8px',border:'none',cursor:'pointer',background:'rgba(245,158,11,0.1)',color:'#fbbf24',fontSize:'12px',fontWeight:'bold'}}>
                      {lotBonusOuvert===lot.id?'Fermer':'Sous-lots'}
                    </button>
                  )}
                  <button onClick={async()=>{if(!confirm('Supprimer ?'))return;await supabase.from('lots').delete().eq('id',lot.id);charger(periode,restaurantId);}} style={{padding:'6px 10px',borderRadius:'8px',border:'none',cursor:'pointer',background:'rgba(220,38,38,0.1)',color:'#f87171',fontSize:'12px',fontWeight:'bold'}}>
                    Suppr
                  </button>
                </div>

                <AnimatePresence>
                  {lot.est_roue_bonus && lotBonusOuvert===lot.id && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} style={{overflow:'hidden'}}>
                      <div style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)',borderTop:'none',borderRadius:'0 0 14px 14px',padding:'16px'}}>
                        <p style={{color:'#fbbf24',fontSize:'13px',marginBottom:'12px'}}>🎰 Sous-lots — ajustez selon vos stocks</p>
                        <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'12px',alignItems:'center'}}>
                          <input value={newSousLabel} onChange={(e)=>setNewSousLabel(e.target.value)} placeholder='Ex: Glace menthe' style={{flex:1,minWidth:'120px',padding:'8px',borderRadius:'8px',border:'1px solid rgba(245,158,11,0.3)',fontSize:'14px',background:'rgba(255,255,255,0.06)',color:'white',outline:'none'}}/>
                          <input type='color' value={newSousCouleur} onChange={(e)=>setNewSousCouleur(e.target.value)} style={{width:'36px',height:'36px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.15)',cursor:'pointer',background:'transparent'}}/>
                          <select value={newSousProba} onChange={(e)=>setNewSousProba(parseInt(e.target.value))} style={{padding:'8px',borderRadius:'8px',border:'1px solid rgba(245,158,11,0.3)',fontSize:'13px',background:'rgba(255,255,255,0.06)',color:'white'}}>
                            {OPTIONS_FREQUENCE.map(o=><option key={o.probabilite} value={o.probabilite}>{o.label}</option>)}
                          </select>
                          <button onClick={()=>ajouterSousLot(lot.id)} style={{padding:'8px 14px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#f59e0b',color:'white',fontWeight:'bold',fontSize:'13px'}}>+</button>
                        </div>
                        {sousLots.length===0 && <p style={{color:'rgba(255,255,255,0.3)',fontSize:'13px'}}>Aucun sous-lot</p>}
                        {sousLots.map(sl=>(
                          <div key={sl.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px',background:'rgba(255,255,255,0.04)',borderRadius:'8px',marginBottom:'6px'}}>
                            <div style={{width:'10px',height:'10px',borderRadius:'50%',background:sl.couleur}}/>
                            <span style={{flex:1,fontSize:'13px',color:'rgba(255,255,255,0.8)'}}>{sl.label}</span>
                            <span style={{fontSize:'11px',color:'#fbbf24'}}>{OPTIONS_FREQUENCE.find(o=>o.probabilite===sl.probabilite)?.label||'1 sur '+Math.round(100/sl.probabilite)} — {sl.probabilite}%</span>
                            <button onClick={()=>supprimerSousLot(sl.id,lot.id)} style={{padding:'4px 8px',borderRadius:'6px',border:'none',cursor:'pointer',background:'rgba(220,38,38,0.1)',color:'#f87171',fontSize:'12px'}}>✕</button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {onglet === 'codes' && (
          <motion.div key='codes' initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} style={{...cardStyle,textAlign:'left',overflowX:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'8px'}}>
              <h2 style={{fontSize:'16px',fontWeight:'800',color:'white',margin:'0'}}>Derniers codes</h2>
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={async()=>{if(!confirm('Supprimer les codes expires ?'))return;const exp=codes.filter(c=>c.expire_le&&new Date(c.expire_le)<new Date()&&!c.utilise);for(const c of exp){await supabase.from('codes').delete().eq('id',c.id);}charger(periode,restaurantId);}} style={{padding:'8px 12px',borderRadius:'8px',border:'none',cursor:'pointer',background:'rgba(202,138,4,0.1)',color:'#fbbf24',fontSize:'12px',fontWeight:'bold'}}>Suppr expires</button>
                <button onClick={supprimerTout} style={{padding:'8px 12px',borderRadius:'8px',border:'none',cursor:'pointer',background:'rgba(220,38,38,0.1)',color:'#f87171',fontSize:'12px',fontWeight:'bold'}}>Tout suppr</button>
              </div>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
              <thead>
                <tr style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
                  {['Code','Lot','Statut','Date',''].map((h,i)=><th key={i} style={{textAlign:'left',padding:'8px',color:'rgba(255,255,255,0.3)',fontSize:'13px'}}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {codes.map(c=>(
                  <tr key={c.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <td style={{padding:'10px 8px',fontWeight:'bold',color:'#f97316',letterSpacing:'1px'}}>{c.code}</td>
                    <td style={{padding:'10px 8px',color:'rgba(255,255,255,0.7)'}}>{c.lot}</td>
                    <td style={{padding:'10px 8px'}}>
                      {c.utilise?<span style={{background:'rgba(22,163,74,0.15)',color:'#4ade80',padding:'3px 8px',borderRadius:'20px',fontSize:'11px'}}>Utilise</span>:c.expire_le&&new Date(c.expire_le)<new Date()?<span style={{background:'rgba(220,38,38,0.15)',color:'#f87171',padding:'3px 8px',borderRadius:'20px',fontSize:'11px'}}>Expire</span>:<span style={{background:'rgba(202,138,4,0.15)',color:'#fbbf24',padding:'3px 8px',borderRadius:'20px',fontSize:'11px'}}>Attente</span>}
                    </td>
                    <td style={{padding:'10px 8px',color:'rgba(255,255,255,0.3)',fontSize:'11px'}}>{new Date(c.cree_le).toLocaleString('fr-FR')}</td>
                    <td style={{padding:'10px 8px'}}>
                      <button onClick={()=>supprimerCode(c.id)} style={{padding:'4px 8px',borderRadius:'6px',border:'none',cursor:'pointer',background:'rgba(220,38,38,0.1)',color:'#f87171',fontSize:'11px'}}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {onglet === 'params' && (
          <motion.div key='params' initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} style={{...cardStyle,textAlign:'left'}}>
            <h2 style={{fontSize:'16px',fontWeight:'800',color:'white',marginBottom:'20px'}}>Parametres</h2>

            {[
              {label:'Nom du restaurant',field:'nom',type:'text',placeholder:''},
              {label:'Lien Google Avis',field:'lien_google',type:'text',placeholder:'https://search.google.com/local/writereview?placeid=...'},
            ].map(f=>(
              <div key={f.field} style={{marginBottom:'16px'}}>
                <label style={{display:'block',color:'rgba(255,255,255,0.4)',fontSize:'13px',marginBottom:'6px'}}>{f.label}</label>
                <input value={config[f.field]||''} onChange={(e)=>setConfig({...config,[f.field]:e.target.value})} placeholder={f.placeholder} style={{width:'100%',padding:'12px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.15)',fontSize:'14px',boxSizing:'border-box',background:'rgba(255,255,255,0.06)',color:'white',outline:'none'}}/>
              </div>
            ))}

            <div style={{marginBottom:'16px'}}>
              <label style={{display:'block',color:'rgba(255,255,255,0.4)',fontSize:'13px',marginBottom:'6px'}}>Mot de passe</label>
              {!config.changeMdp ? (
                <button onClick={()=>setConfig({...config,changeMdp:true})} style={{background:'rgba(255,255,255,0.06)',color:'white',padding:'10px 20px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.15)',cursor:'pointer',fontSize:'14px',fontWeight:'bold'}}>
                  🔑 Changer mon mot de passe
                </button>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  <input type='password' autoComplete='new-password' value={config.nouveau_mdp||''} onChange={(e)=>setConfig({...config,nouveau_mdp:e.target.value})} placeholder='Nouveau mot de passe' style={{width:'100%',padding:'12px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.15)',fontSize:'14px',boxSizing:'border-box',background:'rgba(255,255,255,0.06)',color:'white',outline:'none'}}/>
                  <input type='password' autoComplete='new-password' value={config.confirmer_mdp||''} onChange={(e)=>setConfig({...config,confirmer_mdp:e.target.value})} placeholder='Confirmer' style={{width:'100%',padding:'12px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.15)',fontSize:'14px',boxSizing:'border-box',background:'rgba(255,255,255,0.06)',color:'white',outline:'none'}}/>
                  {config.nouveau_mdp&&config.confirmer_mdp&&config.nouveau_mdp!==config.confirmer_mdp&&<p style={{color:'#f87171',fontSize:'13px',margin:'0'}}>Les mots de passe ne correspondent pas</p>}
                  <button onClick={()=>setConfig({...config,changeMdp:false,nouveau_mdp:'',confirmer_mdp:''})} style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.5)',padding:'8px',borderRadius:'10px',border:'none',cursor:'pointer',fontSize:'13px'}}>Annuler</button>
                </div>
              )}
            </div>

            

            <motion.button whileTap={{scale:0.97}} onClick={async()=>{
              const updates:any={nom:config.nom,couleur_principale:config.couleur_principale,lien_google:config.lien_google};
              if(config.nouveau_mdp&&config.nouveau_mdp===config.confirmer_mdp){const bcrypt=await import('bcryptjs');updates.mot_de_passe=await bcrypt.hash(config.nouveau_mdp,10);}
              await supabase.from('config').update(updates).eq('id',config.id);
              setConfirmation('Parametres sauvegardes !'); setTimeout(()=>setConfirmation(''),2000);
            }} style={{background:'linear-gradient(135deg,#f97316,#ea580c)',color:'white',fontWeight:'800',padding:'14px 24px',borderRadius:'14px',border:'none',cursor:'pointer',fontSize:'16px',width:'100%'}}>
              Sauvegarder
            </motion.button>

            {confirmation && <motion.p initial={{opacity:0}} animate={{opacity:1}} style={{color:'#4ade80',textAlign:'center',marginTop:'12px',fontWeight:'bold'}}>{confirmation}</motion.p>}

            <div style={{marginTop:'24px',paddingTop:'20px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
              <label style={{display:'block',color:'rgba(255,255,255,0.4)',fontSize:'13px',marginBottom:'14px',fontWeight:'bold'}}>QR Codes</label>
              <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'14px',padding:'16px',marginBottom:'10px'}}>
                <p style={{color:'white',fontWeight:'bold',fontSize:'14px',marginBottom:'4px'}}>🍽️ QR Code Restaurant</p>
                <p style={{color:'rgba(255,255,255,0.3)',fontSize:'12px',marginBottom:'12px'}}>A poser sur les tables — code valable 1 heure</p>
                <button onClick={()=>window.open('/'+slug+'/chevalet','_blank')} style={{background:'rgba(255,255,255,0.1)',color:'white',fontWeight:'bold',padding:'10px 20px',borderRadius:'10px',border:'none',cursor:'pointer',fontSize:'14px'}}>
                  Voir et imprimer
                </button>
              </div>
              <div style={{background:'rgba(22,163,74,0.06)',borderRadius:'14px',padding:'16px',border:'1px solid rgba(22,163,74,0.15)'}}>
                <p style={{color:'white',fontWeight:'bold',fontSize:'14px',marginBottom:'4px'}}>🛵 QR Code Livraison</p>
                <p style={{color:'rgba(255,255,255,0.3)',fontSize:'12px',marginBottom:'12px'}}>A glisser dans les sacs — code valable 7 jours</p>
                <button onClick={()=>window.open('/'+slug+'/chevalet?mode=livraison','_blank')} style={{background:'rgba(22,163,74,0.2)',color:'#4ade80',fontWeight:'bold',padding:'10px 20px',borderRadius:'10px',border:'none',cursor:'pointer',fontSize:'14px'}}>
                  Voir et imprimer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{textAlign:'center',padding:'24px',marginTop:'16px'}}>
        <p style={{color:'rgba(255,255,255,0.15)',fontSize:'12px'}}>🎡 Spinly — Support : topicrolic@gmail.com</p>
      </div>
    </div>
  );
}