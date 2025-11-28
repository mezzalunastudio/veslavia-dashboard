import apiClient from "@/utils/apiClient";

export interface PresignedUrlResponse {
  urls: { key: string; url: string }[];
}

// Get batch image URLs
export const fetchImageUrls = async (keys: string[]): Promise<Record<string, string>> => {
  try {
    const response = await apiClient.post<PresignedUrlResponse>("/images/batch-urls", { keys });
    
    const urlMap: Record<string, string> = {};
    response.data.urls.forEach(({ key, url }) => {
      urlMap[key] = url;
    });
    return urlMap;
  } catch (error) {
    console.error("Failed to fetch pre-signed URLs:", error);
    return {};
  }
};

// Upload image
export const uploadImage = async (category: string, pathname: string, file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await apiClient.post(`/images/${category}/${pathname}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data.key; // Return the stored key
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw new Error("Failed to upload image");
  }
};

// Delete image
export const deleteImage = async (imgname: string): Promise<void> => {
  try {
    // URL encode the image name since it may contain slashes
    const encodedImgname = encodeURIComponent(imgname);
    await apiClient.delete(`/images/${encodedImgname}`);
  } catch (error) {
    console.error("Failed to delete image:", error);
    throw new Error("Failed to delete image");
  }
};

// Upload audio
export const uploadAudio = async (category: string, pathname: string, file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await apiClient.post(`/audio/${category}/${pathname}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data.key; // Return the stored key
  } catch (error) {
    console.error("Failed to upload audio:", error);
    throw new Error("Failed to upload audio");
  }
};