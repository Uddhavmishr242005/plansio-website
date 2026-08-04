/* ============================================
   PLANSIO - IndexedDB Storage
   Handles large image/video uploads
   ============================================ */

const DB_NAME = 'plansio_media';
const DB_VER  = 1;
const STORE   = 'media';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(STORE, { keyPath: 'key' });
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

async function saveMedia(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx   = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    store.put({ key, value });
    tx.oncomplete = () => resolve(true);
    tx.onerror    = e => reject(e.target.error);
  });
}

async function getMedia(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE, 'readonly');
    const store  = tx.objectStore(STORE);
    const req    = store.get(key);
    req.onsuccess = e => resolve(e.target.result?.value || null);
    req.onerror   = e => reject(e.target.error);
  });
}

async function getAllMediaKeys() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE, 'readonly');
    const store  = tx.objectStore(STORE);
    const req    = store.getAllKeys();
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

// Export for use in other scripts
window.PlansioMedia = { saveMedia, getMedia, getAllMediaKeys };
