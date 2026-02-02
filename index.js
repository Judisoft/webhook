const express = require('express');
// body-parser is built into express now
require('dotenv').config();
const axios = require('axios');

const app = express();
const morgan = require('morgan');

// Log every request to the console
app.use(morgan('dev'));

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Use express built-in body parser
app.use(express.json());

// Debug middleware to log headers and body of every request
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
     console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Default route
app.get('/', (req, res) => {
  res.send('WhatsApp Webhook Server is running!');
});

// Verification request (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400); // Bad request if parameters are missing
  }
});

// Event notification (POST)
app.post('/webhook', (req, res) => {
  const body = req.body;

  console.log('Received webhook payload:', JSON.stringify(body, null, 2));

  try {
    // Check if this is an event from a WhatsApp API
    if (body.object) {
      if (body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]) {

        const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
        const from = body.entry[0].changes[0].value.messages[0].from;
        const msgBody = body.entry[0].changes[0].value.messages[0].text?.body || "No text body found";

        console.log(`Message received from ${from}: ${msgBody}`);

        // Here you would typically process the message
      }

      res.sendStatus(200);
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
