/**
 * File upload validation using magic numbers (file signatures).
 * Validates file type by inspecting actual bytes, not trusting client-provided MIME type.
 * 
 * Allowed types: PDF, JPEG, PNG, GIF, WebP
 * Max file size: 10MB
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileSignature {
  mimeType: string;
  extensions: string[];
  magic: number[];
  offset?: number;
}

const FILE_SIGNATURES: FileSignature[] = [
  { mimeType: "application/pdf", extensions: [".pdf"], magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mimeType: "image/jpeg", extensions: [".jpg", ".jpeg"], magic: [0xFF, 0xD8, 0xFF] },
  { mimeType: "image/png", extensions: [".png"], magic: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  { mimeType: "image/gif", extensions: [".gif"], magic: [0x47, 0x49, 0x46, 0x38] }, // GIF8
  { mimeType: "image/webp", extensions: [".webp"], magic: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF...WEBP (partial check)
];

const ALLOWED_MIME_TYPES = new Set(FILE_SIGNATURES.map((s) => s.mimeType));

export interface FileValidationResult {
  valid: boolean;
  detectedMimeType?: string;
  error?: string;
}

/**
 * Validate a file buffer by checking magic bytes and size.
 * Returns the detected MIME type if valid, or an error message.
 */
export function validateFileBuffer(buffer: Buffer, claimedContentType?: string): FileValidationResult {
  // Size check
  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Maximum allowed: 10MB.`,
    };
  }

  if (buffer.length < 4) {
    return { valid: false, error: "File is too small to be valid." };
  }

  // Magic number detection
  for (const sig of FILE_SIGNATURES) {
    const offset = sig.offset ?? 0;
    let matches = true;
    for (let i = 0; i < sig.magic.length; i++) {
      if (buffer[offset + i] !== sig.magic[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      // Special check for WebP: bytes 8-11 should be "WEBP"
      if (sig.mimeType === "image/webp") {
        if (
          buffer.length > 11 &&
          buffer[8] === 0x57 && // W
          buffer[9] === 0x45 && // E
          buffer[10] === 0x42 && // B
          buffer[11] === 0x50 // P
        ) {
          return { valid: true, detectedMimeType: sig.mimeType };
        }
        continue; // RIFF but not WEBP
      }
      return { valid: true, detectedMimeType: sig.mimeType };
    }
  }

  return {
    valid: false,
    error: `Unsupported file type. Allowed: PDF, JPEG, PNG, GIF, WebP. ${
      claimedContentType ? `(Claimed: ${claimedContentType})` : ""
    }`,
  };
}

/**
 * Validate and get the correct content type for a base64-encoded file.
 * Use this in upload routes to replace trusting the client-provided contentType.
 */
export function validateBase64File(
  base64Data: string,
  claimedContentType?: string
): FileValidationResult & { buffer?: Buffer } {
  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64Data, "base64");
  } catch {
    return { valid: false, error: "Invalid base64 data." };
  }

  const result = validateFileBuffer(buffer, claimedContentType);
  if (result.valid) {
    return { ...result, buffer };
  }
  return result;
}

/**
 * Check if a claimed MIME type is in our allowed list.
 * Use as a quick pre-check before more expensive magic byte validation.
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}
