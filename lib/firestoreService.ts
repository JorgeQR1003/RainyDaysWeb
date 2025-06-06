// lib/firestoreService.ts
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseClient";
import type { User } from "./firebaseAuth";

const usersCollection = (uid: string) => doc(db, "users", uid);

export async function createOrUpdateUserInFirestore(user: User): Promise<void> {
  const ref = usersCollection(user.uid);
  await setDoc(
    ref,
    {
      username: user.username,
      email: user.email,
      customCities: user.customCities,
      selectedCity: user.selectedCity,
      loginTimestamp: user.loginTimestamp,
    },
    { merge: true }
  );
}

export async function getUserFromFirestore(uid: string): Promise<User | null> {
  const ref = usersCollection(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    username: data.username as string,
    email: data.email as string,
    customCities: data.customCities as string[],
    selectedCity: data.selectedCity as string,
    loginTimestamp: data.loginTimestamp as number,
  };
}

export async function updateUserFieldsInFirestore(
  uid: string,
  fields: Partial<Pick<User, "customCities" | "selectedCity" | "loginTimestamp">>
): Promise<void> {
  const ref = usersCollection(uid);
  await updateDoc(ref, fields);
}
