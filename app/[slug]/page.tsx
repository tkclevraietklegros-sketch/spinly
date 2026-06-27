'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import BandeauCookie from '../components/BandeauCookie';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

function Etoiles() {
  const [etoiles, setEtoiles] = useState<any[]>([]);
  useEffect(() => {
    setEtoiles(Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      taille: Math.random() * 2.5 + 0.5,
      duree: Math.random() * 3 + 2,
      delai: Math.random() * 4,
    })));
  }, []);
  if (etoiles.length === 0) return null;
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}>
      {etoiles.map(e => (
        <motion.div
          key={e.id}
          style={{position:'absolute',left:e.x+'%',top:e.y+'%',width:e.taille+'px',height:e.taille+'px',borderRadius:'50%',background:'white'}}
          animate={{opacity:[0,1,0]}}
          transition={{duration:e.duree,repeat:Infinity,delay:e.delai,ease:'easeInOut'}}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const params = useParams();
  const slug = params.slug as string;
  const [config, setConfig] = useState<any>({ nom: '', couleur_principale: '#f97316' });
  const [lots, setLots] = useState<any[]>([]);
  const [modeLivraison, setModeLivraison] = useState(false);

  useEffect(() => {
    const params2 = new URLSearchParams(window.location.search);
    setModeLivraison(params2.get('mode') === 'livraison');
    const charger = async () => {
      const { data: restau } = await supabase.from('restaurants').select('id').eq('slug', slug).single();
      if (!restau) return;
      const { data: configData } = await supabase.from('config').select('*').eq('restaurant_id', restau.id).single();
      if (configData) setConfig(configData);
      const { data: lotsData } = await supabase.from('lots').select('*').eq('actif', true).eq('restaurant_id', restau.id);
      if (lotsData) setLots(lotsData.filter(l => !l.est_perdant));
    };
    charger();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Etoiles />
      <div style={{position:'absolute',top:'-100px',left:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(249,115,22,0.08) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-100px',right:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>

      <motion.div
        initial={{opacity:0,y:-30}}
        animate={{opacity:1,y:0}}
        transition={{duration:0.7}}
        style={{textAlign:'center',marginBottom:'32px',position:'relative',zIndex:1}}
      >
        <motion.div
          animate={{rotate:[0,10,-10,0]}}
          transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}
          style={{fontSize:'72px',marginBottom:'12px',display:'block'}}
        >
          🍽️
        </motion.div>
        <h1 style={{fontSize:'36px',fontWeight:'800',color:'white',margin:'0',letterSpacing:'-0.5px'}}>{config.nom}</h1>
        <p style={{color:'rgba(255,255,255,0.4)',marginTop:'8px',fontSize:'16px'}}>Merci de votre visite !</p>
      </motion.div>

      <motion.div
        initial={{opacity:0,y:30}}
        animate={{opacity:1,y:0}}
        transition={{duration:0.7,delay:0.2}}
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '32px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          animate={{rotate:360}}
          transition={{duration:20,repeat:Infinity,ease:'linear'}}
          style={{fontSize:'64px',marginBottom:'16px',display:'block'}}
        >
          🎡
        </motion.div>
        <h2 style={{fontSize:'26px',fontWeight:'800',color:'white',marginBottom:'8px',letterSpacing:'-0.3px'}}>Tentez votre chance !</h2>
        <p style={{color:'rgba(255,255,255,0.4)',marginBottom:'28px',lineHeight:'1.6',fontSize:'15px'}}>Tournez la roue et gagnez un cadeau !</p>

        {lots.length > 0 && (
          <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{delay:0.5}}
            style={{
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '28px',
              textAlign: 'left',
            }}
          >
            <p style={{color:'#f97316',fontWeight:'bold',fontSize:'12px',marginBottom:'14px',textAlign:'center',letterSpacing:'1px'}}>CE QUE VOUS POUVEZ GAGNER</p>
            {lots.filter(l => !l.est_roue_bonus).map((lot, i) => (
              <motion.div
                key={i}
                initial={{opacity:0,x:-10}}
                animate={{opacity:1,x:0}}
                transition={{delay:0.6+i*0.1}}
                style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}
              >
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:lot.couleur,flexShrink:0,boxShadow:'0 0 6px '+lot.couleur}}></div>
                <span style={{color:'rgba(255,255,255,0.8)',fontSize:'14px',fontWeight:'500'}}>{lot.label}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.a
          href={modeLivraison ? '/'+slug+'/avis?mode=livraison' : '/'+slug+'/avis'}
          whileHover={{scale:1.05}}
          whileTap={{scale:0.95}}
          animate={{boxShadow:['0 8px 24px rgba(249,115,22,0.3)','0 8px 40px rgba(249,115,22,0.6)','0 8px 24px rgba(249,115,22,0.3)']}}
          transition={{duration:2,repeat:Infinity}}
          style={{
            display: 'block',
            background: 'linear-gradient(135deg,#f97316,#ea580c)',
            color: 'white',
            fontWeight: '800',
            padding: '20px 24px',
            borderRadius: '18px',
            fontSize: '20px',
            textDecoration: 'none',
            letterSpacing: '0.3px',
          }}
        >
          Jouer maintenant 🎰
        </motion.a>
        <p style={{color:'rgba(255,255,255,0.25)',fontSize:'12px',marginTop:'16px'}}>1 participation par visite · Resultat instantane</p>
      </motion.div>
      <BandeauCookie />
    </div>
  );
}