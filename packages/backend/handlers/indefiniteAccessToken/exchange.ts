import { type Application } from 'express';
import { type Auth } from 'firebase-admin/auth';
import { decodeUserInfo, isJWTClaims } from '../../lib/jwtclaims.js';

export function registerExchangeIndefiniteAccessToken(
	app: Application,
	auth: Auth,
	baseURL: string
): void {
	app.post('/indefiniteAccessToken/exchange', async (req, res) => {
		const claims = decodeUserInfo(req);

		if (!isJWTClaims(claims)) {
			res.status(401);
			throw new Error('JWT claim was malformed!');
		}

		const { sub } = claims;

		if (typeof req.query['key'] !== 'string') {
			res.status(400);
			throw new Error('Query key is malformed!');
		}

		const { key } = req.query;

		const customToken = await auth.createCustomToken(sub);
		res.send({
			batchIssueAudioRecordUploadDestinationEndpoint: `${baseURL}/audioRecord/batchIssueUploadDestination`,
			customToken,
			signInWithCustomTokenEndpoint: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${key}`,
			refreshTokenEndpoint: `https://securetoken.googleapis.com/v1/token?key=${key}`
		});
	});
}
