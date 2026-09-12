module.exports = async (req, res) => {
  const allowedOrigin = 'https://benz-asc.github.io';

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method Not Allowed'
    });
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const groupId = process.env.LINE_GROUP_ID;

  if (!token || !groupId) {
    console.error('Missing LINE environment variables');

    return res.status(500).json({
      ok: false,
      error: 'LINE environment not configured'
    });
  }

  const body = req.body || {};
  const slot = body.slot;
  const names = Array.isArray(body.names) ? body.names : [];

  if (!['N1', 'N2'].includes(slot)) {
    return res.status(400).json({
      ok: false,
      error: 'Invalid slot'
    });
  }

  if (
    names.length !== 4 ||
    names.some(
      name => typeof name !== 'string' || !name.trim()
    )
  ) {
    return res.status(400).json({
      ok: false,
      error: 'Exactly 4 names are required'
    });
  }

  const cleanNames = names.map(name => name.trim());

  const text =
    `🏸 NEXTMATCH — ${slot} / เกมถัดไป\n` +
    cleanNames.join(' / ');

  try {
    const response = await fetch(
      'https://api.line.me/v2/bot/message/push',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization':
            `Bearer ${token}`
        },
        body: JSON.stringify({
          to: groupId,
          messages: [
            {
              type: 'text',
              text
            }
          ]
        })
      }
    );

    const result = await response.text();

    console.log(
      'NEXTMATCH LINE PUSH:',
      response.status,
      result
    );

    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        error: 'LINE push failed'
      });
    }

    return res.status(200).json({
      ok: true
    });

  } catch (error) {

    console.error(
      'NEXTMATCH LINE PUSH ERROR:',
      error
    );

    return res.status(500).json({
      ok: false,
      error: 'LINE push error'
    });
  }
};
