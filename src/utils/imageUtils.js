/**
 * Resize and compress an image File to a base64 JPEG data URL.
 * @param {File} file - The image file to process
 * @param {number} maxWidth - Maximum width in pixels (default 400)
 * @param {number} maxHeight - Maximum height in pixels (default 400)
 * @param {number} quality - JPEG quality 0-1 (default 0.7)
 * @returns {Promise<string>} base64 data URL
 */
export function resizeAndCompressImage(file, maxWidth = 400, maxHeight = 400, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve(resizeImageElement(img, maxWidth, maxHeight, quality));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Resize an already-loaded base64 image string.
 */
export function resizeBase64Image(base64Str, maxWidth = 400, maxHeight = 400, quality = 0.7) {
  if (!base64Str) return Promise.resolve('');
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Skip if already small enough
      if (img.width <= maxWidth && img.height <= maxHeight) {
        resolve(base64Str);
        return;
      }
      resolve(resizeImageElement(img, maxWidth, maxHeight, quality));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64Str;
  });
}

function resizeImageElement(img, maxWidth, maxHeight, quality) {
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > maxWidth) {
      height = Math.round(height * maxWidth / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round(width * maxHeight / height);
      height = maxHeight;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Compute SHA-256 hash of a File (for duplicate import detection).
 */
export async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
