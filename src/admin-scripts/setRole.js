import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname support for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔐 Read service account JSON safely
const serviceAccountPath = path.join(
  __dirname,
  "serviceAccountKey.json"
);

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

// 🔥 Init Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 👇 PUT REAL UIDs HERE
const ADMIN_UID = "Kteq9dCTCnTngqyKoESl8Rk4f1j1";
const SUBADMIN_UID = "s52nGOjVApO1GBaXXQAO2ou7I6C3";

async function setRoles() {
  await admin.auth().setCustomUserClaims(ADMIN_UID, {
    role: "admin",
  });

  await admin.auth().setCustomUserClaims(SUBADMIN_UID, {
    role: "subadmin",
  });

  console.log("✅ Roles set successfully");
  process.exit(0);
}

setRoles().catch((err) => {
  console.error("❌ Error setting roles:", err);
  process.exit(1);
});

