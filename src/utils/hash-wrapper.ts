import { blake3 } from "hash-wasm";

type Hashable = Parameters<typeof blake3>[0];

// A Thin Wrapper around the blake3 hashing function
export function calculateHash(s: Hashable): Promise<string> {
  return blake3(s, 128);
}

export async function checkContent(
  content: string,
  hash: string | undefined | null,
): Promise<boolean> {
  if (!hash) {
    return false;
  }
  const calculatedHash = await calculateHash(content);
  return calculatedHash === hash;
}
