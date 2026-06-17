// One-shot migration: encrypt all existing plaintext monetary values in
// financial_particulars. Skips the demo user (user@yopmail.com).
// Safe to re-run — already-encrypted values (prefix "enc:v1:") are left alone.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { encryptNumber } from '../_shared/encryption.ts';

const DEMO_EMAIL = 'user@yopmail.com';
const ENC_PREFIX = 'enc:v1:';
const FIELDS = ['amount', 'cash', 'investment', 'current_value'] as const;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require an authenticated user. Any logged-in user can trigger this
    // one-shot migration; the admin client only updates rows belonging to
    // non-demo users.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'No authorization header' }, 401);
    const token = authHeader.replace('Bearer ', '');

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );
    const { data: { user }, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !user) return json({ error: 'Invalid token' }, 401);

    // Service-role client for the migration writes
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Resolve demo user id (skip their rows)
    let demoUserId: string | null = null;
    try {
      // listUsers paginates; demo user should be on page 1 in this small project
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const demo = list?.users?.find((u) => (u.email ?? '').toLowerCase() === DEMO_EMAIL);
      demoUserId = demo?.id ?? null;
    } catch (_) {
      // ignore — if we can't list, just don't skip
    }

    let query = admin
      .from('financial_particulars')
      .select('id, user_id, amount, cash, investment, current_value');
    if (demoUserId) query = query.neq('user_id', demoUserId);

    const { data: rows, error: selErr } = await query;
    if (selErr) return json({ error: selErr.message }, 400);

    let scanned = 0;
    let updated = 0;
    let skippedAlreadyEncrypted = 0;
    let failed = 0;

    for (const row of rows ?? []) {
      scanned++;
      const updates: Record<string, string> = {};
      let touched = false;
      let allEncrypted = true;

      for (const f of FIELDS) {
        const val = (row as any)[f];
        if (typeof val === 'string' && val.startsWith(ENC_PREFIX)) continue;
        allEncrypted = false;
        const n = Number(val ?? 0);
        const safe = Number.isFinite(n) ? n : 0;
        updates[f] = await encryptNumber(safe);
        touched = true;
      }

      if (allEncrypted) {
        skippedAlreadyEncrypted++;
        continue;
      }
      if (!touched) continue;

      const { error: updErr } = await admin
        .from('financial_particulars')
        .update(updates)
        .eq('id', (row as any).id);
      if (updErr) failed++;
      else updated++;
    }

    return json({
      ok: true,
      demo_user_skipped: !!demoUserId,
      demo_user_id: demoUserId,
      scanned,
      updated,
      skipped_already_encrypted: skippedAlreadyEncrypted,
      failed,
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
