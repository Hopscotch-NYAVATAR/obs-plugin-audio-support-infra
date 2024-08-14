import { createHash } from "node:crypto";

import { KeyManagementServiceClient } from "@google-cloud/kms";
import crc32c from "fast-crc32c";

import { readFromEnv } from "./env.js";

const JWT_KMS_VERSION_NAME = readFromEnv("JWT_KMS_VERSION_NAME");

export function derToJOSE(der: Buffer): Buffer {
  const jose = Buffer.alloc(64);

  if (der[0] !== 0x30) {
    throw new Error("DER signature is not sequence!");
  }

  if (der[2] !== 2) {
    throw new Error("First element of DER signature is not an integer!");
  }

  const rSize = der[3];
  if (rSize === 33) {
    der.copy(jose, 0, 5, 37);
  } else if (rSize === 32) {
    der.copy(jose, 0, 4, 36);
  } else {
    throw new Error("First integer of DER signature has invalid size!")
  }

  if (der[rSize + 4] !== 2) {
    throw new Error("Second element of DER signature is not an integer!");
  }

  const sSize = der[rSize + 5]
  if (sSize === 33) {
    der.copy(jose, 32, rSize + 7, rSize + 39);
  } else if (sSize === 32) {
    der.copy(jose, 32, rSize + 6, rSize + 38);
  } else {
    throw new Error("Second integer of DER signature has invalid size!")
  }

  return jose;
}

export function encodeBase64URL(buffer: Buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=*$/, "");
}

export interface JWTHeader {
  readonly alg: "ES256"
  readonly typ: "JWT"
}

export interface JWTPayload {
}

export async function signJWT(header: JWTHeader, payload: JWTPayload): string {
  const client = new KeyManagementServiceClient();

  const headerBytes = Buffer.from(JSON.stringify(header));
  const payloadBytes = Buffer.from(JSON.stringify(payload));
  const content = `${encodeBase64URL(headerBytes)}.${encodeBase64URL(payloadBytes)}`

  const hash = createHash("sha256");
  hash.update(content);
  const digest = hash.digest();

  const digestCrc32c = crc32c.calculate(digest);

  const [response] = await client.asymmetricSign({
    name: JWT_KMS_VERSION_NAME,
    digest: {
      sha256: digest
    },
    digestCrc32c: {
      value: digestCrc32c
    }
  })

  if (response.name !== JWT_KMS_VERSION_NAME) {
    throw new Error("AsymmetricSign: request corrupted in-transit!");
  }

  if (!response.verifiedDigestCrc32c) {
    throw new Error("AsymmetricSign: request corrupted in-transit!");
  }

  const { signature, signatureCrc32c } = response;
  if (!signature || !signatureCrc32c) {
    throw new Error("AsymmetricSign: request corrupted in-transit!");
  }

  const signatureBytes = Buffer.from(signature)

  if (crc32c.calculate(signatureBytes) !== Number(signatureCrc32c)) {
    throw new Error("AsymmetricSign: request corrupted in-transit!");
  }

  const jwtSignatureBytes = derToJOSE(Buffer.from(signature));

  return `${content}.${encodeBase64URL(jwtSignatureBytes)}`;
}
