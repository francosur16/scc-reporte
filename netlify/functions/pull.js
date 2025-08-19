// netlify/functions/pull.js
import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    const table = process.env.BOARDS_TABLE || 'boards';

    if (!url || !key) {
      return resp(500, { error: 'Missing SUPABASE envs' });
    }

    const slug = (event.queryStringParameters?.slug || '').trim();
    if (!slug) return resp(400, { error: 'Missing slug' });

    const supa = createClient(url, key);
    const { data, error } = await supa
      .from(table)
      .select('data')
      .eq('slug', slug)
      .maybeSingle();

    if (error) return resp(500, { error: error.message });

    return resp(200, { ok: true, data: data?.data || null });
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
