import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,           
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebaseClient";
import {
  createOrUpdateUserInFirestore,
  getUserFromFirestore,
  updateUserFieldsInFirestore,
} from "./firestoreService";

export interface User {
  uid: string;
  email: string | null;
  username: string | null;        
  customCities: string[];
  selectedCity: string;
  loginTimestamp: number;
}

function mapFirebaseToAppUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    username: firebaseUser.displayName,   // ← Aquí usamos displayName
    customCities: ["Mexicali", "Tijuana", "Madrid", "Beijing", "Buenos Aires"],
    selectedCity: "Mexicali",
    loginTimestamp: Date.now(),
  };
}

export async function registerWithFirebase(
  name: string,
  email: string,
  password: string
): Promise<User | null> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;

    await updateProfile(firebaseUser, { displayName: name });

    const appUser: User = mapFirebaseToAppUser(firebaseUser);

    await createOrUpdateUserInFirestore(appUser);

    return appUser;
  } catch (error) {
    console.error("Error en registerWithFirebase:", error);
    return null;
  }
}

export async function loginWithFirebase(
  email: string,
  password: string
): Promise<User | null> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;

    const fromFs = await getUserFromFirestore(firebaseUser.uid);
    let appUser: User;

    if (fromFs) {
      appUser = fromFs;
    } else {
      appUser = mapFirebaseToAppUser(firebaseUser);
      await createOrUpdateUserInFirestore(appUser);
    }

    return appUser;
  } catch (error) {
    console.error("Error en loginWithFirebase:", error);
    return null;
  }
}

export async function logoutFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error en logoutFromFirebase:", error);
  }
}

export async function getCurrentFirebaseUser(): Promise<User | null> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const fromFs = await getUserFromFirestore(firebaseUser.uid);
  if (fromFs) {
    return fromFs;
  }

  const baseUser: User = mapFirebaseToAppUser(firebaseUser);
  await createOrUpdateUserInFirestore(baseUser);
  return baseUser;
}

export function startFirebaseAuthListener(): void {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const appUser = await getCurrentFirebaseUser();
      window.dispatchEvent(new CustomEvent("userStateChanged", { detail: appUser }));
    } else {
      window.dispatchEvent(new CustomEvent("userStateChanged", { detail: null }));
    }
  });
}

export async function updateAppUserExtras(user: User): Promise<void> {
  await updateUserFieldsInFirestore(user.uid, {
    customCities: user.customCities,
    selectedCity: user.selectedCity,
    loginTimestamp: user.loginTimestamp,
  });
  window.dispatchEvent(new CustomEvent("userStateChanged", { detail: user }));
}

export function isLoggedInFirebase(): boolean {
  return auth.currentUser !== null;
}
