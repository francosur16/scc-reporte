export async function handler(event) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  const slug = event.queryStringParameters.slug;
  if (!slug) return { statusCode: 400, body: 'missing slug' };

  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/boards?select=data&slug=eq.${encodeURIComponent(slug)}`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );

  if (!r.ok) return { statusCode: r.status, body: await r.text() };
  const arr = await r.json();
  return { statusCode: 200, body: JSON.stringify({ data: arr[0]?.data || null }) };
}
