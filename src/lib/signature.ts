import { Signature } from '../types';

/** Max length for drawn signature data URIs (~150KB). Must match firestore.rules. */
export const MAX_SIGNATURE_IMAGE_CHARS = 200_000;

const DATA_URI_PATTERN = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/;

export function isValidSignatureImageData(imageData: string): boolean {
  return (
    imageData.length > 22 &&
    imageData.length <= MAX_SIGNATURE_IMAGE_CHARS &&
    DATA_URI_PATTERN.test(imageData)
  );
}

export function assertValidSignature(sig: Signature): Signature {
  if (!sig.name?.trim() || sig.name.trim().length > 100) {
    throw new Error('Signature name is required.');
  }
  if (sig.type !== 'drawn' && sig.type !== 'typed') {
    throw new Error('Invalid signature type.');
  }
  if (sig.type === 'typed') {
    const { imageData: _omit, ...typed } = sig as Signature & { imageData?: string };
    return { ...typed, name: sig.name.trim(), type: 'typed' };
  }
  if (!sig.imageData || !isValidSignatureImageData(sig.imageData)) {
    throw new Error('Drawn signatures must be a PNG or JPEG data URI under 150KB.');
  }
  return {
    name: sig.name.trim(),
    signedAt: sig.signedAt,
    type: 'drawn',
    imageData: sig.imageData,
  };
}
