import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// あなたのFirebase設定
const firebaseConfig = {
  apiKey: "AIzaSyBz-HV0B2bkcwXb7Lv2gtQsqX-ldvb9NO0",
  authDomain: "sentence-checker-1595d.firebaseapp.com",
  projectId: "sentence-checker-1595d",
  storageBucket: "sentence-checker-1595d.firebasestorage.app",
  messagingSenderId: "987027897244",
  appId: "1:987027897244:web:c80cba1feb361e41692659",
  measurementId: "G-WKKZ8PTCKQ"
};

// 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loadingArea = document.getElementById('auth-loading');
const formArea = document.getElementById('auth-form');

// 1. ログイン状態の監視と振り分け
onAuthStateChanged(auth, (user) => {
    if (user) {
        // ログイン済みならマイページへ
        window.location.href = "mypage.html";
    } else {
        // 未ログインならフォームを表示
        if(loadingArea) loadingArea.classList.add('hidden');
        if(formArea) formArea.classList.remove('hidden');
    }
});

// 2. ログイン・登録処理
const btnMain = document.getElementById('btn-main');
btnMain.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isLoginMode = document.getElementById('auth-title').innerText === "ログイン";

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
    } catch (error) {
        alert("エラーが発生しました: " + error.message);
    }
});
