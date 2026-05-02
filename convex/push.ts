import { v } from "convex/values";
import { mutation, query, action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Save a push subscription from the browser
export const saveSubscription = mutation({
  args: {
    userId: v.optional(v.id("users")),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  },
  handler: async (ctx, args) => {
    // Upsert — if endpoint already exists, update it
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        userId: args.userId,
        p256dh: args.p256dh,
        auth: args.auth,
      });
      return existing._id;
    }

    return await ctx.db.insert("pushSubscriptions", {
      userId: args.userId,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      createdAt: Date.now(),
    });
  },
});

// Remove a push subscription (when user unsubscribes)
export const removeSubscription = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();
    if (existing) await ctx.db.delete(existing._id);
    return { success: true };
  },
});

// Internal query to get all subscriptions for sending
export const getAllSubscriptions = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("pushSubscriptions").collect();
  },
});

// Internal query to remove a bad subscription
export const removeSubscriptionByEndpoint = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

// Action to send push notifications to all subscribers
export const sendPushToAll = action({
  args: {
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.runQuery(internal.push.getAllSubscriptions);

    if (!subscriptions.length) return { sent: 0, failed: 0 };

    const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY!;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@campusconnect.app";

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("VAPID keys not configured");
      return { sent: 0, failed: 0 };
    }

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      icon: args.icon || "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      url: args.url || "/dashboard",
      timestamp: Date.now(),
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        // Use fetch to call web-push compatible endpoint
        // We'll use the VAPID JWT approach via fetch directly
        const pushResult = await sendWebPush({
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth: sub.auth,
          payload,
          vapidPublicKey,
          vapidPrivateKey,
          vapidSubject,
        });

        if (pushResult) {
          sent++;
        } else {
          failed++;
          // Remove invalid subscription
          await ctx.runMutation(internal.push.removeSubscriptionByEndpoint as any, {
            endpoint: sub.endpoint,
          });
        }
      } catch (err) {
        console.error("Push failed for", sub.endpoint, err);
        failed++;
      }
    }

    console.log(`Push sent: ${sent}, failed: ${failed}`);
    return { sent, failed };
  },
});

// Helper: send a single web push using fetch + VAPID
async function sendWebPush({
  endpoint,
  p256dh,
  auth,
  payload,
  vapidPublicKey,
  vapidPrivateKey,
  vapidSubject,
}: {
  endpoint: string;
  p256dh: string;
  auth: string;
  payload: string;
  vapidPublicKey: string;
  vapidPrivateKey: string;
  vapidSubject: string;
}): Promise<boolean> {
  try {
    // Build VAPID JWT header
    const url = new URL(endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12 hours

    const vapidHeader = await buildVapidHeader(
      audience,
      expiration,
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    // Encrypt payload using Web Push encryption
    const encrypted = await encryptPayload(payload, p256dh, auth);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": vapidHeader,
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "TTL": "86400",
        "Content-Length": encrypted.byteLength.toString(),
      },
      body: encrypted,
    });

    if (response.status === 410 || response.status === 404) {
      // Subscription expired/invalid
      return false;
    }

    return response.ok || response.status === 201;
  } catch {
    return false;
  }
}

// Build VAPID Authorization header
async function buildVapidHeader(
  audience: string,
  expiration: number,
  subject: string,
  publicKey: string,
  privateKey: string
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const payload = { aud: audience, exp: expiration, sub: subject };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const unsignedToken = `${encode(header)}.${encode(payload)}`;

  // Import private key
  const keyData = base64UrlToUint8Array(privateKey);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = uint8ArrayToBase64Url(new Uint8Array(signature));
  const jwt = `${unsignedToken}.${signatureB64}`;

  return `vapid t=${jwt}, k=${publicKey}`;
}

// Encrypt payload using Web Push (RFC 8291 / aes128gcm)
async function encryptPayload(
  payload: string,
  p256dhBase64: string,
  authBase64: string
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(payload);

  // Decode subscription keys
  const p256dh = base64UrlToUint8Array(p256dhBase64);
  const authSecret = base64UrlToUint8Array(authBase64);

  // Generate ephemeral ECDH key pair
  const ephemeralKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );

  // Import receiver's public key
  const receiverPublicKey = await crypto.subtle.importKey(
    "raw",
    p256dh,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: receiverPublicKey },
    ephemeralKeyPair.privateKey,
    256
  );

  // Export ephemeral public key
  const ephemeralPublicKeyRaw = await crypto.subtle.exportKey("raw", ephemeralKeyPair.publicKey);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF to derive content encryption key and nonce
  const prk = await hkdf(
    new Uint8Array(sharedSecret),
    authSecret,
    concat(encoder.encode("WebPush: info\0"), p256dh, new Uint8Array(ephemeralPublicKeyRaw)),
    32
  );

  const cek = await hkdf(prk, salt, encoder.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(prk, salt, encoder.encode("Content-Encoding: nonce\0"), 12);

  // Import CEK
  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);

  // Encrypt with padding
  const paddedPlaintext = new Uint8Array(plaintext.length + 1);
  paddedPlaintext.set(plaintext);
  paddedPlaintext[plaintext.length] = 2; // delimiter

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    paddedPlaintext
  );

  // Build aes128gcm content (RFC 8188)
  const recordSize = 4096;
  const header = new Uint8Array(21 + ephemeralPublicKeyRaw.byteLength);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, recordSize, false);
  header[20] = ephemeralPublicKeyRaw.byteLength;
  header.set(new Uint8Array(ephemeralPublicKeyRaw), 21);

  return concat(header, new Uint8Array(ciphertext)).buffer;
}

async function hkdf(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info },
    key,
    length * 8
  );
  return new Uint8Array(bits);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function base64UrlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
  const binary = atob(padded);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
