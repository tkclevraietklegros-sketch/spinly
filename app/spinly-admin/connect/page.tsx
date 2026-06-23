'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Connect() {
  const router = useRouter();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) { router.push('/spinly-admin'); return; }
    const exp = new Date();
    exp.setDate(exp.getDate() + 7);
    document.cookie = 'admin_auth_'+slug+'=1; expires=' + exp.toUTCString() + '; path=/';
    router.push('/'+slug+'/admin');
  }, []);
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb'}}>
      <p style={{color:'#6b7280'}}>Connexion en cours...</p>
    </div>
  );
}
