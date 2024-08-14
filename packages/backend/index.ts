import express from 'express';
import cors from 'cors';

import { readFromEnv } from './env.js';
import { generateIndefiniteAccessToken, getJWKS } from './indefiniteAccessToken.js';
import { decodeBase64URL } from './jwt.js';

const app = express();

const origin = readFromEnv('CORS_ORIGINS').split(' ');

app.get('/indefiniteAccessToken/jwks', async (_, res) => {
	const jwks = await getJWKS();
	res.send(jwks);
});

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

	const uid = payload.uid;
	const indefiniteAccessToken = await generateIndefiniteAccessToken({ uid });
	res.send(indefiniteAccessToken);
});

app.post('/audioRecordingAccessToken', (_, res) => {
	res.send('{}');
});

app.listen(process.env['PORT'] ?? 3000);
