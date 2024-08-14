import { type Request } from 'express';
import { decodeBase64URL } from './jwt.js';

export function decodeUserInfo(req: Request): unknown {
	const payloadBase64 = req.get('X-Apigateway-Api-Userinfo');

	if (!payloadBase64) {
		return;
	}

	const payloadBytes = decodeBase64URL(payloadBase64);
	const payload = JSON.parse(payloadBytes.toString('utf-8'));

	return payload;
}

export interface JWTClaim {
	readonly sub: string;
}

export function isJWTClaims(payload: unknown): payload is JWTClaim {
	if (payload == null || typeof payload !== 'object') {
		return false;
	}

	if (!('sub' in payload) || typeof payload.sub !== 'string') {
		return false;
	}

	return true;
}
