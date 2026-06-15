'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Admin() {
  const [codes, setCodes] = useState([]);
  const [lots, setLots] = useState([]);
  const [stats, setStats] = useState({ total: 0, utilises: 0, expires: 0 });
  const [onglet, setOnglet] = useState('stats');
  const [config, setConfig] = useState({ nom: '', couleur_principale: '#f97316' });
  const router = useRouter();

  useEffect(() => {
    const auth = document.cookie.split(';').find(c => c.trim().startsWith('admin_auth='));
    if (!auth) router.push('/admin/login');
    charger();
  }, []);

  const charger = async () => {
    const { data: codesData } = await supabase.from('codes').select('*').order('cree_le', { ascending: false }).limit(50);
    const { data: lotsData } = await supabase.from('lots').select('*').order('probabilite', { ascending: false });
    const { data: configData } = await supabase.from('config').select('*').single();
    if (configData) setConfig(configData);
    if (codesData) {
      setCodes(codesData);
      setStats({
        total: codesData.length,
        utilises: codesData.filter(c => c.utilise).length,
        expires: codesData.filter(c => c.expire_le && new Date(c.expire_le) < new Date()).length,
      });
    }
    if (lotsData) setLots(lotsData);
  };

  const modifierProba = async (id, valeur) => {
    await supabase.from('lots').update({ probabilite: parseInt(valeur) }).eq('id', id);
    charger();
  };

  const modifierLabel = async (id, valeur) => {
    await supabase.from('lots').update({ label: valeur }).eq('id', id);
    charger();
  };

  const toggleActif = async (id, actif) => {
    await supabase.from('lots').update({ actif: !actif }).eq('id', id);
    charger();
  };

  return (
    <div style={{minHeight:'100vh',background:'#f9fafb',padding:'32px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <h1 style={{fontSize:'24px',fontWeight:'bold',color:'#1f2937'}}>Dashboard Admin</h1>
        <button onClick={() => { document.cookie='admin_auth=; max-age=0'; router.push('/admin/login'); }} style={{background:'#ef4444',color:'white',padding:'8px 16px',borderRadius:'8px',border:'none',cursor:'pointer'}}>Deconnexion</button>
      </div>

      <div style={{display:'flex',gap:'8px',marginBottom:'24px'}}>
        <button onClick={() => setOnglet('stats')} style={{padding:'10px 20px',borderRadius:'10px',border:'none',cursor:'pointer',background:onglet==='stats'?'#f97316':'white',color:onglet==='stats'?'white':'#6b7280',fontWeight:'bold'}}>Stats</button>
        <button onClick={() => setOnglet('lots')} style={{padding:'10px 20px',borderRadius:'10px',border:'none',cursor:'pointer',background:onglet==='lots'?'#f97316':'white',color:onglet==='lots'?'white':'#6b7280',fontWeight:'bold'}}>Lots</button>
        <button onClick={() => setOnglet('codes')} style={{padding:'10px 20px',borderRadius:'10px',border:'none',cursor:'pointer',background:onglet==='codes'?'#f97316':'white',color:onglet==='codes'?'white':'#6b7280',fontWeight:'bold'}}>Codes</button>
        <button onClick={() => setOnglet('params')} style={{padding:'10px 20px',borderRadius:'10px',border:'none',cursor:'pointer',background:onglet==='params'?'#f97316':'white',color:onglet==='params'?'white':'#6b7280',fontWeight:'bold'}}>Parametres</button>
      </div>

      {onglet === 'stats' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
          <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',textAlign:'center'}}>
            <p style={{color:'#6b7280',fontSize:'14px',marginBottom:'8px'}}>Total participations</p>
            <p style={{fontSize:'36px',fontWeight:'bold',color:'#1f2937'}}>{stats.total}</p>
          </div>
          <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',textAlign:'center'}}>
            <p style={{color:'#6b7280',fontSize:'14px',marginBottom:'8px'}}>Cadeaux utilises</p>
            <p style={{fontSize:'36px',fontWeight:'bold',color:'#16a34a'}}>{stats.utilises}</p>
          </div>
          <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',textAlign:'center'}}>
            <p style={{color:'#6b7280',fontSize:'14px',marginBottom:'8px'}}>Codes expires</p>
            <p style={{fontSize:'36px',fontWeight:'bold',color:'#dc2626'}}>{stats.expires}</p>
          </div>
        </div>
      )}

      {onglet === 'lots' && (
        <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>Gestion des lots</h2>
          <p style={{color:'#6b7280',fontSize:'14px',marginBottom:'16px'}}>Total probabilites : {lots.reduce((a,l) => a+l.probabilite, 0)} (plus le chiffre est eleve, plus le lot est frequent)</p>
          {lots.map((lot) => (
            <div key={lot.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',borderBottom:'1px solid #f3f4f6'}}>
              <div style={{width:'16px',height:'16px',borderRadius:'50%',background:lot.couleur,flexShrink:0}}></div>
              <input defaultValue={lot.label} onBlur={(e) => modifierLabel(lot.id, e.target.value)} style={{flex:1,padding:'8px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px'}}/>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{color:'#6b7280',fontSize:'14px'}}>Proba:</span>
                <input type='number' defaultValue={lot.probabilite} onBlur={(e) => modifierProba(lot.id, e.target.value)} style={{width:'60px',padding:'8px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px',textAlign:'center'}}/>
              </div>
              <button onClick={() => toggleActif(lot.id, lot.actif)} style={{padding:'6px 12px',borderRadius:'8px',border:'none',cursor:'pointer',background:lot.actif?'#dcfce7':'#fee2e2',color:lot.actif?'#16a34a':'#dc2626',fontSize:'13px',fontWeight:'bold'}}>
                {lot.actif ? 'Actif' : 'Inactif'}
              </button>
            </div>
          ))}
        </div>
      )}

      {onglet === 'codes' && (
        <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',marginBottom:'16px'}}>Derniers codes</h2>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #f3f4f6'}}>
                <th style={{textAlign:'left',padding:'8px',color:'#6b7280',fontSize:'14px'}}>Code</th>
                <th style={{textAlign:'left',padding:'8px',color:'#6b7280',fontSize:'14px'}}>Lot</th>
                <th style={{textAlign:'left',padding:'8px',color:'#6b7280',fontSize:'14px'}}>Statut</th>
                <th style={{textAlign:'left',padding:'8px',color:'#6b7280',fontSize:'14px'}}>Date</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                  <td style={{padding:'12px 8px',fontWeight:'bold',color:'#f97316',letterSpacing:'2px'}}>{c.code}</td>
                  <td style={{padding:'12px 8px',color:'#1f2937'}}>{c.lot}</td>
                  <td style={{padding:'12px 8px'}}>
                    {c.utilise ? (
                      <span style={{background:'#dcfce7',color:'#16a34a',padding:'4px 10px',borderRadius:'20px',fontSize:'13px'}}>Utilise</span>
                    ) : c.expire_le && new Date(c.expire_le) < new Date() ? (
                      <span style={{background:'#fee2e2',color:'#dc2626',padding:'4px 10px',borderRadius:'20px',fontSize:'13px'}}>Expire</span>
                    ) : (
                      <span style={{background:'#fef9c3',color:'#ca8a04',padding:'4px 10px',borderRadius:'20px',fontSize:'13px'}}>En attente</span>
                    )}
                  </td>
                  <td style={{padding:'12px 8px',color:'#6b7280',fontSize:'13px'}}>{new Date(c.cree_le).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    {onglet === 'params' && (
        <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',marginBottom:'24px'}}>Parametres du restaurant</h2>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',color:'#6b7280',fontSize:'14px',marginBottom:'8px'}}>Nom du restaurant</label>
            <input
              value={config.nom}
              onChange={(e) => setConfig({...config, nom: e.target.value})}
              style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid #e5e7eb',fontSize:'16px',boxSizing:'border-box'}}
            />
          </div>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',color:'#6b7280',fontSize:'14px',marginBottom:'8px'}}>Lien Google Avis</label>
            <input
              value={config.lien_google || ''}
              onChange={(e) => setConfig({...config, lien_google: e.target.value})}
              placeholder='https://search.google.com/local/writereview?placeid=...'
              style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid #e5e7eb',fontSize:'14px',boxSizing:'border-box'}}
            />
            <p style={{color:'#9ca3af',fontSize:'12px',marginTop:'4px'}}>Trouvez votre lien sur Google My Business</p>
          </div>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',color:'#6b7280',fontSize:'14px',marginBottom:'8px'}}>Mot de passe admin</label>
            <input
              type='password'
              value={config.mot_de_passe || ''}
              onChange={(e) => setConfig({...config, mot_de_passe: e.target.value})}
              placeholder='Nouveau mot de passe'
              style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid #e5e7eb',fontSize:'14px',boxSizing:'border-box'}}
            />
          </div>
          <div style={{marginBottom:'24px'}}>
            <input
              type='color'
              value={config.couleur_principale}
              onChange={(e) => setConfig({...config, couleur_principale: e.target.value})}
              style={{width:'60px',height:'40px',borderRadius:'8px',border:'1px solid #e5e7eb',cursor:'pointer'}}
            />
          </div>
          <button
            onClick={async () => {
              await supabase.from('config').update({ nom: config.nom, couleur_principale: config.couleur_principale, lien_google: config.lien_google, mot_de_passe: config.mot_de_passe }).eq('id', config.id);
              alert('Parametres sauvegardes !');
            }}
            style={{background:'#f97316',color:'white',fontWeight:'bold',padding:'12px 24px',borderRadius:'12px',border:'none',cursor:'pointer',fontSize:'16px'}}
          >
            Sauvegarder
          </button>
        </div>
      )}
    </div>
  );
}