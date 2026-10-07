import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { userId, costoCoins, descuentoPorcentaje } = await request.json();

    if (!userId || !costoCoins) {
      return new Response(JSON.stringify({ error: 'Datos incompletos.' }), { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('s_coins')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado.' }), { status: 404, headers: corsHeaders });
    }

    if (profile.s_coins < costoCoins) {
      return new Response(JSON.stringify({ error: 'No tienes suficientes s-Coins.' }), { status: 400, headers: corsHeaders });
    }

    const nuevoBalance = profile.s_coins - costoCoins;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ s_coins: nuevoBalance })
      .eq('id', userId);

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Error al actualizar balance.' }), { status: 500, headers: corsHeaders });
    }

    const codigoUnico = `SYNTH-${descuentoPorcentaje}%-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await supabase.from('coupons').insert([
      { code: codigoUnico, discount: descuentoPorcentaje, user_id: userId, used: false }
    ]).catch(() => {});

    return new Response(JSON.stringify({ success: true, codigo: codigoUnico, nuevoBalance }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
