/**
 * File upload validation and security
 * Validates file types, sizes, and content for secure uploads
 */

export interface FileValidationResult {
  valid: boolean
  error?: string
  fileType?: 'image' | 'pdf' | 'gif'
  mimeType?: string
}

// Allowed file types and their MIME types
const ALLOWED_TYPES = {
  image: {
    mimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  pdf: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  gif: {
    mimes: ['image/gif'],
    extensions: ['.gif'],
    maxSize: 10 * 1024 * 1024, // 10MB for animated GIFs
  },
}

/**
 * Validate file type and size
 */
export function validateFile(file: File, allowedTypes: ('image' | 'pdf' | 'gif')[] = ['image']): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  // Check file size
  const maxSize = Math.max(...allowedTypes.map(type => ALLOWED_TYPES[type].maxSize))
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` }
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' }
  }

  // Check MIME type
  const mimeType = file.type.toLowerCase()
  let detectedType: 'image' | 'pdf' | 'gif' | undefined

  for (const type of allowedTypes) {
    if (ALLOWED_TYPES[type].mimes.includes(mimeType)) {
      detectedType = type
      break
    }
  }

  if (!detectedType) {
    return { valid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` }
  }

  // Check file extension matches MIME type
  const fileName = file.name.toLowerCase()
  const extension = fileName.substring(fileName.lastIndexOf('.'))
  const allowedExtensions = ALLOWED_TYPES[detectedType].extensions

  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: 'File extension does not match file type' }
  }

  // Additional size check for specific type
  if (file.size > ALLOWED_TYPES[detectedType].maxSize) {
    const maxSizeMB = (ALLOWED_TYPES[detectedType].maxSize / (1024 * 1024)).toFixed(0)
    return { valid: false, error: `${detectedType.toUpperCase()} file size exceeds ${maxSizeMB}MB limit` }
  }

  return {
    valid: true,
    fileType: detectedType,
    mimeType,
  }
}

/**
 * Validate image dimensions (for images only)
 */
export function validateImageDimensions(
  file: File,
  maxWidth: number = 4096,
  maxHeight: number = 4096
): Promise<{ valid: boolean; error?: string; width?: number; height?: number }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve({ valid: true }) // Not an image, skip dimension check
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({
          valid: false,
          error: `Image dimensions exceed ${maxWidth}x${maxHeight}px limit`,
          width: img.width,
          height: img.height,
        })
      } else {
        resolve({ valid: true, width: img.width, height: img.height })
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ valid: false, error: 'Invalid image file' })
    }

    img.src = url
  })
}

/**
 * Generate secure filename
 */
export function generateSecureFilename(originalName: string, prefix: string = 'file'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = originalName.substring(originalName.lastIndexOf('.'))
  // Remove any path components and sanitize
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50)
  return `${prefix}_${timestamp}_${random}_${safeName}${extension}`
}

/**
 * Check if file is potentially malicious based on content
 */
export async function checkFileContent(file: File): Promise<{ safe: boolean; error?: string }> {
  // Read first few bytes to check magic numbers
  const buffer = await file.slice(0, 4).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // Check for common file signatures
  const signatures: { [key: string]: number[] } = {
    jpeg: [0xff, 0xd8, 0xff],
    png: [0x89, 0x50, 0x4e, 0x47],
    gif: [0x47, 0x49, 0x46, 0x38],
    pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  }

  let detectedType: string | null = null

  for (const [type, signature] of Object.entries(signatures)) {
    let matches = true
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) {
        matches = false
        break
      }
    }
    if (matches) {
      detectedType = type
      break
    }
  }

  // Verify MIME type matches detected signature
  if (detectedType) {
    const expectedMimes: { [key: string]: string[] } = {
      jpeg: ['image/jpeg', 'image/jpg'],
      png: ['image/png'],
      gif: ['image/gif'],
      pdf: ['application/pdf'],
    }

    const expected = expectedMimes[detectedType]
    if (expected && !expected.includes(file.type.toLowerCase())) {
      return { safe: false, error: 'File content does not match declared type' }
    }
  } else {
    // If we can't detect a signature, be cautious
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      return { safe: false, error: 'Cannot verify file content' }
    }
  }

  return { safe: true }
}
