export const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'hlzggzyr';
export const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'bluex_ocr_docs';

/**
 * Uploads an image (Base64 data string or File URI) to Cloudinary using unsigned upload preset.
 * Returns the secure Cloudinary image URL.
 */
export async function uploadToCloudinary(fileInput: string): Promise<string> {
  const formData = new FormData();

  if (fileInput.startsWith('data:image') || fileInput.startsWith('http')) {
    // Base64 Data URI string - safely sent as form field, avoids unsupported FormDataPart errors in RN
    formData.append('file', fileInput);
  } else {
    // File URI fallback
    const filename = fileInput.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: fileInput,
      name: filename,
      type,
    } as any);
  }

  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  const data = await response.json();

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Failed to upload image to Cloudinary');
  }

  return data.secure_url;
}
