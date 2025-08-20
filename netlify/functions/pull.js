const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    // aceptá ambas, por si el env quedó con el nombre viejo
    const SUPABASE_SERVICE_KEY =
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing SUPABASE envs' }) };
    }

    const url = new URL(event.rawUrl || `http://x${event.path}${event.queryString || ''}`);
    const slug = url.searchParams.get('slug') || 'scc-reporte-publico';

    const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data, error } = await supa.from('boards').select('data').eq('slug', slug).maybeSingle();
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    if (!data) return { statusCode: 200, body: JSON.stringify({ ok: true, data: null }) };
    return { statusCode: 200, body: JSON.stringify({ ok: true, data: data.data }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e?.message || String(e) }) };
  }
};
