export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  const { slug, state } = JSON.parse(event.body || '{}');
  if (!slug || !state) return { statusCode: 400, body: 'missing fields' };

  const payload = { slug, data: state, updated_at: new Date().toISOString() };

  const r = await fetch(`${SUPABASE_URL}/rest/v1/boards?on_conflict=slug`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  });

  if (!r.ok) return { statusCode: r.status, body: await r.text() };
  return { statusCode: 200, body: 'ok' };
}
