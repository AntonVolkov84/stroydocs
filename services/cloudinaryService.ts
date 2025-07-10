import axios from "axios";
const apiUrl: string = import.meta.env.VITE_API_URL;
export const uploadImageToCloudinary = async (imageFile: File): Promise<{ url: string; publicId: string } | null> => {
  const data = new FormData();
  data.append("file", imageFile);
  data.append("upload_preset", "A startling message");

  try {
    const response = await fetch("https://api.cloudinary.com/v1_1/dzzkzubs0/image/upload", {
      method: "POST",
      body: data,
    });

    const result = await response.json();

    if (response.ok) {
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } else {
      console.error("Cloudinary upload error:", result);
      return null;
    }
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
};
export const delFromStorage = async (publicId: string) => {
  try {
    const response = await axios.delete(`${apiUrl}/delete-image`, {
      params: { publicId },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при удалении файла из хранилища:", error);
    return { message: "Ошибка при удалении файла из хранилища" };
  }
};
