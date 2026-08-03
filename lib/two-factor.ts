import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { managedNonce } from "@noble/ciphers/utils.js";
import { generateURI, ScureBase32Plugin, verify } from "otplib";

const base32 = new ScureBase32Plugin();

function getEncryptionKey() {
  const secret = process.env.AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required");
  return createHash("sha256").update(secret).digest();
}

export function encryptTwoFactorValue(value: string) {
  const encrypted = managedNonce(xchacha20poly1305)(getEncryptionKey()).encrypt(
    new TextEncoder().encode(value),
  );
  return `$ba$1$${Buffer.from(encrypted).toString("hex")}`;
}

export function decryptTwoFactorValue(value: string) {
  const envelope = /^\$ba\$\d+\$(.+)$/.exec(value);
  const ciphertext = Buffer.from(envelope?.[1] ?? value, "hex");
  const decrypted = managedNonce(xchacha20poly1305)(getEncryptionKey()).decrypt(
    ciphertext,
  );
  return new TextDecoder().decode(decrypted);
}

export function createTwoFactorSetup(email: string) {
  // Store raw UTF-8 secret text, matching Better Auth's historical format.
  const secret = randomBytes(24).toString("base64url");
  const backupCodes = Array.from({ length: 10 }, () => {
    const code = randomBytes(8).toString("base64url").slice(0, 10);
    return `${code.slice(0, 5)}-${code.slice(5)}`;
  });

  return {
    secret,
    backupCodes,
    totpURI: generateURI({
      issuer: "Jordan Weather",
      label: email,
      secret: base32.encode(new TextEncoder().encode(secret)),
    }),
  };
}

export async function verifyTotp(secret: string, token: string) {
  const result = await verify({
    secret: new TextEncoder().encode(secret),
    token: token.replace(/\s/g, ""),
    epochTolerance: 30,
  });
  return result.valid;
}

export function consumeBackupCode(encryptedCodes: string, submitted: string) {
  const codes = JSON.parse(decryptTwoFactorValue(encryptedCodes)) as string[];
  const normalized = submitted.trim();
  const matchIndex = codes.findIndex((code) => {
    const left = Buffer.from(code);
    const right = Buffer.from(normalized);
    return left.length === right.length && timingSafeEqual(left, right);
  });

  if (matchIndex < 0) return null;
  return codes.filter((_, index) => index !== matchIndex);
}
