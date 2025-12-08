/* =========================================
   FIREBASE CONFIGURATION
   Kết nối đến dự án GreenTrip trên Google
   ========================================= */

// 1. Import thư viện từ CDN (Dành cho web chạy trực tiếp)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJUUgPSrWJhvh22gZ5-5X-EDm6fEwoFj4",
  authDomain: "greentrip-web.firebaseapp.com",
  projectId: "greentrip-web",
  storageBucket: "greentrip-web.firebasestorage.app",
  messagingSenderId: "573925579826",
  appId: "1:573925579826:web:49d5054c0a4b414c44b02b"
};

// 3. Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// 4. Khởi tạo Database (Firestore) và xuất ra để các file khác dùng
const db = getFirestore(app);

export { db };
