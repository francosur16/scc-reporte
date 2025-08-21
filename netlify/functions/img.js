import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'novedades';

const supa = createClient(SUPABASE_URL, SERVICE_KEY);

export async function handler(event) {
  try {
    const url  = new URL(event.rawUrl);
    const path = url.searchParams.get('path');
    const dl   = url.searchParams.has('dl');

    if (!path) return { statusCode: 400, body: 'missing path' };

    const { data, error } = await supa.storage.from(BUCKET).download(path);
    if (error) throw error;

    const buf = Buffer.from(await data.arrayBuffer());
    const headers = {
      'Content-Type': data.type || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
      ...(dl ? { 'Content-Disposition': 'attachment' } : {})
    };

    return {
      statusCode: 200,
      headers,
      body: buf.toString('base64'),
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 500, body: String(e?.message || e) };
  }
}
