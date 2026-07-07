import "server-only"

import {
  createPublicKey,
  verify as edVerify,
  type KeyObject,
} from "node:crypto"

const HEADER = "v4.public."

/** LE64 from the PAE specification: length in 8 little-endian bytes. */
function le64(n: number): Buffer {
  const b = Buffer.alloc(8)
  b.writeBigUInt64LE(BigInt(n))
  return b
}

function pae(pieces: Buffer[]): Buffer {
  const out: Buffer[] = [le64(pieces.length)]
  for (const p of pieces) out.push(le64(p.length), p)
  return Buffer.concat(out)
}

const DER_PREFIX = Buffer.from("302a300506032b6570032100", "hex")

let cached: KeyObject | null | undefined

function publicKey(): KeyObject | null {
  if (cached !== undefined) return cached
  const hex = process.env.PASETO_PUBLIC_KEY
  console.log({ hex })
  if (!hex || hex.length !== 64) {
    cached = null // no key ⇒ the DAL will fall back to /me
    return null
  }
  cached = createPublicKey({
    key: Buffer.concat([DER_PREFIX, Buffer.from(hex, "hex")]),
    format: "der",
    type: "spki",
  })
  return cached
}

export function isLocalVerifyAvailable(): boolean {
  return publicKey() !== null
}

export interface PasetoClaims {
  sub: string
  exp: string
}

/** Clock tolerance: The web container and the auth-service do not
 *  necessarily share a perfectly synchronized clock. 60 s accommodates the
 *  drift without compromising anything useful. */
const CLOCK_SKEW_MS = 60_000

export function verifyAccessToken(token: string): PasetoClaims | null {
  const key = publicKey()
  console.log({ key })
  if (!key) return null

  if (!token.startsWith(HEADER)) return null

  let decoded: Buffer
  try {
    decoded = Buffer.from(token.slice(HEADER.length), "base64url")
  } catch {
    return null
  }
  if (decoded.length <= 64) return null

  const message = decoded.subarray(0, decoded.length - 64)
  const sig = decoded.subarray(decoded.length - 64)

  /**
   * NON-NEGOTIABLE ORDER: sign FIRST, parse LATER.
   * Until the signature is verified, these bytes are HOSTILE — they aren't even passed to JSON.parse. Footer
   * and implicit assertion are empty: your auth-service doesn't send them.
   */
  const preAuth = pae([
    Buffer.from(HEADER),
    message,
    Buffer.alloc(0),
    Buffer.alloc(0),
  ])
  if (!edVerify(null, preAuth, key, sig)) return null

  let claims: unknown
  try {
    claims = JSON.parse(message.toString("utf-8"))
  } catch {
    return null
  }
  console.log({claims})

  const c = claims as Partial<PasetoClaims>
  if (
    typeof c.sub !== "string" ||
    typeof c.exp !== "string"
  ) {
    return null
  }

  const exp = Date.parse(c.exp)
  if (Number.isNaN(exp) || exp + CLOCK_SKEW_MS < Date.now()) return null

  return { sub: c.sub, exp: c.exp }
}
