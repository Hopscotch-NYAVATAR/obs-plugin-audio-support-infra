import { type Application } from 'express';
import { decodeUserInfo, isJWTClaims } from '../../lib/jwtclaims.js';
import { Storage } from '@google-cloud/storage';

export function registerBatchIssueAudioRecordUploadDestination(
	app: Application,
	storage: Storage,
	audioRecordBucketName: string
): void {
	app.post('/audioRecord/batchIssueUploadDestination', async (req, res) => {
		const claims = decodeUserInfo(req);

		if (!isJWTClaims(claims)) {
			res.status(401);
			throw new Error('JWT claim is malformed!');
		}

		const { sub } = claims;

		if (typeof req.query['start'] !== 'string') {
			res.status(400);
			throw new Error('Query start is malformed!');
		}

		const start = parseInt(req.query['start'], 10);

		if (start < 0 || start >= 990000) {
			res.status(400);
			throw new Error('Query start is out of range!');
		}

		if (typeof req.query['count'] !== 'string') {
			res.status(400);
			throw new Error('Query count is malformed!');
		}

		const count = parseInt(req.query['count'], 10);

		if (count < 0 || count > 50) {
			res.status(400);
			throw new Error('Query count is out of range!');
		}

		if (typeof req.query['prefix'] !== 'string') {
			res.status(400);
			throw new Error('Query prefix is malformed!');
		}

		const { prefix } = req.query;

		if (!/^[-_a-zA-Z0-9]+$/.test(prefix)) {
			res.status(400);
			throw new Error('Query prefix contains invalid character!');
		}

		if (typeof req.query['ext'] !== 'string') {
			res.status(400);
			throw new Error('Query ext is malforded!');
		}

		const { ext } = req.query;

		const destinations = [];
		for (let i = 0; i < count; i++) {
			const paddedIndex = (i + start).toString(10).padStart(6, '0');
			const bucket = storage.bucket(audioRecordBucketName);
			const file = bucket.file(`${sub}/${prefix} ${paddedIndex}.${ext}`);
			const [url] = await file.getSignedUrl({
				version: 'v4',
				action: 'write',
				expires: Date.now() + 60 * 60 * 1000
			});
			destinations.push(url);
		}

		res.send({
			destinations
		});
	});
}
