import { updatePassword as fbUpdatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function updateUserPassword(currentPassword: string, newPassword: string) {
  if (!auth.currentUser || !auth.currentUser.email) {
    throw new Error("No authenticated user");
  }
  // Re-authenticate user
  const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
  await reauthenticateWithCredential(auth.currentUser, credential);
  // Update password
  await fbUpdatePassword(auth.currentUser, newPassword);
}
