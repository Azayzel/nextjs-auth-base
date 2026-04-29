import * as admin from 'firebase-admin';

// The service account key file is required for server-side Firebase Admin.
// Add firebaseServiceAccountKey.json to your project root (keep it in .gitignore).
let serviceAccount: admin.ServiceAccount;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  serviceAccount = require('../../../firebaseServiceAccountKey.json');
} catch {
  serviceAccount = {} as admin.ServiceAccount;
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export default admin;
