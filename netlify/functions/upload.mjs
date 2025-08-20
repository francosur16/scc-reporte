import { createClient } from '@supabase/supabase-js';

export default async (event, context) => {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_BUCKET } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_BUCKET) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Missing SUPABASE envs' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { path, base64, type, name } = body || {};
    if (!path || !base64) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'missing path/base64' }) };
    }

    const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const bytes = Buffer.from(base64, 'base64');
    const { error: upErr } = await supa.storage
      .from(SUPABASE_BUCKET)
      .upload(path, bytes, { contentType: type || 'application/octet-stream', upsert: false });

    if (upErr) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: upErr.message }) };
    }

    const { data: pub } = supa.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, path, url: pub.publicUrl, type, name })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: e?.message || String(e) }) };
  }
};
