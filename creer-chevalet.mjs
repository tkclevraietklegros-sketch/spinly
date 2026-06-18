import { writeFileSync } from 'fs';

const code = `'use client';
import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../../lib/supabase';

export default function Chevalet() {
  const [config, setConfig] = useState<any>({ nom: '', couleur_principale: '#f97316' });
  const [lots, setLots] = useState<any[]>([]);

  useEffect(() => {
    const charger = async () => {
      const { data: configData } = await supabase.from('config').select('*').single();
      if (configData) setConfig(configData);
      const { data: lotsData } = await supabase.from('lots').select('*').eq('actif', true);
      if (lotsData) setLots(lotsData.filter(l => !l.label.toLowerCase().includes('tentez')));
    };
    charger();
  }, []);

  return (
    <div style={{minHeight:'100vh',background:'#ffffff',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{width:'340px',background:'white',borderRadius:'24px',boxShadow:'0 20px 60px rgba(0,0,0,0.15)',padding:'40px',textAlign:'center',border:'3px solid '+config.couleur_principale}}>
        
        <div style={{fontSize:'48px',marginBottom:'8px'}}>🍽️</div>
        <h1 style={{fontSize:'28px',fontWeight:'bold',color:config.couleur_principale,margin:'0 0 4px 0'}}>{config.nom}</h1>
        <div style={{width:'60px',height:'3px',background:config.couleur_principale,margin:'12px auto'}}></div>
        
        <h2 style={{fontSize:'20px',fontWeight:'bold',color:'#1f2937',marginBottom:'4px'}}>Scannez et gagnez !</h2>
        <p style={{color:'#6b7280',fontSize:'14px',marginBottom:'20px'}}>Laissez-nous un avis Google et tentez de remporter un cadeau en 2 minutes</p>

        <div style={{display:'flex',justifyContent:'center',marginBottom:'20px'}}>
          <QRCodeCanvas value='https://roue-restaurant.vercel.app' size={180} fgColor='#1f2937'/>
        </div>

        {lots.length > 0 && (
          <div style={{background:'#fff7ed',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
            <p style={{color:config.couleur_principale,fontWeight:'bold',fontSize:'12px',marginBottom:'10px',textTransform:'uppercase',letterSpacing:'1px'}}>A gagner</p>
            {lots.map((lot, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:lot.couleur,flexShrink:0}}></div>
                <span style={{color:'#1f2937',fontSize:'14px',fontWeight:'500'}}>{lot.label}</span>
              </div>
            ))}
          </div>
        )}

        <p style={{color:'#9ca3af',fontSize:'11px'}}>1 participation par visite</p>
      </div>

      <style>{\`
        @media print {
          body { margin: 0; }
          div { box-shadow: none !important; }
        }
      \`}</style>
    </div>
  );
}`;

writeFileSync('app/chevalet/page.tsx', code);
console.log('Fichier cree avec succes !');