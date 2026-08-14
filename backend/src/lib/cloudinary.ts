import { v2 as cloudinary } from "cloudinary";

console.log("Cloudinary config check:");
console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API KEY EXISTS:", !!process.env.CLOUDINARY_API_KEY);
console.log("API SECRET EXISTS:", !!process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;