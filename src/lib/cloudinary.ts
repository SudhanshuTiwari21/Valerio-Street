import { v2 as cloudinary } from "cloudinary";

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 8 * 1024 * 1024;

export function validateImage(file: { type: string; size: number }) {
  if (!ALLOWED.includes(file.type)) throw new Error("Unsupported image type");
  if (file.size > MAX_BYTES) throw new Error("Image too large (max 8 MB)");
}

export async function uploadDataUri(dataUri: string, folder = "valerio") {
  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return { url: res.secure_url, publicId: res.public_id };
}
