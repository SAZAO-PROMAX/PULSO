export const documentDigest=(bytes:ArrayBuffer)=>crypto.subtle.digest('SHA-256',bytes);
