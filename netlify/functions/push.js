// netlify/functions/push.js
import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return resp(405, { error: 'Method not allowed' });
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    const table = process.env.BOARDS_TABLE || 'boards';

    if (!url || !key) return resp(500, { error: 'Missing SUPABASE envs' });

    const body = JSON.parse(event.body || '{}');
    const slug = (body.slug || '').trim();
    const payload = body.data;

    if (!slug) return resp(400, { error: 'Missing slug' });
    if (typeof payload !== 'object') return resp(400, { error: 'Missing data' });

    const supa = createClient(url, key);
    const row = { slug, data: payload, updated_at: new Date().toISOString() };

    const { error } = await supa.from(table).upsert(row, { onConflict: 'slug' });
    if (error) return resp(500, { error: error.message });

    return resp(200, { ok: true });
  } catch (e) {
    return resp(500, { error: e.message });
  }
};

function resp(statusCode, body){
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}
