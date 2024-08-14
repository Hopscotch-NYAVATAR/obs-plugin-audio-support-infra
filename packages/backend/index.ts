import express from 'express';
import cors from 'cors';

import { JWTHeader, JWTPayload, signJWT } from './jwt.js';

const app = express();

const origin = ['obs-plugin-voice-storage.firebaseapp.com', 'localhost'];

app.post(
	'/issueIndefiniteAccessToken',
	cors({
		origin,
		methods: ['POST'],
		allowedHeaders: ['Authorization']
	}),
	async (_, res) => {
		const header = {
			alg: 'ES256',
			typ: 'JWT'
		} satisfies JWTHeader;

		const payload = {} satisfies JWTPayload;

		const indefiniteAccessToken = await signJWT(header, payload);

		res.send(indefiniteAccessToken);
	}
);

app.post('/audioRecordingAccessToken', (_, res) => {
	res.send('{}');
});

app.listen(process.env['PORT'] ?? 3000);
