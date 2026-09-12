module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).send('NEXTMATCH LINE Webhook OK');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const body = req.body || {};
  const events = Array.isArray(body.events) ? body.events : [];

  console.log('LINE WEBHOOK EVENT:', JSON.stringify(body));

  for (const event of events) {
    const groupId = event?.source?.groupId;
    if (groupId) {
      console.log('LINE GROUP ID:', groupId);
    }
  }

  return res.status(200).json({ ok: true });
};
