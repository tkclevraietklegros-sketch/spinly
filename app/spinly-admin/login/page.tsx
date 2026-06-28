'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const MOT_DE_PASSE_SPINLY = process.env.NEXT_PUBLIC_SPINLY_ADMIN_PASSWORD || 'spinly2024';

export default function SpinlyLogin() {
  const [mdp, setMdp] = useState('');
  const [erreur, setErreur] = useState(false);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = document.cookie.split(';').find(c => c.trim().startsWith('spinly_admin='));
    if (auth) router.push('/spinly-admin');
  }, []);

  const valider = () => {
    setChargement(true);
    setTimeout(() => {
      if (mdp === MOT_DE_PASSE_SPINLY) {
        const exp = new Date();
        exp.setDate(exp.getDate() + 30);
        document.cookie = 'spinly_admin=1; expires=' + exp.toUTCString() + '; path=/';
        router.push('/spinly-admin');
      } else {
        setErreur(true);
        setMdp('');
        setChargement(false);
      }
    }, 600);
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'-100px',left:'-100px',width:'500px',height:'500px',background:'radial-gradient(circle,rgba(249,115,22,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-100px',right:'-100px',width:'500px',height:'500px',background:'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>

      <motion.div
        initial={{opacity:0,y:30,scale:0.95}}
        animate={{opacity:1,y:0,scale:1}}
        transition={{duration:0.6,type:'spring',stiffness:200,damping:20}}
        style={{background:'rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'32px',padding:'40px',maxWidth:'360px',width:'100%',textAlign:'center'}}
      >
        <motion.div
          animate={{rotate:360}}
          transition={{duration:20,repeat:Infinity,ease:'linear'}}
          style={{fontSize:'56px',marginBottom:'12px',display:'block'}}
        >
          🎡
        </motion.div>
        <h1 style={{fontSize:'28px',fontWeight:'800',color:'white',marginBottom:'4px',letterSpacing:'-0.3px'}}>Spinly</h1>
        <p style={{color:'rgba(255,255,255,0.4)',fontSize:'14px',marginBottom:'28px'}}>Dashboard global</p>

        {erreur && (
          <motion.p initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} style={{color:'#f87171',fontSize:'14px',marginBottom:'16px',background:'rgba(220,38,38,0.1)',padding:'10px',borderRadius:'10px',border:'1px solid rgba(220,38,38,0.2)'}}>
            Mot de passe incorrect
          </motion.p>
        )}

        <input
          type='password'
          placeholder='Mot de passe Spinly'
          value={mdp}
          onChange={(e) => { setMdp(e.target.value); setErreur(false); }}
          onKeyDown={(e) => e.key === 'Enter' && valider()}
          style={{width:'100%',padding:'14px',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.15)',fontSize:'16px',marginBottom:'16px',boxSizing:'border-box',background:'rgba(255,255,255,0.08)',color:'white',outline:'none'}}
        />

        <motion.button
          onClick={valider}
          disabled={chargement}
          whileHover={!chargement ? {scale:1.03} : {}}
          whileTap={!chargement ? {scale:0.97} : {}}
          style={{width:'100%',background:'linear-gradient(135deg,#f97316,#ea580c)',color:'white',fontWeight:'800',padding:'16px',borderRadius:'14px',fontSize:'16px',border:'none',cursor:chargement?'not-allowed':'pointer',opacity:chargement?0.7:1}}
        >
          {chargement ? 'Connexion...' : 'Se connecter'}
        </motion.button>
      </motion.div>
    </div>
  );
}