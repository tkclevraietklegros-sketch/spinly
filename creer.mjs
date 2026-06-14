import { writeFileSync } from 'fs';

const code = `'use client';
import { useState } from 'react';

const LOTS = [
  { label: 'Cafe offert', couleur: '#f97316' },
  { label: 'Dessert offert', couleur: '#8b5cf6' },
  { label: '10% reduction', couleur: '#3b82f6' },
  { label: 'Tentez encore', couleur: '#6b7280' },
  { label: 'Boisson offerte', couleur: '#10b981' },
  { label: 'Tentez encore', couleur: '#6b7280' },
];

export default function Roue() {
  const [rotation, setRotation] = useState(0);
  const [tourne, setTourne] = useState(false);
  const [resultat, setResultat] = useState('');

  const tourner = () => {
    if (tourne) return;
    setTourne(true);
    setResultat('');
    const index = Math.floor(Math.random() * LOTS.length);
    const segmentAngle = 360 / LOTS.length;
    const cibleAngle = 360 - (index * segmentAngle + segmentAngle / 2);
    const deg = 360 * 6 + cibleAngle;
    setRotation((r) => r + deg);
    setTimeout(() => {
      setResultat(LOTS[index].label);
      setTourne(false);
    }, 4000);
  };

  const taille = 280;
  const centre = taille / 2;
  const rayon = centre - 10;
  const segments = LOTS.length;

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(to bottom,#fff7ed,#ffffff)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <h1 style={{fontSize:'24px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>Tournez la roue !</h1>
      <p style={{color:'#6b7280',marginBottom:'32px'}}>Tentez de gagner un cadeau</p>
      <div style={{position:'relative',width:taille,height:taille,marginBottom:'32px'}}>
        <svg width={taille} height={taille} style={{transform:'rotate('+rotation+'deg)',transition:tourne?'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)':'none',borderRadius:'50%',boxShadow:'0 10px 40px rgba(0,0,0,0.2)'}}>
          {LOTS.map((lot, i) => {
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
                <text x={mx} y={my} textAnchor='middle' dominantBaseline='middle' fill='white' fontSize='11' fontWeight='bold' transform={'rotate('+(180/Math.PI)*(start+angle/2+Math.PI/2)+','+mx+','+my+')'}>{lot.label}</text>
              </g>
            );
          })}
        </svg>
        <div style={{position:'absolute',top:'-16px',left:'50%',transform:'translateX(-50%)',fontSize:'32px',zIndex:10}}>▼</div>
      </div>
      {!resultat ? (
        <button onClick={tourner} disabled={tourne} style={{background:'#f97316',color:'white',fontWeight:'bold',padding:'16px 48px',borderRadius:'16px',fontSize:'20px',border:'none',cursor:tourne?'not-allowed':'pointer',opacity:tourne?0.7:1}}>
          {tourne ? 'En cours...' : 'Tourner !'}
        </button>
      ) : (
        <div style={{background:'white',borderRadius:'24px',boxShadow:'0 10px 40px rgba(0,0,0,0.1)',padding:'32px',textAlign:'center',maxWidth:'320px'}}>
          <h2 style={{fontSize:'22px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>Felicitations !</h2>
          <p style={{fontSize:'20px',color:'#f97316',fontWeight:'bold',marginBottom:'16px'}}>{resultat}</p>
          <p style={{color:'#6b7280',fontSize:'14px'}}>Montrez cet ecran a votre serveur</p>
        </div>
      )}
    </div>
  );
}`;

writeFileSync('app/roue/page.tsx', code);
console.log('Fichier cree avec succes !');