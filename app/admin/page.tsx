'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Admin() {
  const [codes, setCodes] = useState([]);
  const [stats, setStats] = useState({ total: 0, utilises: 0, expires: 0 });

  useEffect(() => {
    const charger = async () => {
      const { data } = await supabase.from('codes').select('*').order('cree_le', { ascending: false }).limit(50);
      if (data) {
        setCodes(data);
        setStats({
          total: data.length,
          utilises: data.filter(c => c.utilise).length,
          expires: data.filter(c => c.expire_le && new Date(c.expire_le) < new Date()).length,
        });
      }
    };
    charger();
  }, []);

  return (
    <div style={{minHeight:'100vh',background:'#f9fafb',padding:'32px'}}>
      <h1 style={{fontSize:'24px',fontWeight:'bold',color:'#1f2937',marginBottom:'24px'}}>Dashboard Admin</h1>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'32px'}}>
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
    </div>
  );
}