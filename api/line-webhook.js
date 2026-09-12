module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).send('NEXTMATCH LINE Webhook OK');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const body = req.body || {};
  const events = Array.isArray(body.events) ? body.events : [];

  for (const event of events) {
    const groupId = event?.source?.groupId;
    const text = event?.message?.text;

    if (groupId) {
      console.log('LINE GROUP ID:', groupId);
    }

    // ทดสอบเฉพาะเมื่อมีคนพิมพ์ "Test"
    if (groupId && text === 'Test') {
      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          to: groupId,
          messages: [
            {
              type: 'text',
              text: '🏸 NEXTMATCH TEST OK'
            }
          ]
        })
      });

      const result = await response.text();
      console.log('LINE PUSH RESULT:', response.status, result);
    }
  }

  return res.status(200).json({ ok: true });
};
