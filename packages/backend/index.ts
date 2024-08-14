import express from 'express';
import cors from 'cors';

import { readFromEnv } from './env.js';
import { generateIndefiniteAccessToken, getJWKS } from './indefiniteAccessToken.js';

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

app.post('/indefiniteAccessToken/issue', cors(), async (_, res) => {
	const uid = 'aaa';
	const indefiniteAccessToken = await generateIndefiniteAccessToken({ uid });
	res.send(indefiniteAccessToken);
});

app.post('/audioRecordingAccessToken', (_, res) => {
	res.send('{}');
});

app.listen(process.env['PORT'] ?? 3000);
