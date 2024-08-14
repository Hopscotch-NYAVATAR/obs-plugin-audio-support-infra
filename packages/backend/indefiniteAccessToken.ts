import { readFromEnv } from './env.js';
import { encodeBase64URL, signJWT } from './jwt.js';

const IAT_ISSUER_URL = readFromEnv('IAT_ISSUER_URL');
const IAT_SIGNING_KMS_VERSION_NAME = readFromEnv('IAT_SIGNING_KMS_VERSION_NAME');

interface GenerateIndefiniteAccessTokenParams {
	readonly sub: string;
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
	{ sub }: GenerateIndefiniteAccessTokenParams,
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
		sub,
		iat
	};

	const headerBytes = Buffer.from(JSON.stringify(header));
	const payloadBytes = Buffer.from(JSON.stringify(payload));
	const content = `${encodeBase64URL(headerBytes)}.${encodeBase64URL(payloadBytes)}`;
	return signJWT(IAT_SIGNING_KMS_VERSION_NAME, content);
}
