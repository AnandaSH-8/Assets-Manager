import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const creatorEmail = (Deno.env.get('CREATOR_EMAIL') || '').toLowerCase();

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  // Identify caller
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData.user) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const callerEmail = (userData.user.email || '').toLowerCase();

  const admin = createClient(supabaseUrl, serviceKey);

  if (req.method === 'GET') {
    const { data, error } = await admin
      .from('app_settings')
      .select('value')
      .eq('key', 'demo_editable')
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    return json({
      demo_editable: data?.value === true,
      is_creator: !!creatorEmail && callerEmail === creatorEmail,
    });
  }

  if (req.method === 'POST') {
    if (!creatorEmail) {
      return json({ error: 'CREATOR_EMAIL not configured' }, 500);
    }
    if (callerEmail !== creatorEmail) {
      return json({ error: 'Forbidden' }, 403);
    }
    let body: { demo_editable?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }
    if (typeof body.demo_editable !== 'boolean') {
      return json({ error: 'demo_editable boolean required' }, 400);
    }
    const { error } = await admin
      .from('app_settings')
      .upsert({ key: 'demo_editable', value: body.demo_editable }, { onConflict: 'key' });
    if (error) return json({ error: error.message }, 500);
    return json({ demo_editable: body.demo_editable });
  }

  return json({ error: 'Method not allowed' }, 405);
});
