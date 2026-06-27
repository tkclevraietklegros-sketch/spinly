'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginRestaurant() {
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [slug, setSlug] = useState('');
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const slugActuel = window.location.pathname.split('/')[1];
    setSlug(slugActuel);
    const auth = document.cookie.split(';').find(c => c.trim().startsWith('admin_auth_'+slugActuel+'='));
    if (auth) router.push('/'+slugActuel+'/admin');
  }, []);

  const seConnecter = async () => {
    setChargement(true);
    setErreur('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, motDePasse }),
    });
    const data = await res.json();
    if (!data.succes) { setErreur(data.erreur); setChargement(false); return; }
    const exp = new Date();
    exp.setDate(exp.getDate() + 7);
    document.cookie = 'admin_auth_'+slug+'=1; expires=' + exp.toUTCString() + '; path=/';
    router.push('/'+slug+'/admin');
  };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'-100px',left:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(249,115,22,0.08) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-100px',right:'-100px',width:'400px',height:'400px',background:'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>

      <motion.div
        initial={{opacity:0,y:30,scale:0.95}}
        animate={{opacity:1,y:0,scale:1}}
        transition={{duration:0.6,type:'spring',stiffness:200,damping:20}}
        style={{background:'rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'32px',padding:'40px',maxWidth:'360px',width:'100%',textAlign:'center'}}
      >
        <motion.div
          animate={{rotate:[0,10,-10,0]}}
          transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}
          style={{fontSize:'56px',marginBottom:'16px'}}
        >
          🔐
        </motion.div>
        <h1 style={{fontSize:'26px',fontWeight:'800',color:'white',marginBottom:'8px',letterSpacing:'-0.3px'}}>Espace admin</h1>
        <p style={{color:'rgba(255,255,255,0.4)',fontSize:'14px',marginBottom:'28px'}}>Connectez-vous pour acceder au dashboard</p>

        {erreur && (
          <motion.p initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} style={{color:'#f87171',fontSize:'14px',marginBottom:'16px',background:'rgba(220,38,38,0.1)',padding:'10px',borderRadius:'10px',border:'1px solid rgba(220,38,38,0.2)'}}>
            {erreur}
          </motion.p>
        )}

        <input
          type='password'
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && seConnecter()}
          placeholder='Mot de passe'
          style={{width:'100%',padding:'14px',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.15)',fontSize:'16px',boxSizing:'border-box',marginBottom:'16px',background:'rgba(255,255,255,0.08)',color:'white',outline:'none'}}
        />

        <motion.button
          onClick={seConnecter}
          disabled={chargement}
          whileHover={!chargement ? {scale:1.03} : {}}
          whileTap={!chargement ? {scale:0.97} : {}}
          style={{width:'100%',background:'linear-gradient(135deg,#f97316,#ea580c)',color:'white',fontWeight:'800',padding:'16px',borderRadius:'14px',border:'none',cursor:chargement?'not-allowed':'pointer',fontSize:'16px',opacity:chargement?0.7:1}}
        >
          {chargement ? 'Connexion...' : 'Se connecter'}
        </motion.button>
      </motion.div>
    </div>
  );
}