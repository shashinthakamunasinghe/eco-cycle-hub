import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  FirebaseStorage,
} from "firebase/storage";
import { storage } from "@/lib/firebase";

// Helper function to ensure we have a valid Storage instance
function getStorage(): FirebaseStorage {
  if (!storage) {
    throw new Error(
      "Firebase Storage is not initialized. Check your Firebase configuration."
    );
  }
  return storage;
}

export class FirebaseStorageService {
  // Upload file to Firebase Storage
  static async uploadFile(
    file: File,
    path: string,
    fileName?: string
  ): Promise<string> {
    try {
      if (!storage) {
        throw new Error("Firebase storage is not initialized");
      }
      const finalFileName = fileName || `${Date.now()}_${file.name}`;
      const storageRef = ref(getStorage(), `${path}/${finalFileName}`);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    }
  }

  // Upload product image
  static async uploadProductImage(
    file: File,
    productId: string
  ): Promise<string> {
    return this.uploadFile(
      file,
      `products/${productId}`,
      `${productId}_${Date.now()}`
    );
  }

  // Upload user avatar
  static async uploadUserAvatar(file: File, userId: string): Promise<string> {
    return this.uploadFile(file, `avatars/${userId}`, `avatar_${Date.now()}`);
  }

  // Upload pickup request image
  static async uploadPickupImage(
    file: File,
    requestId: string
  ): Promise<string> {
    return this.uploadFile(
      file,
      `pickups/${requestId}`,
      `pickup_${Date.now()}`
    );
  }

  // Delete file from Firebase Storage
  static async deleteFile(url: string): Promise<void> {
    try {

      if (!storage) {
        throw new Error("Firebase storage is not initialized");
      }
      const storageRef = ref(storage, url);

      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error("Failed to delete file");
    }
  }

  // Get file size limit (5MB)
  static getMaxFileSize(): number {
    return 5 * 1024 * 1024; // 5MB in bytes
  }

  // Validate file type for images
  static validateImageFile(file: File): boolean {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    return allowedTypes.includes(file.type);
  }

  // Validate file size
  static validateFileSize(file: File): boolean {
    return file.size <= this.getMaxFileSize();
  }

  // Complete file validation
  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!this.validateFileSize(file)) {
      return { isValid: false, error: "File size must be less than 5MB" };
    }

    if (!this.validateImageFile(file)) {
      return {
        isValid: false,
        error: "File must be an image (JPEG, PNG, WebP, or GIF)",
      };
    }

    return { isValid: true };
  }
}
