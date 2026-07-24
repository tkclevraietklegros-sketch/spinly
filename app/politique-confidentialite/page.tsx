export default function PolitiqueConfidentialite() {
  return (
    <div style={{minHeight:'0'+'0vh',background:'#f9fafb',padding:'40px 24px',display:'flex',justifyContent:'center'}}>
      <div style={{maxWidth:'700px',width:'100%',background:'white',borderRadius:'16px',padding:'40px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
        <h1 style={{fontSize:'26px',fontWeight:'bold',color:'#1f2937',marginBottom:'24px'}}>Politique de confidentialite</h1>

        <p style={{color:'#6b7280',marginBottom:'24px',lineHeight:'1.7'}}>
          Derniere mise a jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',marginTop:'32px',marginBottom:'12px'}}>1. Donnees collectees</h2>
        <p style={{color:'#6b7280',marginBottom:'16px',lineHeight:'1.7'}}>
          Dans le cadre de l'utilisation de Spinly, nous collectons les donnees suivantes : les participations a la roue (lot gagne, mode restaurant ou livraison, date), les codes de validation generes, et un cookie technique anti-triche empechant plusieurs participations lors d'une meme visite.
        </p>

        <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',marginTop:'32px',marginBottom:'12px'}}>2. Finalite du traitement</h2>
        <p style={{color:'#6b7280',marginBottom:'16px',lineHeight:'1.7'}}>
          Ces donnees sont utilisees uniquement pour faire fonctionner le systeme de jeu (attribution des lots, validation des codes par le restaurant) et etablir des statistiques anonymes a destination du restaurateur.
        </p>

        <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',marginTop:'32px',marginBottom:'12px'}}>3. Cookies</h2>
        <p style={{color:'#6b7280',marginBottom:'16px',lineHeight:'1.7'}}>
          Un cookie technique strictement necessaire est depose pour eviter les participations multiples. Ce cookie ne necessite pas de consentement prealable conformement a l'article 82 de la loi Informatique et Libertes, car il est indispensable au fonctionnement du service demande par l'utilisateur.
        </p>

        <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',marginTop:'32px',marginBottom:'12px'}}>4. Duree de conservation</h2>
        <p style={{color:'#6b7280',marginBottom:'16px',lineHeight:'1.7'}}>
          Les donnees de participation sont conservees pour la duree necessaire au bon fonctionnement du service et a l'etablissement de statistiques, puis supprimees ou anonymisees.
        </p>

        <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',marginTop:'32px',marginBottom:'12px'}}>5. Vos droits</h2>
        <p style={{color:'#6b7280',marginBottom:'16px',lineHeight:'1.7'}}>
          Conformement au Reglement General sur la Protection des Donnees (RGPD), vous disposez d'un droit d'acces, de rectification et de suppression de vos donnees. Pour exercer ces droits, vous pouvez nous contacter a l'adresse ci-dessous.
        </p>

        <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#1f2937',marginTop:'32px',marginBottom:'12px'}}>6. Contact</h2>
        <p style={{color:'#6b7280',marginBottom:'16px',lineHeight:'1.7'}}>
          Pour toute question relative a cette politique de confidentialite ou a vos donnees personnelles, contactez-nous a : topicrolic@gmail.com
        </p>

        <p style={{color:'#9ca3af',fontSize:'13px',marginTop:'40px'}}>
          Cette politique peut etre mise a jour. Nous vous invitons a la consulter regulierement.
        </p>
      </div>
    </div>
  );
}
