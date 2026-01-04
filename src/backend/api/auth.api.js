import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export async function login(email, password) {
  if (!email || !password) {
    throw new Error("EMAIL_PASSWORD_REQUIRED");
  }

  await setPersistence(auth, browserLocalPersistence);

  const result = await signInWithEmailAndPassword(auth, email, password);

  const user = result.user;
  const token = await user.getIdToken();
  console.log(user,token);

  return { user, token }
}




export async function logout() {
  await signOut(auth);
  return true;
}

export async function register({ email, password, role = "user" }) {
  if (!email || !password) {
    throw new Error("EMAIL_PASSWORD_REQUIRED");
  }

  const result = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", result.user.uid), {
    email,
    role,
    createdAt: serverTimestamp(),
  });

  return result.user;
}
