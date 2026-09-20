const { put, head } = require('@vercel/blob');

function sanitizeUsername(raw) {
  return String(raw || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 64);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'Storage is not configured (missing BLOB_READ_WRITE_TOKEN).' });
    return;
  }

  if (req.method === 'GET') {
    const user = sanitizeUsername(req.query.user);
    if (!user) {
      res.status(400).json({ error: 'Missing user' });
      return;
    }
    const key = `users/${user}.json`;
    try {
      const info = await head(key, { token });
      const r = await fetch(info.url, { cache: 'no-store' });
      if (!r.ok) throw new Error('fetch failed');
      const data = await r.json();
      res.status(200).json({ data });
    } catch (e) {
      // No saved data yet for this user — that's fine, not an error.
      res.status(200).json({ data: null });
    }
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const user = sanitizeUsername(body && body.user);
    const data = body && body.data;
    if (!user) {
      res.status(400).json({ error: 'Missing user' });
      return;
    }
    const key = `users/${user}.json`;
    try {
      await put(key, JSON.stringify(data || {}), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        token,
      });
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: 'Save failed', detail: String(e && e.message || e) });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end();
};
