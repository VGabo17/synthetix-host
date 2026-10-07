import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { userId, name, eggId, memory, cpu, disk, costoCoins } = await request.json();

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

    // Petición segura a la API de Pterodactyl usando las variables secretas de Cloudflare
    const pteroResponse = await fetch(`${env.PTERODACTYL_URL}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PTERODACTYL_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name || "Servidor-Free",
        user: Number(env.PTERODACTYL_USER_ID),
        egg: eggId || 1,
        docker_image: "ghcr.io/pterodactyl/yolks:java_17",
        startup: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar",
        environment: { SERVER_JARFILE: "server.jar", VANILLA_VERSION: "latest" },
        limits: { memory: memory || 2048, swap: 0, disk: disk || 10240, io: 500, cpu: cpu || 100 },
        feature_limits: { databases: 1, allocations: 1, backups: 1 },
        allocation: { default: 0 }
      })
    });

    const pteroData = await pteroResponse.json();

    if (!pteroResponse.ok) {
      return new Response(JSON.stringify({ error: 'Error al comunicarse con Pterodactyl Panel.', details: pteroData }), { status: 500, headers: corsHeaders });
    }

    const nuevoBalance = profile.s_coins - costoCoins;

    await supabase.from('profiles').update({ s_coins: nuevoBalance }).eq('id', userId);

    await supabase.from('user_servers').insert([
      { user_id: userId, pterodactyl_id: pteroData.attributes.id, name: name, status: 'active' }
    ]).catch(() => {});

    return new Response(JSON.stringify({ success: true, server: pteroData.attributes, nuevoBalance }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
