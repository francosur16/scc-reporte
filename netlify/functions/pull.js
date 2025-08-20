import { createClient } from '@supabase/supabase-js';

export default async (event, context) => {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
    const slug = (new URL(event.rawUrl)).searchParams.get('slug') || 'scc-reporte-publico';
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing SUPABASE envs' }) };
    }
    const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data, error } = await supa.from('boards').select('data').eq('slug', slug).maybeSingle();
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    if (!data) return { statusCode: 200, body: JSON.stringify({ ok: true, data: null }) };
    return { statusCode: 200, body: JSON.stringify({ ok: true, data: data.data }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e?.message || String(e) }) };
  }
};
