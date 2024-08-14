import { type Application } from 'express';
import { type Auth } from 'firebase-admin/auth';
import { decodeUserInfo, isJWTClaims } from '../../lib/jwtclaims.js';

export function registerIndefiniteAccessTokenExchange(app: Application, auth: Auth): void {
	app.post('/indefiniteAccessToken/exchange', async (req, res) => {
		const claims = decodeUserInfo(req);

		if (!isJWTClaims(claims)) {
			res.status(401);
			throw new Error('JWT claim was malformed!');
		}

		const { sub } = claims;

		const customToken = await auth.createCustomToken(sub);
		res.send({
			customToken
		});
	});
}
