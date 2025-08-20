const { createClient } = require('@supabase/supabase-js');

module.exports = async (event, context) => {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing SUPABASE envs' }) };
    }

    const { slug, data: boardData } = JSON.parse(event.body || '{}');
    if (!slug || !boardData) {
      return { statusCode: 400, body: JSON.stringify({ error: 'missing slug/data' }) };
    }

    const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { error } = await supa
      .from('boards')
      .upsert({ slug, data: boardData }, { onConflict: 'slug' });

    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e?.message || String(e) }) };
  }
};
