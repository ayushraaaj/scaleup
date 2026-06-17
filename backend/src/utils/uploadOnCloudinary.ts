import cloudinary from "../config/cloudinary";

export const uploadOnCloudinary = async (filePath: string) => {
  return await cloudinary.uploader.upload(filePath, {
    resource_type: "auto",
    folder: "scaleup",
  });
};
