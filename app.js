const express = require('express');

const app = express();
app.use(express.json());

const port = process.env.PORT;
const appId = process.env.APP_ID;
const wpToken = process.env.WP_TOKEN;
const gptToken = process.env.GPT_TOKEN;
const verifyToken = process.env.VERIFY_TOKEN;

app.get('/', (req, res) => {
  const {
    'hub.mode': mode,
    'hub.challenge': challenge,
    'hub.verify_token': token
  } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED: ', challenge);
    console.log({
      challenge
    });

    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const number = req.body.entry[0].changes[0].value.contacts[0].wa_id;
  const name = req.body.entry[0].changes[0].value.contacts[0].profile.name;
  const message = req.body.entry[0].changes[0].value.message[0].text.body;

  // const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${gptToken}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-4o-mini',
  //     max_tokens: 150,
  //     messages: [{
  //         role: "system",
  //         content: "Você é um professor de inglês de nível avançado respondendo em inglês para um aluno de nível básico."
  //       },
  //       {
  //         role: "user",
  //         content: "Você deve responder sempre de forma curta e direta."
  //       },
  //       {
  //         role: 'user',
  //         content: message
  //       },
  //     ]
  //   })
  // });
  // const data = await response.json();
  // const responseText = 'data.choices[0].message.content';
  // const responseGPT = data;
  // console.log(JSON.stringify(responseGPT, null, 2));


  const body = `Olá ${name}, como posso te ajudar hoje?`;

  await fetch(`https://graph.facebook.com/v22.0/${appId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${wpToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: number,
      type: 'text',
      text: {
        preview_url: false,
        body: body
      }
    })
  });

  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});

app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});