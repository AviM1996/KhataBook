import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "./firebase";

export const login = async (email, password) => {
  await setPersistence(auth, browserLocalPersistence);
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => signOut(auth);
