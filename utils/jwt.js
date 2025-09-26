import { createHmac, timingSafeEqual } from "crypto";

function base64url(input) {
  const str = Buffer.from(input).toString("base64");
  return str.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlJSON(obj) {
  return base64url(JSON.stringify(obj));
}

export function signJWT(payload, secret, expiresInSeconds = 7 * 24 * 60 * 60) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };

  const encodedHeader = base64urlJSON(header);
  const encodedPayload = base64urlJSON(body);
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(data).digest("base64");
  const encodedSignature = signature.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${data}.${encodedSignature}`;
}

export function verifyJWT(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token structure");
  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expected = createHmac("sha256", secret).update(data).digest("base64");
  const expectedUrl = expected.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const a = Buffer.from(signature);
  const b = Buffer.from(expectedUrl);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid signature");
  }

  const payloadStr = Buffer.from(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  const payload = JSON.parse(payloadStr);

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) throw new Error("Token expired");
  return payload;
}
