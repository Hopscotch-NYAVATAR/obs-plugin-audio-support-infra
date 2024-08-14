import { createPublicKey } from 'node:crypto';

import express from 'express';
import { KeyManagementServiceClient } from '@google-cloud/kms'

import { readFromEnv } from './env.js';
import { calculateCRC32C } from './jwt.js';

const jwksVersionNames = readFromEnv('IAT_JWKS_KMS_VERSION_NAMES').split(' ');

interface JSONWebKeySetECKey {
	readonly kid: string;
	readonly kty: 'EC';
	readonly alg: 'ES256';
	readonly use: 'sig';
	readonly x: string;
	readonly y: string;
}

interface JSONWebKeySet {
	readonly keys: JSONWebKeySetECKey[];
}

export async function getJWKS(): Promise<JSONWebKeySet> {
	const client = new KeyManagementServiceClient();

	const keys: JSONWebKeySetECKey[][] = await Promise.all(
		jwksVersionNames.map(async (name) => {
			const [publicKey] = await client.getPublicKey({ name });

			if (publicKey.algorithm === 'EC_SIGN_P256_SHA256') {
				if (publicKey.name !== name) {
					throw new Error('GetPublicKey: request corrupted in-transit');
				}

				if (!publicKey.pem) {
					throw new Error('GetPublicKey: request corrupted in-transit');
				}

				if (calculateCRC32C(Buffer.from(publicKey.pem)) !== Number(publicKey.pemCrc32c?.value)) {
					throw new Error('GetPublicKey: request corrupted in-transit');
				}

				const jwk: JSONWebKeySetECKey = {
					...createPublicKey(publicKey.pem).export({ format: 'jwk' }),
					kid: name,
					alg: 'ES256',
					use: 'sig'
				} as JSONWebKeySetECKey;

				return [jwk];
			}

			return [];
		})
	);

	return { keys: keys.flat() };
}

const app = express();

app.get('/indefiniteAccessToken/jwks', async (_req, res) => {
	const jwks = await getJWKS();
	res.send(jwks);
});

app.listen(process.env['PORT'] ?? 3000);
