'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Valider() {
  const [statut, setStatut] = useState('chargement');
  const [lot, setLot] = useState('');

  useEffect(() => {
    const slugActuel = window.location.pathname.split('/')[1];
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const verifier = async () => {
      if (!code) { setStatut('invalide'); return; }
      const { data: restau } = await supabase.from('restaurants').select('id').eq('slug', slugActuel).single();
      if (!restau) { setStatut('invalide'); return; }
      const { data, error } = await supabase.from('codes').select('*').eq('code', code).eq('restaurant_id', restau.id).single();
      if (error || !data) { setStatut('invalide'); return; }
      if (data.utilise) { setStatut('deja_utilise'); return; }
      if (data.expire_le && Date.now() > new Date(data.expire_le).getTime()) { setStatut('expire'); return; }
      await supabase.from('codes').update({ utilise: true }).eq('code', code);
      setLot(data.lot);
      setStatut('valide');
    };
    verifier();
  }, []);

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'-100px',left:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(249,115,22,0.08) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-100px',right:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>

      <AnimatePresence mode='wait'>
        {statut === 'chargement' && (
          <motion.div key='chargement' initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{textAlign:'center'}}>
            <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}} style={{width:'56px',height:'56px',border:'3px solid rgba(249,115,22,0.3)',borderTop:'3px solid #f97316',borderRadius:'50%',margin:'0 auto 24px'}}/>
            <p style={{color:'rgba(255,255,255,0.5)',fontSize:'18px'}}>Verification en cours...</p>
          </motion.div>
        )}

        {statut === 'valide' && (
          <motion.div key='valide' initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:200,damping:20}} style={{background:'rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',border:'1px solid rgba(22,163,74,0.3)',borderRadius:'32px',padding:'40px',maxWidth:'380px',width:'100%',textAlign:'center'}}>
            <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:300,damping:15,delay:0.2}} style={{fontSize:'80px',marginBottom:'16px'}}>✅</motion.div>
            <h1 style={{fontSize:'28px',fontWeight:'800',color:'#4ade80',marginBottom:'16px'}}>Code valide !</h1>
            <div style={{background:'rgba(22,163,74,0.1)',border:'1px solid rgba(22,163,74,0.3)',borderRadius:'16px',padding:'20px',marginBottom:'24px'}}>
              <p style={{color:'rgba(255,255,255,0.4)',fontSize:'14px',marginBottom:'8px'}}>Cadeau a offrir</p>
              <p style={{fontSize:'24px',color:'#4ade80',fontWeight:'bold',margin:'0'}}>{lot}</p>
            </div>
            <p style={{color:'rgba(255,255,255,0.4)'}}>Offrez le cadeau au client !</p>
          </motion.div>
        )}

        {statut === 'deja_utilise' && (
          <motion.div key='deja' initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:200,damping:20}} style={{background:'rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',border:'1px solid rgba(220,38,38,0.3)',borderRadius:'32px',padding:'40px',maxWidth:'380px',width:'100%',textAlign:'center'}}>
            <div style={{fontSize:'80px',marginBottom:'16px'}}>❌</div>
            <h1 style={{fontSize:'28px',fontWeight:'800',color:'#f87171',marginBottom:'12px'}}>Deja utilise !</h1>
            <p style={{color:'rgba(255,255,255,0.4)'}}>Ce cadeau a deja ete offert</p>
          </motion.div>
        )}

        {statut === 'expire' && (
          <motion.div key='expire' initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:200,damping:20}} style={{background:'rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',border:'1px solid rgba(249,115,22,0.3)',borderRadius:'32px',padding:'40px',maxWidth:'380px',width:'100%',textAlign:'center'}}>
            <div style={{fontSize:'80px',marginBottom:'16px'}}>⏰</div>
            <h1 style={{fontSize:'28px',fontWeight:'800',color:'#f97316',marginBottom:'12px'}}>Code expire !</h1>
            <p style={{color:'rgba(255,255,255,0.4)'}}>Ce code n est plus valable</p>
          </motion.div>
        )}

        {statut === 'invalide' && (
          <motion.div key='invalide' initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:200,damping:20}} style={{background:'rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',border:'1px solid rgba(220,38,38,0.3)',borderRadius:'32px',padding:'40px',maxWidth:'380px',width:'100%',textAlign:'center'}}>
            <div style={{fontSize:'80px',marginBottom:'16px'}}>❓</div>
            <h1 style={{fontSize:'28px',fontWeight:'800',color:'#f87171',marginBottom:'12px'}}>Code invalide !</h1>
            <p style={{color:'rgba(255,255,255,0.4)'}}>Ce code n existe pas</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}