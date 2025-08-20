import { createClient } from '@supabase/supabase-js';

export async function handler(event) {
  try {
    const { path, name, type, base64 } = JSON.parse(event.body || '{}');
    if (!path || !base64) return j(400, { ok:false, error:'missing path/base64' });

    const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const bytes = Buffer.from(base64, 'base64');

    const { error } = await supa.storage.from('novedades').upload(path, bytes, {
      contentType: type || 'application/octet-stream',
      upsert: false,
      cacheControl: '3600',
    });
    if (error) return j(500, { ok:false, error: error.message });

    const { data:pub, error:pubErr } = supa.storage.from('novedades').getPublicUrl(path);
    if (pubErr) return j(500, { ok:false, error: pubErr.message });

    return j(200, { ok:true, path, url: pub.publicUrl, type, name });
  } catch (e) {
    return j(500, { ok:false, error: String(e) });
  }
}
function j(status, body){
  return { statusCode: status, headers:{'content-type':'application/json'}, body: JSON.stringify(body) };
}
