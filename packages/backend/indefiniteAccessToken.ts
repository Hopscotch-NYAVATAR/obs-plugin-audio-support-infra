import { createPublicKey } from 'node:crypto';

import { KeyManagementServiceClient } from '@google-cloud/kms';

import { readFromEnv } from './env.js';
import { calculateCRC32C, encodeBase64URL, signJWT } from './jwt.js';

const IAT_ISSUER_URL = readFromEnv('IAT_ISSUER_URL');
const IAT_SIGNING_KMS_VERSION_NAME = readFromEnv('IAT_SIGNING_KMS_VERSION_NAME');
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

interface GenerateIndefiniteAccessTokenParams {
	readonly uid: string;
}

interface JWTHeader {
	readonly alg: 'ES256';
	readonly kid: string;
	readonly typ: 'JWT';
}

interface JWTPayload {
	readonly iss: string;
	readonly aud: string;
	readonly sub: string;
	readonly iat: number;
	readonly exp?: number;
}

export function generateIndefiniteAccessToken(
	{ uid }: GenerateIndefiniteAccessTokenParams,
	iat = (Date.now() / 1000) | 0
): Promise<string> {
	const header: JWTHeader = {
		alg: 'ES256',
		kid: IAT_SIGNING_KMS_VERSION_NAME,
		typ: 'JWT'
	};

	const payload: JWTPayload = {
		iss: IAT_ISSUER_URL,
		aud: 'indefiniteAccessToken',
		sub: uid,
		iat
	};

	const headerBytes = Buffer.from(JSON.stringify(header));
	const payloadBytes = Buffer.from(JSON.stringify(payload));
	const content = `${encodeBase64URL(headerBytes)}.${encodeBase64URL(payloadBytes)}`;
	return signJWT(IAT_SIGNING_KMS_VERSION_NAME, content);
}
