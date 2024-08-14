import { createHash } from 'node:crypto';

import { KeyManagementServiceClient } from '@google-cloud/kms';
import CRC32C from 'crc-32/crc32c.js';

export function calculateCRC32C(buffer: Buffer) {
	return CRC32C.buf(buffer) >>> 0;
}

export function derToJOSE(der: Buffer): Buffer {
	const jose = Buffer.alloc(64);

	if (der[0] !== 0x30) {
		throw new Error('DER signature is not sequence!');
	}

	if (der[2] !== 2) {
		throw new Error('First element of DER signature is not an integer!');
	}

	const rSize = der[3];
	if (rSize === 33) {
		der.copy(jose, 0, 5, 37);
	} else if (rSize === 32) {
		der.copy(jose, 0, 4, 36);
	} else {
		throw new Error('First integer of DER signature has invalid size!');
	}

	if (der[rSize + 4] !== 2) {
		throw new Error('Second element of DER signature is not an integer!');
	}

	const sSize = der[rSize + 5];
	if (sSize === 33) {
		der.copy(jose, 32, rSize + 7, rSize + 39);
	} else if (sSize === 32) {
		der.copy(jose, 32, rSize + 6, rSize + 38);
	} else {
		throw new Error('Second integer of DER signature has invalid size!');
	}

	return jose;
}

export function encodeBase64URL(buffer: Buffer) {
	return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=*$/, '');
}

export interface JWTHeader {
	readonly alg: 'ES256';
	readonly typ: 'JWT';
}

export interface JWTPayload {}

export async function signJWT(kmsVersionName: string, content: string): Promise<string> {
	const client = new KeyManagementServiceClient();

	const hash = createHash('sha256');
	hash.update(content);
	const digest = hash.digest();

	const digestCrc32c = calculateCRC32C(digest);

	const [response] = await client.asymmetricSign({
		name: kmsVersionName,
		digest: {
			sha256: digest
		},
		digestCrc32c: {
			value: digestCrc32c
		}
	});

	if (response.name !== JWT_KMS_VERSION_NAME) {
		throw new Error('AsymmetricSign: request corrupted in-transit!');
	}

	if (!response.verifiedDigestCrc32c) {
		throw new Error('AsymmetricSign: request corrupted in-transit!');
	}

	const { signature, signatureCrc32c } = response;
	if (!signature || !signatureCrc32c) {
		throw new Error('AsymmetricSign: request corrupted in-transit!');
	}

	const signatureBytes = Buffer.from(signature);

	if (calculateCRC32C(signatureBytes) !== Number(signatureCrc32c.value)) {
		throw new Error('AsymmetricSign: request corrupted in-transit!');
	}

	const jwtSignatureBytes = derToJOSE(Buffer.from(signature));

	return `${content}.${encodeBase64URL(jwtSignatureBytes)}`;
}
