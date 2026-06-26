'use client';
import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../../../lib/supabase';
import confetti from 'canvas-confetti';

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
          couleur: '#9ca3af',
          probabilite: probaParPerdant,
          est_perdant: true,
          est_roue_bonus: false,
        }));
        setLots([...lotsGagnants, ...segmentsPerdants]);
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
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
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
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      const nouveau = genererCode();
      setCodeGagnant(nouveau);
      const duree = modeLivraison ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
      const expiration = new Date(Date.now() + duree);
      await supabase.from('codes').insert({ code: nouveau, lot: sousLot.label, expire_le: expiration.toISOString(), restaurant_id: restaurantId });
    }, 4000);
  };

  const centre = taille / 2;
  const rayon = centre - 10;
  const segments = lots.length;
  if (lots.length === 0 && !chargement) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#ffedd5 0%,#fef3e2 100%)'}}>
      <p style={{color:'#6b7280'}}>Aucun lot disponible</p>
    </div>
  );
  const urlValidation = codeGagnant ? 'https://spinlyo.vercel.app/'+slugState+'/valider?code=' + codeGagnant : '';

  if (chargement) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#ffedd5 0%,#fef3e2 100%)'}}>
      <p style={{color:'#6b7280'}}>Chargement...</p>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#ffedd5 0%,#fef3e2 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'16px',boxSizing:'border-box'}}>
      <h1 style={{fontSize:'24px',fontWeight:'bold',color:'#1f2937',marginBottom:'4px',textAlign:'center'}}>Tournez la roue !</h1>
      <p style={{color:'#6b7280',marginBottom:'24px',textAlign:'center'}}>Tentez de gagner un cadeau</p>
      {dejaJoue && !resultat ? (
        <div style={{background:'white',borderRadius:'24px',boxShadow:'0 10px 40px rgba(0,0,0,0.1)',padding:'32px',textAlign:'center',maxWidth:'320px',width:'100%'}}>
          <div style={{fontSize:'64px',marginBottom:'16px',animation:'bounce 1s infinite'}}>⏳</div>
          <h2 style={{fontSize:'22px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>A bientot !</h2>
          <p style={{color:'#6b7280',marginBottom:'16px',lineHeight:'1.6'}}>Vous avez deja tente votre chance lors de cette visite.</p>
          <div style={{background:'#fff7ed',borderRadius:'12px',padding:'16px'}}>
            <p style={{color:'#f97316',fontWeight:'bold',fontSize:'14px'}}>Revenez dans 7 jours pour retenter votre chance !</p>
          </div>
          <style>{`@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%',maxWidth:'400px'}}>
          <div style={{position:'relative',width:taille,height:taille,marginBottom:'24px'}}>
            <svg width={taille} height={taille} style={{transform:'rotate('+rotation+'deg)',transition:tourne?'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)':'none',borderRadius:'50%',boxShadow:'0 10px 40px rgba(0,0,0,0.2)'}}>
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
                    <path d={'M'+centre+','+centre+' L'+x1+','+y1+' A'+rayon+','+rayon+' 0 0,1 '+x2+','+y2+' Z'} fill={lot.couleur} stroke='white' strokeWidth='2'/>
                    <text x={mx} y={my} textAnchor='middle' dominantBaseline='middle' fill='white' fontSize='10' fontWeight='bold' transform={'rotate('+(180/Math.PI)*(start+angle/2+Math.PI/2)+','+mx+','+my+')'}>{lot.label}</text>
                  </g>
                );
              })}
            </svg>
            <div style={{position:'absolute',top:'-16px',left:'50%',transform:'translateX(-50%)',fontSize:'32px',zIndex:10}}>&#9660;</div>
          </div>
          {!resultat ? (
            <button onClick={tourner} disabled={tourne} style={{background:'#f97316',color:'white',fontWeight:'bold',padding:'16px 48px',borderRadius:'16px',fontSize:'20px',border:'none',cursor:tourne?'not-allowed':'pointer',opacity:tourne?0.7:1,width:'100%',maxWidth:'300px'}}>
              {tourne ? 'En cours...' : 'Tourner !'}
            </button>
          ) : resultat && resultat.est_roue_bonus ? (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}}>
              <style>{`@keyframes tremblement { 0%,100%{transform:rotate(var(--r,0deg))} 92%{transform:rotate(calc(var(--r,0deg) + 4deg))} 94%{transform:rotate(calc(var(--r,0deg) - 4deg))} 96%{transform:rotate(calc(var(--r,0deg) + 2deg))} 98%{transform:rotate(calc(var(--r,0deg) - 2deg))} }`}</style>
              {!resultatBonus ? (
                <>
                  <div style={{background:'#fffbeb',border:'2px solid #f59e0b',borderRadius:'16px',padding:'16px',marginBottom:'20px',textAlign:'center',width:'100%'}}>
                    <p style={{fontSize:'28px',marginBottom:'4px'}}>🎰</p>
                    <p style={{color:'#92400e',fontWeight:'bold',fontSize:'16px'}}>Roue bonus !</p>
                    <p style={{color:'#d97706',fontSize:'13px'}}>Une surprise vous attend...</p>
                  </div>
                  <div style={{position:'relative',width:taille,height:taille,marginBottom:'16px'}}>
                    <svg width={taille} height={taille} style={{transform:'rotate('+rotationBonus+'deg)',transition:tourneBonus?'transform 6s cubic-bezier(0.25,0.1,0.1,1)':'none',borderRadius:'50%',boxShadow:'0 10px 40px rgba(245,158,11,0.4)'}}>
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
                            <path d={'M'+cx+','+cy+' L'+x1+','+y1+' A'+r+','+r+' 0 0,1 '+x2+','+y2+' Z'} fill={sl.couleur} stroke='white' strokeWidth='2'/>
                            <text x={mx} y={my} textAnchor='middle' dominantBaseline='middle' fill='white' fontSize='10' fontWeight='bold' transform={'rotate('+(180/Math.PI)*(start+angle/2+Math.PI/2)+','+mx+','+my+')'}>{sl.label}</text>
                          </g>
                        );
                      })}
                    </svg>
                    <div style={{position:'absolute',top:'-16px',left:'50%',transform:'translateX(-50%)',fontSize:'32px',zIndex:10}}>&#9660;</div>
                  </div>
                  {tourneBonus && <p style={{color:'#d97706',fontWeight:'bold',fontSize:'16px',animation:'bounce 0.5s infinite'}}>La roue tourne...</p>}
                </>
              ) : (
                <div style={{background:'white',borderRadius:'24px',boxShadow:'0 10px 40px rgba(0,0,0,0.1)',padding:'24px',textAlign:'center',width:'100%'}}>
                  <h2 style={{fontSize:'22px',fontWeight:'bold',color:'#1f2937',marginBottom:'4px'}}>Felicitations !</h2>
                  <p style={{fontSize:'14px',color:'#6b7280',marginBottom:'12px'}}>{nomRestaurant} vous offre...</p>
                  <p style={{fontSize:'24px',color:'#f59e0b',fontWeight:'bold',marginBottom:'16px'}}>{resultatBonus.label}</p>
                  {modeLivraison ? (
                    <div>
                      <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>
                        <QRCodeCanvas value={urlValidation} size={160}/>
                      </div>
                      <div style={{background:'#fffbeb',borderRadius:'12px',padding:'16px',marginBottom:'12px'}}>
                        <p style={{color:'#6b7280',fontSize:'12px',marginBottom:'4px'}}>Votre code cadeau</p>
                        <p style={{fontSize:'28px',fontWeight:'bold',color:'#f59e0b',letterSpacing:'6px',marginBottom:'8px'}}>{codeGagnant}</p>
                        <p style={{color:'#9ca3af',fontSize:'12px'}}>Valable 7 jours</p>
                      </div>
                      <div style={{background:'#f0fdf4',borderRadius:'12px',padding:'16px'}}>
                        <p style={{fontSize:'24px',marginBottom:'4px'}}>📸</p>
                        <p style={{color:'#16a34a',fontWeight:'bold',fontSize:'14px',marginBottom:'4px'}}>Faites une capture d'ecran !</p>
                        <p style={{color:'#6b7280',fontSize:'13px'}}>Presentez cette page lors de votre prochaine visite au restaurant pour recuperer votre cadeau.</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>
                        <QRCodeCanvas value={urlValidation} size={160}/>
                      </div>
                      <div style={{background:'#fffbeb',borderRadius:'12px',padding:'12px',marginBottom:'8px'}}>
                        <p style={{color:'#6b7280',fontSize:'12px',marginBottom:'4px'}}>Code de secours</p>
                        <p style={{fontSize:'28px',fontWeight:'bold',color:'#f59e0b',letterSpacing:'6px'}}>{codeGagnant}</p>
                      </div>
                      <p style={{color:'#9ca3af',fontSize:'12px',marginBottom:'8px'}}>Code valable 1 heure</p>
                      <p style={{color:'#6b7280',fontSize:'13px'}}>Montrez ce QR code a votre serveur</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : resultat && !resultat.est_perdant ? (
            <div style={{background:'white',borderRadius:'24px',boxShadow:'0 10px 40px rgba(0,0,0,0.1)',padding:'24px',textAlign:'center',width:'100%'}}>
              <h2 style={{fontSize:'22px',fontWeight:'bold',color:'#1f2937',marginBottom:'4px'}}>Felicitations !</h2>
              <p style={{fontSize:'14px',color:'#6b7280',marginBottom:'12px'}}>{nomRestaurant} vous offre...</p>
              <p style={{fontSize:'24px',color:'#f97316',fontWeight:'bold',marginBottom:'16px'}}>{resultat.label}</p>
              {modeLivraison ? (
                <div>
                  <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>
                    <QRCodeCanvas value={urlValidation} size={160}/>
                  </div>
                  <div style={{background:'#fff7ed',borderRadius:'12px',padding:'16px',marginBottom:'12px'}}>
                    <p style={{color:'#6b7280',fontSize:'12px',marginBottom:'4px'}}>Votre code cadeau</p>
                    <p style={{fontSize:'28px',fontWeight:'bold',color:'#f97316',letterSpacing:'6px',marginBottom:'8px'}}>{codeGagnant}</p>
                    <p style={{color:'#9ca3af',fontSize:'12px'}}>Valable 7 jours</p>
                  </div>
                  <div style={{background:'#f0fdf4',borderRadius:'12px',padding:'16px'}}>
                    <p style={{fontSize:'24px',marginBottom:'4px'}}>📸</p>
                    <p style={{color:'#16a34a',fontWeight:'bold',fontSize:'14px',marginBottom:'4px'}}>Faites une capture d'ecran !</p>
                    <p style={{color:'#6b7280',fontSize:'13px'}}>Presentez cette page lors de votre prochaine visite au restaurant pour recuperer votre cadeau.</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>
                    <QRCodeCanvas value={urlValidation} size={160}/>
                  </div>
                  <div style={{background:'#fff7ed',borderRadius:'12px',padding:'12px',marginBottom:'8px'}}>
                    <p style={{color:'#6b7280',fontSize:'12px',marginBottom:'4px'}}>Code de secours</p>
                    <p style={{fontSize:'28px',fontWeight:'bold',color:'#f97316',letterSpacing:'6px'}}>{codeGagnant}</p>
                  </div>
                  <p style={{color:'#9ca3af',fontSize:'12px',marginBottom:'8px'}}>Code valable 1 heure</p>
                  <p style={{color:'#6b7280',fontSize:'13px'}}>Montrez ce QR code a votre serveur</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{background:'white',borderRadius:'24px',boxShadow:'0 10px 40px rgba(0,0,0,0.1)',padding:'32px',textAlign:'center',width:'100%'}}>
              <h2 style={{fontSize:'22px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>Dommage !</h2>
              <p style={{color:'#6b7280'}}>Tentez votre chance a votre prochaine visite</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
