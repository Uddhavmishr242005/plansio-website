let admin = null;

try {
  const firebaseAdmin = require('firebase-admin');
  
  if (!firebaseAdmin.apps.length && 
      process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_PRIVATE_KEY !== 'your_private_key') {
    
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    admin = firebaseAdmin;
    console.log('✅ Firebase initialized');
  } else {
    console.log('⚠️  Firebase not configured — OTP via Firebase disabled');
    admin = { auth: () => ({ verifyIdToken: async () => { throw new Error('Firebase not configured'); } }) };
  }
} catch(e) {
  console.log('⚠️  Firebase init skipped:', e.message);
  admin = { auth: () => ({ verifyIdToken: async () => { throw new Error('Firebase not configured'); } }) };
}

module.exports = admin;
