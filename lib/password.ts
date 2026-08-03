import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_OPTIONS = { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 };

function deriveKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeScrypt(
      password.normalize("NFKC"),
      salt,
      64,
      SCRYPT_OPTIONS,
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey as Buffer);
      },
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, expectedHex, ...extra] = storedHash.split(":");
  if (!salt || !expectedHex || extra.length > 0) return false;

  const expected = Buffer.from(expectedHex, "hex");
  if (expected.length !== 64) return false;

  const actual = await deriveKey(password, salt);
  return timingSafeEqual(actual, expected);
}
