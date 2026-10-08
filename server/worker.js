// Proxy de transcripción (Cloudflare Worker). Su único trabajo: guardar la clave de OpenAI en el servidor
// y reenviar el audio. No almacena ni registra audio ni texto.
//
// Variables (wrangler secret put …):
//   OPENAI_API_KEY  (obligatoria, secreto)
//   APP_TOKEN       (recomendada, secreto: la app lo envía como "Bearer"; evita que otros usen tu clave)
//   ALLOWED_ORIGIN  (recomendada, ej. https://tuusuario.github.io — se usa para CORS)
//   MODEL           (opcional, por defecto "whisper-1"; también sirve "gpt-4o-mini-transcribe")
const MAX_BYTES = 25 * 1024 * 1024; // límite de la API de OpenAI

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || '*';
    const cors = {
      'Access-Control-Allow-Origin': allowed === '*' ? '*' : (origin === allowed ? origin : allowed),
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
    };
    const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ error: 'method' }, 405);
    if (allowed !== '*' && origin && origin !== allowed) return json({ error: 'origin' }, 403);
    if (env.APP_TOKEN && request.headers.get('Authorization') !== `Bearer ${env.APP_TOKEN}`) return json({ error: 'auth' }, 401);
    if (!env.OPENAI_API_KEY) return json({ error: 'server-misconfigured' }, 500);
    if (Number(request.headers.get('Content-Length') || 0) > MAX_BYTES) return json({ error: 'too-large' }, 413);

    let form;
    try { form = await request.formData(); } catch { return json({ error: 'bad-request' }, 400); }
    const file = form.get('file');
    if (!file || typeof file === 'string' || file.size > MAX_BYTES) return json({ error: 'file' }, 400);

    const out = new FormData();
    out.append('file', file, file.name || 'nota.webm');
    out.append('model', env.MODEL || 'whisper-1');
    out.append('language', String(form.get('language') || 'es').slice(0, 5));
    out.append('response_format', 'json');
    out.append('temperature', '0');
    // Contexto médico: Whisper usa el prompt como vocabulario/estilo esperado (≈224 tokens máx.).
    const prompt = String(form.get('prompt') || '').slice(0, 1200);
    if (prompt) out.append('prompt', prompt);

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST', headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` }, body: out,
    });
    if (!res.ok) return json({ error: 'upstream', status: res.status }, 502);
    const data = await res.json();
    return json({ text: data.text ?? '' });
  },
};
