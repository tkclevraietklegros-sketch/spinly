import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { slug, motDePasse } = await req.json();
  const { data: restau } = await supabase.from('restaurants').select('id').eq('slug', slug).single();
  if (!restau) return NextResponse.json({ succes: false, erreur: 'Restaurant introuvable' });
  const { data: configData } = await supabase.from('config').select('mot_de_passe').eq('restaurant_id', restau.id).single();
  if (!configData) return NextResponse.json({ succes: false, erreur: 'Configuration introuvable' });
  const motDePasseStocke = configData.mot_de_passe;
  let valide = false;
  if (motDePasseStocke.startsWith('$2')) {
    valide = await bcrypt.compare(motDePasse, motDePasseStocke);
  } else {
    valide = motDePasse === motDePasseStocke;
    if (valide) {
      const hash = await bcrypt.hash(motDePasse, 10);
      await supabase.from('config').update({ mot_de_passe: hash }).eq('restaurant_id', restau.id);
    }
  }
  if (!valide) return NextResponse.json({ succes: false, erreur: 'Mot de passe incorrect' });
  await supabase.from('config').update({ dernier_login: new Date().toISOString() }).eq('restaurant_id', restau.id);
  return NextResponse.json({ succes: true, restaurantId: restau.id });
}