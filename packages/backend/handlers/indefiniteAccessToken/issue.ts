import { type Application } from 'express';
import cors from 'cors';

import { decodeUserInfo, isJWTClaims } from '../../lib/jwtclaims.js';
import { generateIndefiniteAccessToken } from '../../lib/indefiniteAccessToken.js';

export function registerIndefiniteAccessTokenIssue(
	app: Application,
	baseURL: string,
	origin: string[]
): void {
	app.options(
		'/indefiniteAccessToken/issue',
		cors({
			origin,
			methods: ['POST'],
			allowedHeaders: ['Authorization']
		})
	);

	app.post('/indefiniteAccessToken/issue', cors(), async (req, res) => {
		const claims = decodeUserInfo(req);

		if (!isJWTClaims(claims)) {
			res.status(401);
			throw new Error('JWT claim was malformed!');
		}

		const { sub } = claims;

		const indefiniteAccessToken = await generateIndefiniteAccessToken({ sub });

		res.send({
			indefiniteAccessToken,
			endpoints: {
				indefiniteAccessTokenExchange: `${baseURL}/indefiniteAccessToken/exchange`
			}
		});
	});
}
