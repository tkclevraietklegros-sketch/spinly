import { writeFileSync } from 'fs';

const code = `'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

function GraphiqueBarres({ partData }: { partData: any[] }) {
  if (!partData || partData.length === 0) return <p style={{color:'#9ca3af',textAlign:'center',padding:'24px'}}>Pas encore de donnees</p>;
  const comptesParJour: any = {};
  partData.forEach(c => {
    const jour = new Date(c.cree_le).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' });
    comptesParJour[jour] = (comptesParJour[jour] || 0) + 1;
  });
  const jours = Object.keys(comptesParJour).slice(-14);
  const max = Math.max(...jours.map(j => comptesParJour[j]));
  const hauteurMax = 140;
  return (
    <div style={{position:'relative'}}>
      <div style={{display:'flex',alignItems:'flex-end',gap:'4px',height:hauteurMax+'px',borderBottom:'2px solid #f3f4f6',paddingBottom:'0'}}>
        {jours.map((jour, i) => {
          const val = comptesParJour[jour];
          const h = max > 0 ? Math.max((val / max) * hauteurMax, 8) : 8;
          return (
            <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1,height:'100%',justifyContent:'flex-end'}}>
              <span style={{color:'#1f2937',fontSize:'10px',fontWeight:'bold',marginBottom:'2px'}}>{val}</span>
              <div style={{width:'40%',maxWidth:'40px',background:'linear-gradient(to top,#f97316,#fb923c)',borderRadius:'4px 4px 0 0',height:h+'px'}}></div>
            </div>
          );
        })}
      </div>
      <div style={{display:'flex',gap:'4px',marginTop:'4px'}}>
        {jours.map((jour, i) => (
          <div key={i} style={{flex:1,textAlign:'center'}}>
            <p style={{color:'#9ca3af',fontSize:'9px'}}>{jour}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [codes, setCodes] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, utilises: 0, expires: 0 });
  const [onglet, setOnglet] = useState('stats');
  const [periode, setPeriode] = useState('mois');
  const [config, setConfig] = useState<any>({ nom: '', couleur_principale: '#f97316' });
  const [confirmation, setConfirmation] = useState('');
  const [partData, setPartData] = useState<any[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newCouleur, setNewCouleur] = useState('#f97316');
  const [newProba, setNewProba] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const auth = document.cookie.split(';').find(c => c.trim().startsWith('admin_auth='));
    if (!auth) router.push('/admin/login');
    charger();
  }, []);

  const charger = async (p = periode) => {
    let query = supabase.from('codes').select('*').order('cree_le', { ascending: false });
    if (p === 'semaine') {
      const debut = new Date();
      debut.setDate(debut.getDate() - 7);
      query = query.gte('cree_le', debut.toISOString());
    } else if (p === 'mois') {
      const debut = new Date();
      debut.setMonth(debut.getMonth() - 1);
      query = query.gte('cree_le', debut.toISOString());
    }
    const { data: codesData } = await query.limit(50);
    let partQuery = supabase.from('participations').select('*');
    if (p === 'semaine') {
      const debut = new Date();
      debut.setDate(debut.getDate() - 7);
      partQuery = partQuery.gte('cree_le', debut.toISOString());
    } else if (p === 'mois') {
      const debut = new Date();
      debut.setMonth(debut.getMonth() - 1);
      partQuery = partQuery.gte('cree_le', debut.toISOString());
    }
    const { data: partData } = await partQuery;
    if (partData) setPartData(partData);
    const { data: lotsData } = await supabase.from('lots').select('*').order('probabilite', { ascending: false });
    const { data: configData } = await supabase.from('config').select('*').single();
    if (configData) setConfig(configData);
    if (codesData) {
      setCodes(codesData);
      setStats({
        total: partData ? partData.length : 0,
        utilises: codesData.filter(c => c.utilise).length,
        expires: codesData.filter(c => c.expire_le && new Date(c.expire_le) < new Date()).length,
      });
    }
    if (lotsData) setLots(lotsData);
  };

  const modifierProba = async (id: string, valeur: string) => {
    await supabase.from('lots').update({ probabilite: parseInt(valeur) }).eq('id', id);
    setConfirmation('Probabilite mise a jour !');
    setTimeout(() => setConfirmation(''), 2000);
    charger();
  };

  const modifierLabel = async (id: string, valeur: string) => {
    await supabase.from('lots').update({ label: valeur }).eq('id', id);
    setConfirmation('Nom mis a jour !');
    setTimeout(() => setConfirmation(''), 2000);
    charger();
  };

  const toggleActif = async (id: string, actif: boolean) => {
    await supabase.from('lots').update({ actif: !actif }).eq('id', id);
    charger();
  };

  const ajouterLot = async () => {
    if (!newLabel) return;
    await supabase.from('lots').insert({ label: newLabel, couleur: newCouleur, probabilite: newProba, actif: true });
    setNewLabel('');
    setNewCouleur('#f97316');
    setNewProba(10);
    setConfirmation('Lot ajoute !');
    setTimeout(() => setConfirmation(''), 2000);
    charger();
  };

  const supprimerCode = async (id: string) => {
    if (!confirm('Supprimer ce code ?')) return;
    await supabase.from('codes').delete().eq('id', id);
    charger();
  };

  const supprimerTout = async () => {
    if (!confirm('Supprimer tous les codes ?')) return;
    await supabase.from('codes').delete().neq('id','00000000-0000-0000-0000-000000000000');
    charger();
  };

  return (
    <div style={{minHeight:'100vh',background:'#f9fafb',padding:'16px',maxWidth:'100%',overflowX:'hidden',boxSizing:'border-box'}}>
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
        <div>
          <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
            <button onClick={() => { setPeriode('semaine'); charger('semaine'); }} style={{padding:'8px 16px',borderRadius:'8px',border:'none',cursor:'pointer',background:periode==='semaine'?'#1f2937':'white',color:periode==='semaine'?'white':'#6b7280',fontWeight:'bold'}}>Cette semaine</button>
            <button onClick={() => { setPeriode('mois'); charger('mois'); }} style={{padding:'8px 16px',borderRadius:'8px',border:'none',cursor:'pointer',background:periode==='mois'?'#1f2937':'white',color:periode==='mois'?'white':'#6b7280',fontWeight:'bold'}}>Ce mois</button>
            <button onClick={() => { setPeriode('tout'); charger('tout'); }} style={{padding:'8px 16px',borderRadius:'8px',border:'none',cursor:'pointer',background:periode==='tout'?'#1f2937':'white',color:periode==='tout'?'white':'#6b7280',fontWeight:'bold'}}>Tout</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px'}}>
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
            <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',textAlign:'center'}}>
              <p style={{color:'#6b7280',fontSize:'14px',marginBottom:'8px'}}>Taux utilisation</p>
              <p style={{fontSize:'36px',fontWeight:'bold',color:'#f97316'}}>{stats.total > 0 ? Math.round(stats.utilises / stats.total * 100) : 0}%</p>
            </div>
          </div>
      <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',marginTop:'16px'}}>
            <h3 style={{fontSize:'16px',fontWeight:'bold',color:'#1f2937',marginBottom:'16px'}}>Participations par jour</h3>
            <GraphiqueBarres partData={partData} />
          </div>
        </div>
      )}

      {onglet === 'lots' && (
        <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>Gestion des lots</h2>
          {confirmation && <p style={{color:'#16a34a',fontWeight:'bold',marginBottom:'12px'}}>OK {confirmation}</p>}
          <p style={{color:'#6b7280',fontSize:'14px',marginBottom:'8px'}}>Total probabilites : {lots.reduce((a,l) => a+l.probabilite, 0)}</p>
          <p style={{color:'#9ca3af',fontSize:'13px',marginBottom:'16px',background:'#f9fafb',padding:'10px',borderRadius:'8px'}}>Info : Les probabilites fonctionnent en pourcentage. Si le total fait 100, chaque chiffre est directement un %. Ex : Cafe = 10 signifie 10% de chance de gagner un cafe.</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px',padding:'16px',background:'#f9fafb',borderRadius:'12px',marginBottom:'16px',alignItems:'center'}}>
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder='Nom du lot' style={{flex:1,minWidth:'120px',padding:'8px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px'}}/>
            <input type='color' value={newCouleur} onChange={(e) => setNewCouleur(e.target.value)} style={{width:'40px',height:'36px',borderRadius:'8px',border:'1px solid #e5e7eb',cursor:'pointer'}}/>
            <input type='number' value={newProba} onChange={(e) => setNewProba(parseInt(e.target.value))} style={{width:'70px',padding:'8px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px',textAlign:'center'}}/>
            <button onClick={ajouterLot} style={{padding:'8px 16px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#f97316',color:'white',fontWeight:'bold',fontSize:'14px'}}>Ajouter</button>
          </div>
          {lots.map((lot) => (
            <div key={lot.id} style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'8px',padding:'12px',borderBottom:'1px solid #f3f4f6'}}>
              <div style={{width:'16px',height:'16px',borderRadius:'50%',background:lot.couleur,flexShrink:0}}></div>
              <input defaultValue={lot.label} onBlur={(e) => modifierLabel(lot.id, e.target.value)} style={{flex:1,padding:'8px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px'}}/>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <input type='number' defaultValue={lot.probabilite} onBlur={(e) => modifierProba(lot.id, e.target.value)} style={{width:'60px',padding:'8px',borderRadius:'8px',border:'1px solid #e5e7eb',fontSize:'14px',textAlign:'center'}}/>
                <span style={{color:'#f97316',fontSize:'14px',fontWeight:'bold',minWidth:'40px'}}>{Math.round(lot.probabilite / lots.reduce((a,l) => a+l.probabilite, 0) * 100)}%</span>
              </div>
              <button onClick={() => toggleActif(lot.id, lot.actif)} style={{padding:'6px 12px',borderRadius:'8px',border:'none',cursor:'pointer',background:lot.actif?'#dcfce7':'#fee2e2',color:lot.actif?'#16a34a':'#dc2626',fontSize:'13px',fontWeight:'bold'}}>
                {lot.actif ? 'Actif' : 'Inactif'}
              </button>
              <button onClick={async () => { if (!confirm('Supprimer ce lot ?')) return; await supabase.from('lots').delete().eq('id', lot.id); charger(); }} style={{padding:'6px 10px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#f3f4f6',color:'#6b7280',fontSize:'13px',fontWeight:'bold'}}>Suppr</button>
            </div>
          ))}
        </div>
      )}

      {onglet === 'codes' && (
        <div style={{background:'white',borderRadius:'16px',padding:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',overflowX:'auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
            <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937'}}>Derniers codes</h2>
            <button onClick={async () => { if (!confirm('Supprimer les codes expires ?')) return; const expires = codes.filter(c => c.expire_le && new Date(c.expire_le) < new Date() && !c.utilise); for (const c of expires) { await supabase.from('codes').delete().eq('id', c.id); } charger(); }} style={{padding:'8px 14px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#fef9c3',color:'#ca8a04',fontSize:'13px',fontWeight:'bold'}}>Suppr expires</button>
              <button onClick={supprimerTout} style={{padding:'8px 14px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#fee2e2',color:'#dc2626',fontSize:'13px',fontWeight:'bold'}}>Tout supprimer</button>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #f3f4f6'}}>
                <th style={{textAlign:'left',padding:'8px',color:'#6b7280',fontSize:'14px'}}>Code</th>
                <th style={{textAlign:'left',padding:'8px',color:'#6b7280',fontSize:'14px'}}>Lot</th>
                <th style={{textAlign:'left',padding:'8px',color:'#6b7280',fontSize:'14px'}}>Statut</th>
                <th style={{textAlign:'left',padding:'8px',color:'#6b7280',fontSize:'14px'}}>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                  <td style={{padding:'8px 4px',fontWeight:'bold',color:'#f97316',letterSpacing:'1px'}}>{c.code}</td>
                  <td style={{padding:'8px 4px',color:'#1f2937'}}>{c.lot}</td>
                  <td style={{padding:'8px 4px'}}>
                    {c.utilise ? (
                      <span style={{background:'#dcfce7',color:'#16a34a',padding:'4px 8px',borderRadius:'20px',fontSize:'11px'}}>Utilise</span>
                    ) : c.expire_le && new Date(c.expire_le) < new Date() ? (
                      <span style={{background:'#fee2e2',color:'#dc2626',padding:'4px 8px',borderRadius:'20px',fontSize:'11px'}}>Expire</span>
                    ) : (
                      <span style={{background:'#fef9c3',color:'#ca8a04',padding:'4px 8px',borderRadius:'20px',fontSize:'11px'}}>Attente</span>
                    )}
                  </td>
                  <td style={{padding:'8px 4px',color:'#6b7280',fontSize:'11px'}}>{new Date(c.cree_le).toLocaleString('fr-FR')}</td>
                  <td style={{padding:'8px 4px'}}>
                    <button onClick={() => supprimerCode(c.id)} style={{padding:'6px 10px',borderRadius:'8px',border:'none',cursor:'pointer',background:'#fee2e2',color:'#dc2626',fontSize:'12px',fontWeight:'bold'}}>Suppr</button>
                  </td>
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
            <input value={config.nom} onChange={(e) => setConfig({...config, nom: e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid #e5e7eb',fontSize:'16px',boxSizing:'border-box'}}/>
          </div>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',color:'#6b7280',fontSize:'14px',marginBottom:'8px'}}>Lien Google Avis</label>
            <input value={config.lien_google || ''} onChange={(e) => setConfig({...config, lien_google: e.target.value})} placeholder='https://search.google.com/local/writereview?placeid=...' style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid #e5e7eb',fontSize:'14px',boxSizing:'border-box'}}/>
            <p style={{color:'#9ca3af',fontSize:'12px',marginTop:'4px'}}>Trouvez votre lien sur Google My Business</p>
          </div>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',color:'#6b7280',fontSize:'14px',marginBottom:'8px'}}>Mot de passe admin</label>
            <input type='password' value={config.mot_de_passe || ''} onChange={(e) => setConfig({...config, mot_de_passe: e.target.value})} placeholder='Nouveau mot de passe' style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid #e5e7eb',fontSize:'14px',boxSizing:'border-box'}}/>
          </div>
          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block',color:'#6b7280',fontSize:'14px',marginBottom:'8px'}}>Couleur principale</label>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <input type='color' value={config.couleur_principale} onChange={(e) => setConfig({...config, couleur_principale: e.target.value})} style={{width:'60px',height:'40px',borderRadius:'8px',border:'1px solid #e5e7eb',cursor:'pointer'}}/>
              <p style={{color:'#6b7280',fontSize:'13px'}}>Couleur des boutons et textes importants sur le site client</p>
            </div>
          </div>
          <button onClick={async () => { await supabase.from('config').update({ nom: config.nom, couleur_principale: config.couleur_principale, lien_google: config.lien_google, mot_de_passe: config.mot_de_passe }).eq('id', config.id); alert('Parametres sauvegardes !'); }} style={{background:'#f97316',color:'white',fontWeight:'bold',padding:'12px 24px',borderRadius:'12px',border:'none',cursor:'pointer',fontSize:'16px'}}>
            Sauvegarder
          </button>
        </div>
      )}
    </div>
  );
}`;

writeFileSync('app/admin/page.tsx', code);
console.log('Fichier cree avec succes !');