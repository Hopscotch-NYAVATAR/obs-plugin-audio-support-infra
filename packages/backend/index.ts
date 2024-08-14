import express from 'express';
import cors from 'cors';

import { readFromEnv } from './env.js';
import { generateIndefiniteAccessToken } from './indefiniteAccessToken.js';
import { decodeBase64URL } from './jwt.js';

const app = express();

const origin = readFromEnv('CORS_ORIGINS').split(' ');

app.options(
	'/indefiniteAccessToken/issue',
	cors({
		origin,
		methods: ['POST'],
		allowedHeaders: ['Authorization']
	})
);

app.post('/indefiniteAccessToken/issue', cors(), async (req, res) => {
	const userInfo = req.get('X-Apigateway-Api-Userinfo');
	if (!userInfo) {
		throw new Error('Authorization info is invalid!');
	}

	const payloadBytes = decodeBase64URL(userInfo);
	const payload = JSON.parse(payloadBytes.toString('utf-8'));

	const sub = payload.sub;
	if (!sub) {
		throw new Error('Authorization info is invalid!');
	}

	const indefiniteAccessToken = await generateIndefiniteAccessToken({ sub });
	res.send(indefiniteAccessToken);
});

app.post('/audioRecordingAccessToken', (_, res) => {
	res.send('{}');
});

import { Storage } from "@google-cloud/storage";

const AR_BUCKET_NAME = readFromEnv("AR_BUCKET_NAME");

app.post('/audioRecord/uploadDestination/batchIssue', async (req, res) => {
  const storage = new Storage();

  const userInfo = req.get('X-Apigateway-Api-Userinfo');
	if (!userInfo) {
		throw new Error('Authorization info is invalid!');
	}

	const payloadBytes = decodeBase64URL(userInfo);
	const payload = JSON.parse(payloadBytes.toString('utf-8'));

	const sub = payload.sub;

  const start = Number(req.query['start']);
  const count = Number(req.query['start']);

  if (start < 0 || start >= 1000000 || count >= 100) {
    res.status(400).send({
      error: "Bad request"
    });
    throw new Error("Invalid request range!")
  }

  const urls = [];
  for (let i = 0; i < count; i++) {
    const paddedIndex = (i + start).toString(10).padStart(6, '0');
    const [url] = await storage.bucket(AR_BUCKET_NAME).file(`${sub}-${paddedIndex}.opus`).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 60 * 60 * 1000
    })
    urls.push(url);
  }

  res.send({
    destinations: urls
  })
});

app.listen(process.env['PORT'] ?? 3000);
