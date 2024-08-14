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

// import { Storage } from "@google-cloud/storage";

// app.post('/audioRecord/uploadDestination/batchIssue', async () => {
//   const storage = new Storage();
//   const [url] = await storage.bucket("a").file("name").getSignedUrl({
//     version: 'v4',
//     action: 'write',
//     expires: Date.now() + 60 * 60 * 1000
//   })
// });

app.post('/audioRecordingAccessToken', (_, res) => {
	res.send('{}');
});

app.listen(process.env['PORT'] ?? 3000);
