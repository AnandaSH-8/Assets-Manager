// AES-GCM encryption helpers for monetary values stored at rest.
// Format: "enc:v1:<base64-iv>:<base64-ciphertext>"
// Backward compatible: legacy plaintext numeric strings decrypt as-is.

const ENC_PREFIX = 'enc:v1:';

let cachedKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const raw = Deno.env.get('AMOUNT_ENCRYPTION_KEY') ?? '';
  if (!raw) {
    throw new Error('AMOUNT_ENCRYPTION_KEY is not configured');
  }
  // Derive a stable 256-bit key from any input via SHA-256.
  const keyMaterial = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(raw),
  );
  cachedKey = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  );
  return cachedKey;
}

function toB64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Encrypt a number → ciphertext string for DB storage. */
export async function encryptNumber(value: number): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(String(value));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext),
  );
  return `${ENC_PREFIX}${toB64(iv)}:${toB64(ct)}`;
}

/**
 * Decrypt a stored value back to a number.
 * - Recognises the `enc:v1:` prefix and decrypts.
 * - Falls back to parsing legacy plaintext numeric strings (or numbers).
 */
export async function decryptNumber(
  stored: string | number | null | undefined,
): Promise<number> {
  if (stored === null || stored === undefined || stored === '') return 0;
  if (typeof stored === 'number') return stored;
  if (!stored.startsWith(ENC_PREFIX)) {
    const n = Number(stored);
    return Number.isFinite(n) ? n : 0;
  }
  const [, , ivB64, ctB64] = stored.split(':');
  if (!ivB64 || !ctB64) return 0;
  try {
    const key = await getKey();
    const iv = fromB64(ivB64);
    const ct = fromB64(ctB64);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    const n = Number(new TextDecoder().decode(pt));
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** Convenience: decrypt all monetary fields on a record in place. */
export async function decryptRecord<T extends Record<string, any>>(
  row: T,
): Promise<T> {
  const fields: (keyof T)[] = ['amount', 'cash', 'investment', 'current_value'] as any;
  for (const f of fields) {
    if (f in row) {
      (row as any)[f] = await decryptNumber(row[f]);
    }
  }
  return row;
}
