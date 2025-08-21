// netlify/functions/img.js  (ESM)
export async function handler(event) {
  try {
    const qs = event.queryStringParameters || {};
    let p = (qs.path || '').replace(/^\/+/, '');  // limpia slashes

    if (!p) {
      return { statusCode: 400, body: 'Missing ?path=' };
    }

    const BUCKET = 'novedades';
    if (!p.startsWith(BUCKET + '/')) p = `${BUCKET}/${p}`;

    // Usa SUPABASE_URL desde variables de entorno en Netlify
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ixzpjcuuvorndkgphtue.supabase.co';

    // Opción A (recomendada): redirección simple a la pública
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${p}`;

    return {
      statusCode: 302,
      headers: {
        Location: publicUrl,
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    };

    /* ===== Opción B: proxy (si no querés redirigir)
    const resp = await fetch(publicUrl);
    const buf = await resp.arrayBuffer();
    return {
      statusCode: resp.status,
      headers: {
        'Content-Type': resp.headers.get('content-type') || 'application/octet-stream',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*'
      },
      body: Buffer.from(buf).toString('base64'),
      isBase64Encoded: true
    };
    */
  } catch (e) {
    // Log visible en Netlify
    console.error('[img fn] ERROR', e);
    return { statusCode: 502, body: 'img proxy error: ' + (e?.message || e) };
  }
}
