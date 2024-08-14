import express from 'express';
import cors from 'cors';

import { JWTHeader, JWTPayload, signJWT } from './jwt.js';
import { readFromEnv } from './env.js';
import { getJWKS } from './indefiniteAccessToken.js';

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
	const header = {
		alg: 'ES256',
		typ: 'JWT'
	} satisfies JWTHeader;

	const payload = {} satisfies JWTPayload;

	const indefiniteAccessToken = await signJWT(header, payload);

	res.send(indefiniteAccessToken);
});

app.post('/audioRecordingAccessToken', (_, res) => {
	res.send('{}');
});

app.listen(process.env['PORT'] ?? 3000);
