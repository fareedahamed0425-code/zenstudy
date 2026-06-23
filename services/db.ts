import { db, storage } from "../firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserProfile } from "../types";

// Collection Reference
const USERS_COLLECTION = "users";

/**
 * Saves or updates a user profile in Firestore
 */
export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, profile.id);
    // Use setDoc with merge: true to avoid overwriting fields not passed
    await setDoc(userRef, profile, { merge: true });
    console.log("Profile saved to Firestore");
  } catch (error) {
    console.error("Error saving profile:", error);
    throw error;
  }
};

/**
 * Fetches a user profile from Firestore
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

/**
 * Uploads a profile image to Firebase Storage and returns the URL
 */
export const uploadProfileImage = async (uid: string, file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `profile_images/${uid}_${Date.now()}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
