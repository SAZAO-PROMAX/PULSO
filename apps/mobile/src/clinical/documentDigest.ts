import {digest,CryptoDigestAlgorithm} from 'expo-crypto';
export const documentDigest=(bytes:ArrayBuffer)=>digest(CryptoDigestAlgorithm.SHA256,new Uint8Array(bytes));
