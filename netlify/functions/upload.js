// netlify/functions/upload.js
import { createClient } from '@supabase/supabase-js';

export default async (req, res) => {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok:false, error:'Method Not Allowed' });
  }

  try {
    // Variables de entorno (configuralas en Netlify)
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE; // **clave secreta**
    const BUCKET = process.env.SUPABASE_BUCKET || 'scc-uploads';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return res.status(500).json({ ok:false, error:'Missing env vars' });
    }

    const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // Leemos FormData
    const contentType = req.headers['content-type'] || '';
    if (!contentType.startsWith('multipart/form-data')) {
      return res.status(400).json({ ok:false, error:'Expected multipart/form-data' });
    }

    // Netlify parsea automáticamente el body en versiones nuevas con edge/lambda?
    // Para máxima compat: usamos un parser simple de form-data
    // Pero Netlify ya expone req.files/req.body en funciones clásicas con @netlify/functions v2.
    // Usamos un fallback universal:
    const chunks = [];
    for await (const ch of req) chunks.push(ch);
    const raw = Buffer.concat(chunks);

    // Como parser de multipart es largo, mejor mandamos el archivo en base64 desde el cliente:
    // Si querés multipart real, podríamos agregar 'busboy', pero mantengamos esto simple.
    // => Salimos si no recibimos JSON
    try {
      const json = JSON.parse(raw.toString('utf8'));
      const { path, name, type, base64 } = json || {};
      if (!path || !base64) {
        return res.status(400).json({ ok:false, error:'Missing fields (path, base64)' });
      }
      const fileBuffer = Buffer.from(base64, 'base64');

      const { error: upErr } = await supa.storage.from(BUCKET).upload(path, fileBuffer, {
        contentType: type || 'application/octet-stream',
        upsert: true
      });
      if (upErr) {
        return res.status(500).json({ ok:false, error: upErr.message });
      }
      const { data: pub } = supa.storage.from(BUCKET).getPublicUrl(path);
      return res.status(200).json({ ok:true, url: pub.publicUrl, path, name, type });
    } catch (e) {
      return res.status(400).json({ ok:false, error:'Bad payload: '+e.message });
    }
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
};
