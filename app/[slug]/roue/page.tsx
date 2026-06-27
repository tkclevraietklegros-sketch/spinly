'use client';
import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../../../lib/supabase';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

function genererCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function choisirLot(lots: any[]) {
  const total = lots.reduce((acc, l) => acc + l.probabilite, 0);
  let rand = Math.floor(Math.random() * total);
  for (const lot of lots) {
    rand -= lot.probabilite;
    if (rand < 0) return lot;
  }
  return lots[lots.length - 1];
}

export default function Roue() {
  const [lots, setLots] = useState<any[]>([]);
  const [rotation, setRotation] = useState(0);
  const [tourne, setTourne] = useState(false);
  const [resultat, setResultat] = useState<any>(null);
  const [codeGagnant, setCodeGagnant] = useState('');
  const [dejaJoue, setDejaJoue] = useState(false);
  const [nomRestaurant, setNomRestaurant] = useState('');
  const [chargement, setChargement] = useState(true);
  const [taille, setTaille] = useState(280);
  const [modeLivraison, setModeLivraison] = useState(false);
  const [restaurantId, setRestaurantId] = useState('');
  const [slugState, setSlugState] = useState('');
  const [sousLots, setSousLots] = useState<any[]>([]);
  const [rotationBonus, setRotationBonus] = useState(0);
  const [tourneBonus, setTourneBonus] = useState(false);
  const [resultatBonus, setResultatBonus] = useState<any>(null);
  const [etapeBonus, setEtapeBonus] = useState(false);

  useEffect(() => {
    const slugActuel = window.location.pathname.split('/')[1];
    if (!slugActuel) { setChargement(false); return; }
    setSlugState(slugActuel);
    const p = new URLSearchParams(window.location.search);
    const estLivraison = p.get('mode') === 'livraison';
    setModeLivraison(estLivraison);
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('roue_joue_'+slugActuel+'='));
    if (cookie) setDejaJoue(true);
    const chargerLots = async () => {
      const { data: restau } = await supabase.from('restaurants').select('id').eq('slug', slugActuel).single();
      if (!restau) { setChargement(false); return; }
      setRestaurantId(restau.id);
      const { data } = await supabase.from('lots').select('*').eq('actif', true).eq('restaurant_id', restau.id);
      const { data: configData2 } = await supabase.from('config').select('nb_segments_perdants').eq('restaurant_id', restau.id).single();
      if (data && configData2) {
        const nbPerdants = configData2.nb_segments_perdants || 1;
        const lotsGagnants = data.filter((l: any) => !l.est_perdant);
        const totalGagnants = lotsGagnants.reduce((acc: number, l: any) => acc + l.probabilite, 0);
        const probaRestante = Math.max(0, 100 - totalGagnants);
        const probaParPerdant = Math.floor(probaRestante / nbPerdants);
        const segmentsPerdants = Array.from({ length: nbPerdants }, (_, i) => ({
          id: 'perdant-'+i,
          label: 'Pas de chance !',
          couleur: '#374151',
          probabilite: probaParPerdant,
          est_perdant: true,
          est_roue_bonus: false,
        }));
        const tousLots = [...lotsGagnants, ...segmentsPerdants];
        for (let i = tousLots.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [tousLots[i], tousLots[j]] = [tousLots[j], tousLots[i]];
        }
        setLots(tousLots);
      } else if (data) {
        setLots(data.filter((l: any) => !l.est_perdant));
      }
      const { data: configData } = await supabase.from('config').select('nom').eq('restaurant_id', restau.id).single();
      if (configData) setNomRestaurant(configData.nom);
      setChargement(false);
    };
    chargerLots();
    const updateTaille = () => {
      const t = Math.min(window.innerWidth - 48, 320);
      setTaille(t);
    };
    updateTaille();
    window.addEventListener('resize', updateTaille);
    return () => window.removeEventListener('resize', updateTaille);
  }, []);

  const tourner = async () => {
    if (tourne || dejaJoue || lots.length === 0) return;
    setTourne(true);
    setResultat(null);
    setCodeGagnant('');
    const lot = choisirLot(lots);
    const index = lots.indexOf(lot);
    const segmentAngle = 360 / lots.length;
    const cibleAngle = 360 - (index * segmentAngle + segmentAngle / 2);
    const deg = 360 * 6 + cibleAngle;
    setRotation((r) => r + deg);
    setTimeout(async () => {
      setResultat(lot);
      await supabase.from('participations').insert({ lot: lot.label, restaurant_id: restaurantId, mode: modeLivraison ? 'livraison' : 'restaurant' });
      const cookieExp = new Date();
      cookieExp.setDate(cookieExp.getDate() + 7);
      document.cookie = 'roue_joue_'+slugState+'=1; expires=' + cookieExp.toUTCString() + '; path=/';
      setDejaJoue(true);
      setTourne(false);
      if (lot.est_roue_bonus) {
        const { data: sl } = await supabase.from('sous_lots').select('*').eq('lot_id', lot.id).eq('actif', true);
        if (sl && sl.length > 0) {
          setSousLots(sl);
          setEtapeBonus(true);
          setTimeout(() => tournerBonus(sl, lot), 800);
        }
      } else if (!lot.est_perdant) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#f59e0b', '#f97316', '#fbbf24', '#ffffff'] });
        const nouveau = genererCode();
        setCodeGagnant(nouveau);
        const duree = modeLivraison ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
        const expiration = new Date(Date.now() + duree);
        await supabase.from('codes').insert({ code: nouveau, lot: lot.label, expire_le: expiration.toISOString(), restaurant_id: restaurantId });
      }
    }, 4000);
  };

  const tournerBonus = async (sl: any[], lotParent: any) => {
    setTourneBonus(true);
    const sousLot = choisirLot(sl);
    const index = sl.indexOf(sousLot);
    const segmentAngle = 360 / sl.length;
    const cibleAngle = 360 - (index * segmentAngle + segmentAngle / 2);
    const deg = 360 * 5 + cibleAngle;
    setRotationBonus((r) => r + deg);
    setTimeout(async () => {
      setResultatBonus(sousLot);
      setTourneBonus(false);
      confetti({ particleCount: 250, spread: 120, origin: { y: 0.6 }, colors: ['#f59e0b', '#fbbf24', '#ffffff', '#f97316'] });
      const nouveau = genererCode();
      setCodeGagnant(nouveau);
      const duree = modeLivraison ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
      const expiration = new Date(Date.now() + duree);
      await supabase.from('codes').insert({ code: nouveau, lot: sousLot.label, expire_le: expiration.toISOString(), restaurant_id: restaurantId });
    }, 6000);
  };

  const centre = taille / 2;
  const rayon = centre - 10;
  const segments = lots.length;

  const CardResultat = ({ enfants }: { enfants: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '28px',
        padding: '28px',
        textAlign: 'center',
        width: '100%',
      }}
    >
      {enfants}
    </motion.div>
  );

  if (lots.length === 0 && !chargement) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)'}}>
      <p style={{color:'rgba(255,255,255,0.5)'}}>Aucun lot disponible</p>
    </div>
  );

  const urlValidation = codeGagnant ? 'https://spinlyo.vercel.app/'+slugState+'/valider?code=' + codeGagnant : '';

  if (chargement) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)'}}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{width:'40px',height:'40px',border:'3px solid rgba(249,115,22,0.3)',borderTop:'3px solid #f97316',borderRadius:'50%'}}/>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{position:'absolute',top:'-100px',left:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(249,115,22,0.08) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-100px',right:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>

      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.6}} style={{textAlign:'center',marginBottom:'32px'}}>
        <h1 style={{fontSize:'32px',fontWeight:'800',color:'white',marginBottom:'6px',letterSpacing:'-0.5px'}}>Tournez la roue !</h1>
        <p style={{color:'rgba(255,255,255,0.5)',fontSize:'15px',margin:'0'}}>{nomRestaurant} vous offre une chance de gagner</p>
      </motion.div>

      {dejaJoue && !resultat ? (
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} style={{
          background:'rgba(255,255,255,0.06)',
          backdropFilter:'blur(20px)',
          border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:'28px',
          padding:'40px 32px',
          textAlign:'center',
          maxWidth:'320px',
          width:'100%',
        }}>
          <div style={{fontSize:'64px',marginBottom:'16px'}}>⏳</div>
          <h2 style={{fontSize:'24px',fontWeight:'bold',color:'white',marginBottom:'8px'}}>A bientot !</h2>
          <p style={{color:'rgba(255,255,255,0.5)',marginBottom:'20px',lineHeight:'1.6'}}>Vous avez deja tente votre chance lors de cette visite.</p>
          <div style={{background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.3)',borderRadius:'16px',padding:'16px'}}>
            <p style={{color:'#f97316',fontWeight:'bold',fontSize:'14px',margin:'0'}}>Revenez dans 7 jours pour retenter votre chance !</p>
          </div>
        </motion.div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%',maxWidth:'400px'}}>
          <div style={{position:'relative',width:taille,height:taille,marginBottom:'32px',display:resultat && resultat.est_roue_bonus ? 'none' : 'block'}}>
            <div style={{position:'absolute',inset:'-8px',borderRadius:'50%',background:'conic-gradient(from 0deg,#f59e0b,#f97316,#ef4444,#8b5cf6,#3b82f6,#10b981,#f59e0b)',opacity:0.4,filter:'blur(8px)'}}/>
            <div style={{position:'absolute',inset:'-4px',borderRadius:'50%',border:'2px solid rgba(249,115,22,0.4)'}}/>
            <svg width={taille} height={taille} style={{
              transform:'rotate('+rotation+'deg)',
              transition:tourne?'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)':'none',
              borderRadius:'50%',
              boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
              position:'relative',
              zIndex:1,
            }}>
              {lots.map((lot, i) => {
                const angle = (2 * Math.PI) / segments;
                const start = i * angle - Math.PI / 2;
                const end = start + angle;
                const x1 = centre + rayon * Math.cos(start);
                const y1 = centre + rayon * Math.sin(start);
                const x2 = centre + rayon * Math.cos(end);
                const y2 = centre + rayon * Math.sin(end);
                const mx = centre + (rayon * 0.65) * Math.cos(start + angle / 2);
                const my = centre + (rayon * 0.65) * Math.sin(start + angle / 2);
                return (
                  <g key={i}>
                    <path d={'M'+centre+','+centre+' L'+x1+','+y1+' A'+rayon+','+rayon+' 0 0,1 '+x2+','+y2+' Z'} fill={lot.couleur} stroke='rgba(255,255,255,0.3)' strokeWidth='1.5'/>
                    <text x={mx} y={my} textAnchor='middle' dominantBaseline='middle' fill='white' fontSize='10' fontWeight='bold' style={{textShadow:'0 1px 3px rgba(0,0,0,0.5)'}} transform={'rotate('+(180/Math.PI)*(start+angle/2+Math.PI/2)+','+mx+','+my+')'}>{lot.label}</text>
                  </g>
                );
              })}
            </svg>
            <div style={{position:'absolute',top:'-20px',left:'50%',transform:'translateX(-50%)',fontSize:'36px',zIndex:10,filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'}}>&#9660;</div>
            <div style={{position:'absolute',inset:'0',borderRadius:'50%',background:'linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 50%)',pointerEvents:'none',zIndex:2}}/>
          </div>

          <AnimatePresence mode='wait'>
            {!resultat ? (
              <motion.button
                key='bouton'
                onClick={tourner}
                disabled={tourne}
                whileHover={!tourne ? {scale:1.05} : {}}
                whileTap={!tourne ? {scale:0.95} : {}}
                animate={!tourne ? {boxShadow:['0 0 20px rgba(249,115,22,0.3)','0 0 40px rgba(249,115,22,0.6)','0 0 20px rgba(249,115,22,0.3)']} : {}}
                transition={{duration:2,repeat:Infinity}}
                style={{
                  background:'linear-gradient(135deg,#f97316,#ea580c)',
                  color:'white',
                  fontWeight:'800',
                  padding:'18px 56px',
                  borderRadius:'20px',
                  fontSize:'22px',
                  border:'none',
                  cursor:tourne?'not-allowed':'pointer',
                  opacity:tourne?0.6:1,
                  width:'100%',
                  maxWidth:'300px',
                  letterSpacing:'0.5px',
                }}
              >
                {tourne ? 'En cours...' : 'Tourner !'}
              </motion.button>
            ) : resultat && resultat.est_roue_bonus ? (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}}>
                {!resultatBonus ? (
                  <>
                    <motion.div
                      initial={{opacity:0,y:20}}
                      animate={{opacity:1,y:0}}
                      style={{
                        background:'rgba(245,158,11,0.1)',
                        border:'2px solid rgba(245,158,11,0.4)',
                        borderRadius:'20px',
                        padding:'20px',
                        marginBottom:'24px',
                        textAlign:'center',
                        width:'100%',
                      }}
                    >
                      <p style={{fontSize:'32px',marginBottom:'8px'}}>🎰</p>
                      <p style={{color:'#fbbf24',fontWeight:'bold',fontSize:'18px',margin:'0 0 4px'}}>Roue bonus !</p>
                      <p style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',margin:'0'}}>Une surprise vous attend...</p>
                    </motion.div>
                    <div style={{position:'relative',width:taille,height:taille,marginBottom:'16px'}}>
                      <div style={{position:'absolute',inset:'-6px',borderRadius:'50%',background:'conic-gradient(from 0deg,#f59e0b,#fbbf24,#f59e0b)',opacity:0.5,filter:'blur(6px)'}}/>
                      <svg width={taille} height={taille} style={{transform:'rotate('+rotationBonus+'deg)',transition:tourneBonus?'transform 6s cubic-bezier(0.25,0.1,0.1,1)':'none',borderRadius:'50%',boxShadow:'0 20px 60px rgba(245,158,11,0.3)',position:'relative',zIndex:1}}>
                        {sousLots.map((sl, i) => {
                          const angle = (2 * Math.PI) / sousLots.length;
                          const start = i * angle - Math.PI / 2;
                          const end = start + angle;
                          const cx = taille/2;
                          const cy = taille/2;
                          const r = cx - 10;
                          const x1 = cx + r * Math.cos(start);
                          const y1 = cy + r * Math.sin(start);
                          const x2 = cx + r * Math.cos(end);
                          const y2 = cy + r * Math.sin(end);
                          const mx = cx + (r * 0.65) * Math.cos(start + angle / 2);
                          const my = cy + (r * 0.65) * Math.sin(start + angle / 2);
                          return (
                            <g key={i}>
                              <path d={'M'+cx+','+cy+' L'+x1+','+y1+' A'+r+','+r+' 0 0,1 '+x2+','+y2+' Z'} fill={sl.couleur} stroke='rgba(255,255,255,0.3)' strokeWidth='1.5'/>
                              <text x={mx} y={my} textAnchor='middle' dominantBaseline='middle' fill='white' fontSize='10' fontWeight='bold' transform={'rotate('+(180/Math.PI)*(start+angle/2+Math.PI/2)+','+mx+','+my+')'}>{sl.label}</text>
                            </g>
                          );
                        })}
                      </svg>
                      <div style={{position:'absolute',top:'-20px',left:'50%',transform:'translateX(-50%)',fontSize:'36px',zIndex:10}}>&#9660;</div>
                    </div>
                    {tourneBonus && (
                      <motion.p animate={{opacity:[1,0.4,1]}} transition={{duration:1,repeat:Infinity}} style={{color:'#fbbf24',fontWeight:'bold',fontSize:'16px'}}>
                        La roue tourne...
                      </motion.p>
                    )}
                  </>
                ) : (
                  <CardResultat enfants={
                    <>
                      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:300,damping:15}} style={{fontSize:'56px',marginBottom:'16px'}}>🎉</motion.div>
                      <h2 style={{fontSize:'26px',fontWeight:'800',color:'white',marginBottom:'6px'}}>Felicitations !</h2>
                      <p style={{fontSize:'14px',color:'rgba(255,255,255,0.5)',marginBottom:'16px'}}>{nomRestaurant} vous offre...</p>
                      <p style={{fontSize:'26px',color:'#fbbf24',fontWeight:'bold',marginBottom:'24px'}}>{resultatBonus.label}</p>
                      {modeLivraison ? (
                        <div>
                          <div style={{display:'flex',justifyContent:'center',marginBottom:'16px',padding:'12px',background:'white',borderRadius:'16px',width:'fit-content',margin:'0 auto 16px'}}>
                            <QRCodeCanvas value={urlValidation} size={150}/>
                          </div>
                          <div style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'16px',padding:'16px',marginBottom:'12px'}}>
                            <p style={{color:'rgba(255,255,255,0.5)',fontSize:'12px',marginBottom:'6px'}}>Votre code cadeau</p>
                            <p style={{fontSize:'28px',fontWeight:'bold',color:'#fbbf24',letterSpacing:'6px',margin:'0 0 6px'}}>{codeGagnant}</p>
                            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',margin:'0'}}>Valable 7 jours</p>
                          </div>
                          <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'16px',padding:'16px'}}>
                            <p style={{fontSize:'24px',marginBottom:'6px'}}>📸</p>
                            <p style={{color:'#10b981',fontWeight:'bold',fontSize:'14px',marginBottom:'4px'}}>Faites une capture d ecran !</p>
                            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',margin:'0'}}>Presentez cette page lors de votre prochaine visite pour recuperer votre cadeau.</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{display:'flex',justifyContent:'center',marginBottom:'16px',padding:'12px',background:'white',borderRadius:'16px',width:'fit-content',margin:'0 auto 16px'}}>
                            <QRCodeCanvas value={urlValidation} size={150}/>
                          </div>
                          <div style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'16px',padding:'16px',marginBottom:'8px'}}>
                            <p style={{color:'rgba(255,255,255,0.5)',fontSize:'12px',marginBottom:'6px'}}>Code de secours</p>
                            <p style={{fontSize:'28px',fontWeight:'bold',color:'#fbbf24',letterSpacing:'6px',margin:'0'}}>{codeGagnant}</p>
                          </div>
                          <p style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',marginBottom:'6px'}}>Code valable 1 heure</p>
                          <p style={{color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>Montrez ce QR code a votre serveur</p>
                        </div>
                      )}
                    </>
                  }/>
                )}
              </div>
            ) : resultat && !resultat.est_perdant ? (
              <CardResultat enfants={
                <>
                  <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:300,damping:15}} style={{fontSize:'56px',marginBottom:'16px'}}>🎉</motion.div>
                  <h2 style={{fontSize:'26px',fontWeight:'800',color:'white',marginBottom:'6px'}}>Felicitations !</h2>
                  <p style={{fontSize:'14px',color:'rgba(255,255,255,0.5)',marginBottom:'16px'}}>{nomRestaurant} vous offre...</p>
                  <p style={{fontSize:'26px',color:'#f97316',fontWeight:'bold',marginBottom:'24px'}}>{resultat.label}</p>
                  {modeLivraison ? (
                    <div>
                      <div style={{display:'flex',justifyContent:'center',padding:'12px',background:'white',borderRadius:'16px',width:'fit-content',margin:'0 auto 16px'}}>
                        <QRCodeCanvas value={urlValidation} size={150}/>
                      </div>
                      <div style={{background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.3)',borderRadius:'16px',padding:'16px',marginBottom:'12px'}}>
                        <p style={{color:'rgba(255,255,255,0.5)',fontSize:'12px',marginBottom:'6px'}}>Votre code cadeau</p>
                        <p style={{fontSize:'28px',fontWeight:'bold',color:'#f97316',letterSpacing:'6px',margin:'0 0 6px'}}>{codeGagnant}</p>
                        <p style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',margin:'0'}}>Valable 7 jours</p>
                      </div>
                      <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'16px',padding:'16px'}}>
                        <p style={{fontSize:'24px',marginBottom:'6px'}}>📸</p>
                        <p style={{color:'#10b981',fontWeight:'bold',fontSize:'14px',marginBottom:'4px'}}>Faites une capture d ecran !</p>
                        <p style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',margin:'0'}}>Presentez cette page lors de votre prochaine visite pour recuperer votre cadeau.</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{display:'flex',justifyContent:'center',padding:'12px',background:'white',borderRadius:'16px',width:'fit-content',margin:'0 auto 16px'}}>
                        <QRCodeCanvas value={urlValidation} size={150}/>
                      </div>
                      <div style={{background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.3)',borderRadius:'16px',padding:'16px',marginBottom:'8px'}}>
                        <p style={{color:'rgba(255,255,255,0.5)',fontSize:'12px',marginBottom:'6px'}}>Code de secours</p>
                        <p style={{fontSize:'28px',fontWeight:'bold',color:'#f97316',letterSpacing:'6px',margin:'0'}}>{codeGagnant}</p>
                      </div>
                      <p style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',marginBottom:'6px'}}>Code valable 1 heure</p>
                      <p style={{color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>Montrez ce QR code a votre serveur</p>
                    </div>
                  )}
                </>
              }/>
            ) : (
              <motion.div
                key='perdu'
                initial={{opacity:0,scale:0.9}}
                animate={{opacity:1,scale:1}}
                style={{
                  background:'rgba(255,255,255,0.06)',
                  backdropFilter:'blur(20px)',
                  border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:'28px',
                  padding:'40px',
                  textAlign:'center',
                  width:'100%',
                }}
              >
                <div style={{fontSize:'56px',marginBottom:'16px'}}>😔</div>
                <h2 style={{fontSize:'24px',fontWeight:'bold',color:'white',marginBottom:'8px'}}>Dommage !</h2>
                <p style={{color:'rgba(255,255,255,0.4)'}}>Tentez votre chance a votre prochaine visite</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}